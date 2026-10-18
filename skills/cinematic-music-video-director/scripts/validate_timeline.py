#!/usr/bin/env python3
"""Hard-gate a frame-accurate shot plan against the measured music map."""
from __future__ import annotations
import argparse, json, math
from pathlib import Path

def nearest(t, arr):
    if not arr: return 999.0, None
    best = min(arr, key=lambda x: abs(x - t))
    return abs(best - t), best

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timeline", required=True)
    ap.add_argument("--audiomap", required=True)
    ap.add_argument("--out", default="analysis/timeline_validation.md")
    ap.add_argument("--cut-tolerance", type=float, default=.45)
    ap.add_argument("--fps", type=float)
    a = ap.parse_args()
    tl = json.loads(Path(a.timeline).read_text())
    am = json.loads(Path(a.audiomap).read_text())
    fps = a.fps or float(tl.get("fps", am.get("fps", 24)))
    shots = tl["shots"]
    total = int(tl.get("total_frames") or math.ceil(float(am["duration"]) * fps))
    hard, soft = [], []
    # coverage
    if shots[0]["start_frame"] != 0: hard.append(f"first shot starts at {shots[0]['start_frame']}, not 0")
    if shots[-1]["end_frame"] < total: hard.append(f"last shot ends at {shots[-1]['end_frame']}, total is {total}")
    for x, y in zip(shots, shots[1:]):
        if x["end_frame"] != y["start_frame"]:
            hard.append(f"gap/overlap between {x['id']} ({x['end_frame']}) and {y['id']} ({y['start_frame']})")
    for s in shots:
        if s["end_frame"] <= s["start_frame"]: hard.append(f"{s['id']} has non-positive duration")
        if s.get("start_frame") != round(s.get("start", s["start_frame"] / fps) * fps):
            soft.append(f"{s['id']} start time and start_frame disagree")
    # lyrics
    lyr = am.get("lyrics", {}).get("lines", [])
    refs = []
    for s in shots: refs += s.get("lyric_refs", [])
    missing = [f"L{i+1:02d}" for i in range(len(lyr)) if f"L{i+1:02d}" not in set(refs)]
    dup = sorted({x for x in refs if refs.count(x) > 1})
    if missing: hard.append("lyric lines not assigned to any shot: " + ", ".join(missing))
    if dup: soft.append("lyric lines assigned to more than one shot: " + ", ".join(dup))
    # cut alignment
    beats = am.get("tempo", {}).get("beats", [])
    lyr_t = [x.get("phrase_start", x.get("start")) for x in lyr]
    sec_t = [x["start"] for x in am.get("sections", [])] + [am.get("duration", 0)]
    cut_rows = []
    for s in shots[1:]:
        t = s["start_frame"] / fps
        db, b = nearest(t, beats); dl, l = nearest(t, lyr_t); ds, sec = nearest(t, sec_t)
        ok = min(db, dl, ds) <= a.cut_tolerance or s.get("intentional_offgrid")
        if not ok: soft.append(f"{s['id']} cut at {t:.2f}s is >{a.cut_tolerance}s from beat/lyric/section")
        cut_rows.append((s["id"], t, db, dl, ds, ok))
    # section coverage
    for sec in am.get("sections", []):
        if not any(s["start_frame"] / fps < sec["end"] and s["end_frame"] / fps > sec["start"] for s in shots):
            hard.append(f"section {sec.get('id')} has no shot")
    md = ["# Timeline validation", "", f"- FPS: {fps}", f"- Total frames: {total}", f"- Shots: {len(shots)}",
          f"- Lyric lines: {len(lyr)}; assigned refs: {len(set(refs))}", "", "## Hard gates", ""]
    if hard: md += [f"- **FAIL** {x}" for x in hard]
    else: md += ["- PASS: contiguous, complete, lyric coverage present."]
    md += ["", "## Soft findings", ""]
    md += ([f"- {x}" for x in soft] if soft else ["- none"])
    md += ["", "## Cut-to-music audit", "", "| shot | cut s | nearest beat | nearest lyric | nearest section | ok |", "|---|---:|---:|---:|---:|:--:|"]
    for r in cut_rows[:80]: md.append(f"| {r[0]} | {r[1]:.2f} | {r[2]:.2f} | {r[3]:.2f} | {r[4]:.2f} | {'yes' if r[5] else 'flag'} |")
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text("\n".join(md) + "\n")
    print(json.dumps({"hard": len(hard), "soft": len(soft), "shots": len(shots), "report": a.out}, indent=1))
    if hard:
        for x in hard: print("HARD:", x)
        raise SystemExit(1)

if __name__ == "__main__":
    main()
