#!/usr/bin/env python3
"""Align lyric lines to a supplied ASR transcript without inventing timing.

Inputs
  --lyrics  song.lrc or song.srt
  --asr     optional Whisper JSON (mlx/faster/openai), with segments or words
  --out     output directory (lyrics_aligned.json + lyrics_aligned.srt)

The output keeps two different times:
  phrase_start : the LRC/SRT mark (a bar/phrase marker; use for cuts)
  vocal_start  : the first sung syllable (ASR + optional word anchoring; use for captions)

If no ASR is supplied, vocal_start equals phrase_start and status is "phrase_only".
That is honest but not a vocal alignment; do not label it as one.
"""
from __future__ import annotations
import argparse, json, re
from pathlib import Path

CJK = re.compile(r"[\u3400-\u9fff]")

def parse_lrc(text):
    rows = []
    for raw in text.splitlines():
        stamps = re.findall(r"\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]", raw)
        if not stamps: continue
        body = re.sub(r"\[[^\]]*\]", "", raw).strip()
        if not body: continue
        for mm, ss in stamps:
            rows.append((int(mm) * 60 + float(ss), body))
    rows.sort(key=lambda x: x[0]); return rows

def parse_srt(text):
    out = []
    for block in re.split(r"\n\s*\n", text.strip()):
        lines = block.strip().splitlines()
        if len(lines) < 3 or "-->" not in lines[1]: continue
        a, b = lines[1].split("-->")
        out.append((ts(a), ts(b), " ".join(lines[2:]).strip()))
    return out

def ts(x):
    h, m, s = x.strip().replace(",", ".").split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)

def fmt(t):
    ms = int(round(t * 1000)); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def norm(s):
    return re.sub(r"[^\u3400-\u9fffA-Za-z0-9]", "", s).lower()

def load_asr(path):
    raw = json.loads(Path(path).read_text())
    segs = raw.get("segments", raw) if isinstance(raw, dict) else raw
    out = []
    for s in segs:
        st = float(s.get("start", 0)); en = float(s.get("end", st + 2))
        words = s.get("words") or []
        out.append({"start": st, "end": en, "text": s.get("text", ""), "words": words})
    out.sort(key=lambda x: x["start"]); return out

def best_segment(line, segs, used):
    target = norm(line["text"]); best = None
    for i, s in enumerate(segs):
        if i in used: continue
        cand = norm(s["text"])
        if not cand: continue
        overlap = len(set(target) & set(cand)) / max(1, len(set(target)))
        # time prior: a line is usually within +/- 3 s of its phrase mark
        prior = min(abs(s["start"] - line["phrase_start"]), 3.0)
        score = overlap - prior * 0.05
        if best is None or score > best[0]: best = (score, i, s, overlap)
    if best and best[3] >= 0.25: return best[2], best[3]
    return None, 0.0

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lyrics", required=True); ap.add_argument("--asr")
    ap.add_argument("--out", default="analysis")
    ap.add_argument("--max-line", type=float, default=8.0)
    a = ap.parse_args()
    p = Path(a.lyrics)
    if p.suffix.lower() == ".lrc":
        rows = parse_lrc(p.read_text()); kind = "lrc"
    else:
        rows = [(x[0], x[2]) for x in parse_srt(p.read_text())]; kind = "srt"
    raw_lines = []
    for r in rows:
        st, txt = r[0], r[1]
        if not CJK.search(txt): continue
        raw_lines.append({"phrase_start": round(float(st), 3), "text": txt.strip()})
    raw_lines.sort(key=lambda x: x["phrase_start"])
    segs = load_asr(a.asr) if a.asr and Path(a.asr).exists() else []
    used = set(); lines = []
    for i, ln in enumerate(raw_lines):
        nxt = raw_lines[i + 1]["phrase_start"] if i + 1 < len(raw_lines) else ln["phrase_start"] + 5
        seg, overlap = best_segment(ln, segs, used) if segs else (None, 0)
        if seg:
            vocal = seg["start"]
            # If the ASR word timestamps exist, use the first word within the segment.
            if seg.get("words"):
                w = seg["words"][0]
                if isinstance(w, dict) and w.get("start") is not None:
                    vocal = max(seg["start"], float(w["start"]))
            used.add(segs.index(seg))
            status = "asr_cross_checked" if overlap >= .55 else "asr_weak_match"
        else:
            vocal = ln["phrase_start"]
            status = "phrase_only"
        end = max(vocal + 1.2, min(nxt - .15, vocal + a.max_line))
        lines.append({**ln, "vocal_start": round(vocal, 3), "vocal_end": round(end, 3),
                      "status": status, "asr_overlap": round(overlap, 3), "index": i + 1})
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    (out / "lyrics_aligned.json").write_text(json.dumps({"lines": lines, "source": str(p),
        "note": "phrase_start is the supplied mark; vocal_start is ASR-derived and must be reviewed"}, ensure_ascii=False, indent=1))
    with (out / "lyrics_aligned.srt").open("w") as f:
        for l in lines:
            f.write(f"{l['index']}\n{fmt(l['vocal_start'])} --> {fmt(l['vocal_end'])}\n{l['text']}\n\n")
    print(json.dumps({"lines": len(lines), "with_asr": sum(1 for l in lines if l['status'].startswith('asr')),
                      "phrase_only": sum(1 for l in lines if l['status'] == 'phrase_only')}, indent=1))

if __name__ == "__main__":
    main()
