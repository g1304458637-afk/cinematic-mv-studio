#!/usr/bin/env python3
"""Deterministic music analysis for a code-drawn music video.

This script produces the machine-readable *music master* every later stage must
obey: duration, tempo grid, beats/downbeats, energy/spectral curves, candidate
climax windows, section proposals, and lyric timing.

It never invents lyric timestamps.  A line supplied as plain text gets
``timing: "untimed"`` and is excluded from captions until a human or an
alignment pass supplies evidence.

Usage:
  python analyze_music.py song.m4a --out analysis/ \
      [--lrc song.lrc | --srt song.srt] [--sections sections.json] \
      [--asr whisper_segments.json] [--fps 24]

Requires: ffmpeg, numpy, scipy, librosa, soundfile. matplotlib is optional.
Licenses: this script is MIT; librosa is ISC; ffmpeg is used as a subprocess.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np


# --------------------------------------------------------------------------- #
# I/O
# --------------------------------------------------------------------------- #
def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def decode_audio(audio: Path, sr: int = 22050) -> np.ndarray:
    """Decode anything ffmpeg understands to mono float32 at ``sr``."""
    with tempfile.TemporaryDirectory() as td:
        wav = Path(td) / "decoded.wav"
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", str(audio), "-vn",
             "-ac", "1", "-ar", str(sr), "-c:a", "pcm_f32le", str(wav)],
            check=True,
        )
        import soundfile as sf
        y, _ = sf.read(str(wav), dtype="float32")
    return np.asarray(y, dtype=np.float32)


def parse_lrc(text: str):
    """Parse LRC into [(seconds, text)]. Metadata and credit lines are kept;
    the caller filters them.  Multiple timestamps per line are expanded."""
    rows = []
    for raw in text.splitlines():
        stamps = re.findall(r"\[(\d{1,2}):(\d{2}(?:\.\d{1,3})?)\]", raw)
        if not stamps:
            continue
        body = re.sub(r"\[[^\]]*\]", "", raw).strip()
        if not body:
            continue
        for mm, ss in stamps:
            rows.append((int(mm) * 60 + float(ss), body))
    rows.sort(key=lambda x: x[0])
    return rows


def parse_srt(text: str):
    rows = []
    for block in re.split(r"\n\s*\n", text.strip()):
        lines = block.strip().splitlines()
        if len(lines) < 3 or "-->" not in lines[1]:
            continue
        a, b = lines[1].split("-->")
        rows.append((srt_time(a), srt_time(b), " ".join(lines[2:]).strip()))
    return rows


def srt_time(x: str) -> float:
    h, m, rest = x.strip().replace(",", ".").split(":")
    return int(h) * 3600 + int(m) * 60 + float(rest)


def fmt_srt(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


# --------------------------------------------------------------------------- #
# Tempo
# --------------------------------------------------------------------------- #
def fit_constant_grid(beats: np.ndarray, lo: float = 0.60, hi: float = 1.00):
    """Phase-fit a constant grid to detected beats.

    Returns (period, offset, coherence, inlier_count).  This is a standard
    circular-coherence fit; the practical lesson (from the MIT-licensed
    beatgrid.py reference) is that librosa's raw tempo estimate can be 1-2%
    off, which drifts a full beat over a long song.
    """
    import cmath
    if len(beats) < 8:
        raise ValueError("need at least 8 detected beats")
    best = []
    p = lo
    while p <= hi:
        z = sum(cmath.exp(2j * math.pi * float(t) / p) for t in beats) / len(beats)
        best.append((abs(z), p, cmath.phase(z)))
        p += 0.00005
    top = max(b[0] for b in best)
    near = [b for b in best if b[0] >= top * 0.98]
    coh, period, ph = min(near, key=lambda b: abs(b[1] - 0.833))
    offset = (ph / (2 * math.pi) * period) % period
    for _ in range(4):
        pts = [(round((float(t) - offset) / period), float(t)) for t in beats]
        pts = [(n, t) for n, t in pts if abs(t - offset - n * period) < period / 4]
        if len(pts) < 8:
            break
        m = len(pts)
        sn = sum(n for n, _ in pts)
        st = sum(t for _, t in pts)
        snn = sum(n * n for n, _ in pts)
        snt = sum(n * t for n, t in pts)
        den = m * snn - sn * sn
        if abs(den) < 1e-9:
            break
        period = (m * snt - sn * st) / den
        offset = (st - period * sn) / m
    return float(period), float(offset % period), float(coh), len(pts)


def choose_downbeat_phase(y, sr, period, offset, hop=512):
    """Score the four bar phases by low-band (kick/bass) energy and onset.

    Returns (phase, scores).  A high score is evidence, not proof; the
    storyboard validator still checks section cuts against bar lines.
    """
    import librosa
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    low = S[(freqs >= 30) & (freqs <= 160)].mean(axis=0)
    onset = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    n = int((len(y) / sr - offset) / period) + 1
    grid = offset + period * np.arange(max(0, n))
    idx = np.clip((grid * sr / hop).astype(int), 0, len(low) - 1)
    scores = []
    for ph in range(4):
        ids = idx[ph::4]
        if len(ids) == 0:
            scores.append(0.0)
            continue
        scores.append(float(np.mean(low[ids]) + 0.4 * np.mean(onset[np.clip(ids, 0, len(onset) - 1)])))
    # Normalise for readability, then pick the max.
    arr = np.asarray(scores, dtype=float)
    arr = arr / (arr.max() + 1e-12)
    return int(np.argmax(arr)), [round(float(x), 4) for x in arr]


# --------------------------------------------------------------------------- #
# Lyrics
# --------------------------------------------------------------------------- #
CJK = re.compile(r"[\u3400-\u9fff]")


def is_credit(text: str) -> bool:
    t = text.strip()
    if not CJK.search(t):
        return True
    if re.search(r"作词|作曲|编曲|制作人|录音|混音|母带|吉他|弦乐|和声|PRODUCER|ENGINEER", t, re.I):
        return True
    if t in {"…", "...", "——"}:
        return True
    return False


def clean_text(t: str) -> str:
    return re.sub(r"\s+", " ", t.replace("\u3000", " ")).strip()


def build_lyrics(rows, kind: str, duration: float, asr_segments=None):
    """rows: (start, text) for LRC or (start, end, text) for SRT."""
    items = []
    for r in rows:
        if kind == "lrc":
            st, txt = r
            en = None
        else:
            st, en, txt = r
        txt = clean_text(txt)
        if not txt or is_credit(txt):
            continue
        items.append({"start": float(st), "end": en, "text": txt})
    items.sort(key=lambda x: x["start"])

    # LRC carries no end time.  Use the next line start as a hard boundary,
    # leave a 120 ms caption gap, and cap very long gaps honestly at 8 s.
    for i, item in enumerate(items):
        if item["end"] is None:
            nxt = items[i + 1]["start"] if i + 1 < len(items) else duration
            gap = max(0.0, nxt - item["start"])
            item["end"] = min(duration, item["start"] + max(1.2, min(8.0, gap - 0.12)))
        item["duration"] = round(item["end"] - item["start"], 3)
        item["timing"] = "lrc_line" if kind == "lrc" else "srt_line"
        item["char_count"] = len(CJK.findall(item["text"]))

    if asr_segments:
        norm = lambda s: re.sub(r"[^\u3400-\u9fffA-Za-z0-9]", "", s).lower()
        for item in items:
            target = norm(item["text"])
            best = None
            for seg in asr_segments:
                cand = norm(seg.get("text", ""))
                if not cand:
                    continue
                overlap = len(set(target) & set(cand)) / max(1, len(set(target)))
                d = abs(float(seg.get("start", 0)) - item["start"])
                score = overlap - min(d, 8.0) * 0.02
                if best is None or score > best[0]:
                    best = (score, seg, overlap, d)
            if best:
                _, seg, overlap, d = best
                item["asr"] = {
                    "start": round(float(seg.get("start", 0)), 3),
                    "end": round(float(seg.get("end", 0)), 3),
                    "text": seg.get("text", ""),
                    "char_overlap": round(float(overlap), 3),
                    "delta": round(float(seg.get("start", 0)) - item["start"], 3),
                }
                if overlap >= 0.55 and abs(d) <= 1.0:
                    item["timing"] = "cross_checked"
                elif overlap >= 0.35:
                    item["timing"] = "asr_conflict"
    return items


# --------------------------------------------------------------------------- #
# Sections / climax
# --------------------------------------------------------------------------- #
def normalize(x):
    x = np.asarray(x, dtype=float)
    lo, hi = np.nanpercentile(x, 5), np.nanpercentile(x, 95)
    return np.clip((x - lo) / (hi - lo + 1e-12), 0, 1)


def propose_sections(energy_t, db, duration, manual=None):
    """Manual sections win; automatic boundaries are a cross-check only."""
    if manual:
        secs = []
        for i, s in enumerate(manual):
            s = dict(s)
            s.setdefault("id", f"s{i+1}")
            s.setdefault("label", s["id"])
            s["start"] = float(s["start"])
            s["end"] = float(s["end"])
            secs.append(s)
        secs.sort(key=lambda s: s["start"])
        return secs
    # Fallback: 16 s blocks labelled by relative energy.  Deliberately generic;
    # a director should supply a real section map.
    secs = []
    step = 16.0
    t = 0.0
    i = 0
    while t < duration - 0.1:
        e = float(np.mean(db[(energy_t >= t) & (energy_t < min(duration, t + step))])) if np.any((energy_t >= t) & (energy_t < t + step)) else -60
        secs.append({"id": f"block{i+1}", "label": f"Section {i+1}", "start": round(t, 3),
                     "end": round(min(duration, t + step), 3), "mean_db": round(e, 2)})
        t += step
        i += 1
    return secs


def climax_windows(energy_t, rms, onset_t, onset, duration, win=4.0, step=1.0, top=8):
    """Candidate climaxes from loudness + positive onset density.

    These are candidates for the director, never automatic cut commands.
    """
    out = []
    t = 1.0
    while t + win < duration - 1.0:
        m = (energy_t >= t) & (energy_t < t + win)
        mo = (onset_t >= t) & (onset_t < t + win)
        if m.any() and mo.any():
            e = float(np.mean(rms[m]))
            o = float(np.max(onset[mo]))
            out.append({"start": round(t, 3), "end": round(t + win, 3),
                        "energy": round(e, 5), "onset": round(o, 5)})
        t += step
    if not out:
        return [], []
    ev = normalize([x["energy"] for x in out])
    ov = normalize([x["onset"] for x in out])
    for i, x in enumerate(out):
        x["score"] = round(float(0.65 * ev[i] + 0.35 * ov[i]), 4)
    out.sort(key=lambda x: -x["score"])
    picked = []
    for x in out:
        if all(x["end"] <= y["start"] or x["start"] >= y["end"] for y in picked):
            picked.append(x)
        if len(picked) >= top:
            break
    picked.sort(key=lambda x: x["start"])
    # Short impact windows (2 s) inside the most energetic regions.
    short = []
    for x in picked[:4]:
        short.append({"start": x["start"], "end": round(x["start"] + 2.0, 3),
                      "score": x["score"], "parent": [x["start"], x["end"]]})
    return picked, short


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("audio", type=Path)
    ap.add_argument("--out", type=Path, default=Path("analysis"))
    ap.add_argument("--lrc", type=Path)
    ap.add_argument("--srt", type=Path)
    ap.add_argument("--sections", type=Path, help="manual section map JSON")
    ap.add_argument("--asr", type=Path, help="Whisper segments JSON (optional witness)")
    ap.add_argument("--fps", type=float, default=24.0)
    ap.add_argument("--bpm", type=float, help="override BPM (director decision)")
    ap.add_argument("--offset", type=float, help="override beat-grid offset seconds")
    ap.add_argument("--no-plots", action="store_true")
    args = ap.parse_args()

    import librosa
    from scipy.ndimage import uniform_filter1d

    args.out.mkdir(parents=True, exist_ok=True)
    (args.out / "audio").mkdir(exist_ok=True)
    y = decode_audio(args.audio)
    sr = 22050
    duration = len(y) / sr
    hop = 512
    fps_analysis = sr / hop

    # ---- beat / tempo ----
    onset_env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    _, y_perc = librosa.effects.hpss(y)
    tempo_raw, beat_frames = librosa.beat.beat_track(
        y=y_perc, sr=sr, hop_length=hop, start_bpm=args.bpm or 72.0, trim=False
    )
    beats = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop)
    try:
        period, offset, coh, inliers = fit_constant_grid(beats)
        bpm = 60.0 / period
    except Exception as e:
        print(f"[warn] tempo fit failed ({e}); using librosa tempo", file=sys.stderr)
        bpm = float(np.atleast_1d(tempo_raw)[0])
        period = 60.0 / bpm
        offset = float(beats[0]) if len(beats) else 0.0
        coh, inliers = 0.0, 0
    if args.bpm:
        bpm = float(args.bpm)
        period = 60.0 / bpm
    if args.offset is not None:
        offset = float(args.offset) % period
    phase, phase_scores = choose_downbeat_phase(y, sr, period, offset)
    downbeats = [round(float(offset + (4 * k + phase) * period), 3)
                 for k in range(int((duration - offset) / period / 4) + 1)]
    bars = [{"index": i, "start": d, "end": round(min(duration, d + 4 * period), 3)}
            for i, d in enumerate(downbeats)]
    beat_list = [round(float(offset + k * period), 3)
                 for k in range(int((duration - offset) / period) + 1)]

    # ---- features ----
    rms = librosa.feature.rms(y=y, hop_length=hop)[0]
    energy_t = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
    db = 20 * np.log10(rms + 1e-9)
    cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=hop)[0]
    roll = librosa.feature.spectral_rolloff(y=y, sr=sr, hop_length=hop)[0]
    flat = librosa.feature.spectral_flatness(y=y, hop_length=hop)[0]
    zcr = librosa.feature.zero_crossing_rate(y, hop_length=hop)[0]
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
    harmonic, percussive = librosa.effects.hpss(y)
    rms_h = librosa.feature.rms(y=harmonic, hop_length=hop)[0]
    band_vocal = librosa.feature.rms(y=librosa.effects.preemphasis(y), hop_length=hop)[0]
    onset_t = librosa.frames_to_time(np.arange(len(onset_env)), sr=sr, hop_length=hop)
    # 0.25 s control-rate curves (also the curve used by QC/plotting)
    grid = np.arange(0, duration, 0.25)
    def resample(x, t):
        return np.interp(grid, t, x)
    energy_curve = {
        "step": 0.25,
        "time": [round(float(t), 3) for t in grid],
        "rms": [round(float(v), 5) for v in resample(rms, energy_t)],
        "db": [round(float(v), 2) for v in resample(db, energy_t)],
        "onset": [round(float(v), 5) for v in resample(onset_env, onset_t)],
        "centroid": [round(float(v), 1) for v in resample(cent, energy_t)],
        "flatness": [round(float(v), 5) for v in resample(flat, energy_t)],
        "vocal_band": [round(float(v), 5) for v in resample(band_vocal, energy_t)],
        "harmonic_ratio": [round(float(v / (r + 1e-9)), 4) for v, r in zip(resample(rms_h, energy_t), resample(rms, energy_t))],
    }

    # ---- sections ----
    manual = json.loads(args.sections.read_text()) if args.sections else None
    sections = propose_sections(energy_t, db, duration, manual)
    for s in sections:
        m = (energy_t >= s["start"]) & (energy_t < s["end"])
        if m.any():
            s.setdefault("mean_db", round(float(np.mean(db[m])), 2))
            s.setdefault("peak_db", round(float(np.max(db[m])), 2))
            s.setdefault("mean_onset", round(float(np.mean(onset_env[(onset_t >= s["start"]) & (onset_t < s["end"])])), 4))
            s["duration"] = round(s["end"] - s["start"], 3)

    long_climax, short_climax = climax_windows(energy_t, rms, onset_t, onset_env, duration)

    # ---- lyrics ----
    lyrics = []
    lyr_source = "none"
    if args.lrc:
        lyrics = build_lyrics(parse_lrc(args.lrc.read_text()), "lrc", duration)
        lyr_source = str(args.lrc)
    elif args.srt:
        lyrics = build_lyrics(parse_srt(args.srt.read_text()), "srt", duration)
        lyr_source = str(args.srt)
    asr_segments = None
    if args.asr and args.asr.exists():
        raw = json.loads(args.asr.read_text())
        asr_segments = raw.get("segments", raw) if isinstance(raw, dict) else raw
        lyrics = build_lyrics(parse_lrc(args.lrc.read_text()), "lrc", duration, asr_segments) if args.lrc else lyrics

    total = len(lyrics)
    checked = sum(1 for x in lyrics if x["timing"] == "cross_checked")

    master = {
        "schema": "cinematic-mv.audiomap/1",
        "source": str(args.audio),
        "sha256": sha256(args.audio),
        "duration": round(duration, 4),
        "sample_rate": sr,
        "fps": args.fps,
        "tempo": {
            "bpm": round(bpm, 4),
            "beat_period": round(period, 6),
            "beat_offset": round(offset, 6),
            "coherence": round(coh, 4),
            "inliers": inliers,
            "librosa_raw_bpm": round(float(np.atleast_1d(tempo_raw)[0]), 4),
            "downbeat_phase": phase,
            "downbeat_phase_scores": phase_scores,
            "beats": beat_list,
            "downbeats": downbeats,
            "bars": bars,
        },
        "sections": sections,
        "climax_windows": long_climax,
        "impact_windows": short_climax,
        "energy": energy_curve,
        "lyrics": {
            "source": lyr_source,
            "line_count": total,
            "cross_checked_count": checked,
            "lines": lyrics,
        },
        "notes": [
            "Tempo is a constant-grid phase fit; verify local drift before using it for long continuous motion.",
            "Climax windows are candidates from loudness/onset, not automatic emotional decisions.",
            "Lyric timings retain their source; cross_checked means Whisper agreed within 1s and 0.55 char overlap.",
        ],
    }
    (args.out / "audiomap.json").write_text(json.dumps(master, ensure_ascii=False, indent=1))
    (args.out / "lyrics.json").write_text(json.dumps({"lines": lyrics}, ensure_ascii=False, indent=1))
    with (args.out / "lyrics.srt").open("w") as f:
        for i, line in enumerate(lyrics, 1):
            f.write(f"{i}\n{fmt_srt(line['start'])} --> {fmt_srt(line['end'])}\n{line['text']}\n\n")

    # ---- report ----
    md = [f"# Music analysis — {args.audio.name}", "",
          f"- Duration: **{duration:.3f} s** ({int(duration//60)}:{duration%60:05.2f})",
          f"- Tempo: **{bpm:.3f} BPM** (period {period:.4f} s, offset {offset:.3f} s, coherence {coh:.3f})",
          f"- Downbeat phase: {phase} (scores {phase_scores})",
          f"- Lyrics: {total} timed lines; {checked} cross-checked with ASR", ""]
    md += ["## Sections", "", "| id | label | start | end | dur | mean dB | peak dB |", "|---|---|---:|---:|---:|---:|---:|"]
    for s in sections:
        md.append(f"| {s['id']} | {s['label']} | {s['start']:.2f} | {s['end']:.2f} | {s.get('duration',0):.2f} | {s.get('mean_db','')} | {s.get('peak_db','')} |")
    md += ["", "## Climax candidates", ""]
    for w in long_climax:
        md.append(f"- {w['start']:.2f}–{w['end']:.2f}  score {w['score']:.3f}")
    md += ["", "## Lyric timing", ""]
    for l in lyrics:
        md.append(f"- `{l['start']:.2f}`–`{l['end']:.2f}` [{l['timing']}] {l['text']}")
    (args.out / "analysis.md").write_text("\n".join(md) + "\n")

    # ---- plots ----
    if not args.no_plots:
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt
            from matplotlib import font_manager
            for name in ["PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Arial Unicode MS"]:
                if any(name.lower() in f.name.lower() for f in font_manager.fontManager.ttflist):
                    plt.rcParams["font.family"] = name
                    break
            fig, ax = plt.subplots(2, 1, figsize=(14, 7), sharex=True, gridspec_kw={"height_ratios": [1, 1.4]})
            ax[0].plot(energy_t, db, lw=0.7, color="#3b6")
            ax[0].set_ylabel("RMS dB")
            for s in sections:
                ax[0].axvspan(s["start"], s["end"], alpha=0.06)
                ax[0].text((s["start"] + s["end"]) / 2, ax[0].get_ylim()[1] - 2, s["id"], ha="center", fontsize=7)
            for w in long_climax:
                ax[0].axvspan(w["start"], w["end"], color="#d64", alpha=0.10)
            S = librosa.amplitude_to_db(np.abs(librosa.stft(y, n_fft=2048, hop_length=hop)), ref=np.max)
            ax[1].imshow(S, origin="lower", aspect="auto", cmap="magma",
                          extent=[0, duration, 0, sr / 2 / 1000])
            ax[1].set_ylabel("kHz")
            ax[1].set_xlabel("seconds")
            for l in lyrics:
                ax[1].axvline(l["start"], color="#9ef", lw=0.35, alpha=0.55)
            for d in downbeats:
                ax[1].axvline(d, color="#fff", lw=0.25, alpha=0.18)
            fig.tight_layout()
            fig.savefig(args.out / "analysis.png", dpi=130)
            plt.close(fig)
        except Exception as e:
            print(f"[warn] plots skipped: {e}", file=sys.stderr)

    print(json.dumps({
        "duration": round(duration, 3), "bpm": round(bpm, 3), "coherence": round(coh, 3),
        "sections": len(sections), "lyrics": total, "cross_checked": checked,
        "climax": [(w["start"], w["end"], w["score"]) for w in long_climax[:4]],
    }, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main()
