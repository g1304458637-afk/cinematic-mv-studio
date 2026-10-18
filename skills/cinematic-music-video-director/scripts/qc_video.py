#!/usr/bin/env python3
"""Technical QC for the delivered MP4. Visual judgement remains human/agent work."""
from __future__ import annotations
import argparse, json, math, re, subprocess
from pathlib import Path

def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr

def probe(path):
    rc, out, err = run(["ffprobe","-v","error","-show_streams","-show_format","-of","json",str(path)])
    if rc: raise SystemExit(err)
    return json.loads(out)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video"); ap.add_argument("--audio")
    ap.add_argument("--expected-frames", type=int)
    ap.add_argument("--timeline")
    ap.add_argument("--out", default="analysis/qc")
    ap.add_argument("--duration-tol", type=float, default=.12)
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    info = probe(a.video)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    aud = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    dur = float(info["format"]["duration"])
    hard, soft = [], []
    if not v: hard.append("no video stream")
    if not aud: hard.append("no audio stream")
    if v:
        if (v.get("width"), v.get("height")) != (1080, 1920): hard.append(f"resolution {v.get('width')}x{v.get('height')}")
        if v.get("codec_name") != "h264": hard.append(f"video codec {v.get('codec_name')}")
        if v.get("pix_fmt") != "yuv420p": soft.append(f"pix_fmt {v.get('pix_fmt')}")
        if v.get("r_frame_rate") not in ("24/1", "30/1"): hard.append(f"fps {v.get('r_frame_rate')}")
    if aud and aud.get("codec_name") != "aac": hard.append(f"audio codec {aud.get('codec_name')}")
    # frame count
    rc, out2, _ = run(["ffprobe","-v","error","-count_frames","-select_streams","v:0","-show_entries","stream=nb_read_frames","-of","csv=p=0",a.video])
    frames = int(out2.strip().rstrip(",")) if out2.strip() else 0
    if a.expected_frames and abs(frames - a.expected_frames) > 1:
        hard.append(f"frame count {frames} != expected {a.expected_frames}")
    # audio duration
    if a.audio:
        ai = probe(a.audio); ad = float(ai["format"]["duration"])
        if abs(dur - ad) > a.duration_tol: hard.append(f"duration {dur:.3f} != audio {ad:.3f} (tol {a.duration_tol})")
    # decode
    rc, _, err = run(["ffmpeg","-v","error","-i",a.video,"-f","null","-"])
    if rc or err.strip(): hard.append("decode errors: " + err.strip()[:400])
    # black / freeze
    rc, _, err = run(["ffmpeg","-hide_banner","-nostats","-i",a.video,"-vf","blackdetect=d=0.3:pix_th=0.06","-f","null","-"])
    blacks = re.findall(r"black_start:([\d.]+).*?black_end:([\d.]+)", err)
    rc, _, err2 = run(["ffmpeg","-hide_banner","-nostats","-i",a.video,"-vf","freezedetect=n=0.003:d=0.8","-f","null","-"])
    freezes = re.findall(r"freeze_start:([\d.]+).*?freeze_duration:([\d.]+).*?freeze_end:([\d.]+)", err2, re.S)
    if blacks: hard.append(f"{len(blacks)} black segments >=0.3s")
    if freezes: soft.append(f"{len(freezes)} freezes >=0.8s (inspect whether intentional)")
    # coverage
    coverage = None
    if a.timeline:
        tl = json.loads(Path(a.timeline).read_text())
        cov = sum(s["end_frame"] - s["start_frame"] for s in tl["shots"])
        coverage = {"shots": len(tl["shots"]), "frames": cov, "total": tl.get("total_frames")}
        if cov != tl.get("total_frames"): hard.append(f"timeline covers {cov}, total {tl.get('total_frames')}")
    # contact sheets
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",a.video,"-vf","fps=1/12,scale=270:480,tile=5x4","-frames:v","1",str(out/"contact_film.jpg")])
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-i",a.video,"-vf","fps=1/2,scale=180:320,tile=10x8","-frames:v","1",str(out/"contact_dense.jpg")])
    report = {"file": a.video, "duration": dur, "frames": frames, "video": v, "audio": aud,
              "hard": hard, "soft": soft, "black_segments": blacks, "freezes": freezes[:20],
              "coverage": coverage, "contact_sheets": [str(out/"contact_film.jpg"), str(out/"contact_dense.jpg")]}
    (out/"qc.json").write_text(json.dumps(report, indent=1))
    md = ["# QC report", "", f"- File: `{a.video}`", f"- Duration: {dur:.3f}s", f"- Frames: {frames}", "",
          "## Streams", "", f"- Video: {v.get('codec_name') if v else 'none'} {v.get('width') if v else ''}x{v.get('height') if v else ''} {v.get('r_frame_rate') if v else ''} {v.get('pix_fmt') if v else ''}",
          f"- Audio: {aud.get('codec_name') if aud else 'none'} {aud.get('sample_rate') if aud else ''} Hz {aud.get('channels') if aud else ''} ch", "",
          "## Hard gates", ""]
    md += [f"- **FAIL** {x}" for x in hard] if hard else ["- PASS: decodes, streams/resolution/fps/audio/duration/frame count are consistent."]
    md += ["", "## Soft findings", ""] + ([f"- {x}" for x in soft] if soft else ["- none"])
    md += ["", "## Black / freeze", "", f"- black segments: {len(blacks)}", f"- freezes >=0.8s: {len(freezes)} (inspect; a deliberate hold is allowed)"]
    if coverage: md += ["", "## Coverage", "", json.dumps(coverage)]
    md += ["", "## Evidence", "", f"- `{out/'contact_film.jpg'}` (5x4 film sheet)", f"- `{out/'contact_dense.jpg'}` (dense sheet)", "", "> This script proves the file, not the film. A visual pass at native resolution is still required."]
    (out/"qc.md").write_text("\n".join(md) + "\n")
    print(json.dumps({"hard": len(hard), "soft": len(soft), "frames": frames, "duration": dur, "report": str(out/"qc.md")}, indent=1))
    if hard:
        for x in hard: print("HARD:", x)
        raise SystemExit(1)

if __name__ == "__main__":
    main()
