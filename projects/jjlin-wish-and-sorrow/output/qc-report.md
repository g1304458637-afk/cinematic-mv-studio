# QC report — 《愿与愁》 / The Last Orchard

Master: `愿与愁_完整AI动画MV.mp4`
Preview: `愿与愁_低清预览.mp4`
QC run: 2026-10-18 · tools: ffmpeg/ffprobe 9.0.1, Python 3.11, Chrome 155

## 1. Technical acceptance (PASS)

| check | result |
|---|---|
| decode end-to-end | PASS (no errors) |
| container / streams | MP4 · 1 video + 1 audio |
| video | H.264 High, 1080×1920, 24/1 fps, yuv420p, bt709-compatible |
| audio | AAC-LC, 44100 Hz, 2 ch, 256 kbps |
| duration | 232.595 s (audio 232.595 s; Δ = 0.000 s) |
| frames | 5,582 (source sequence 5,583; the final 41 ms frame is dropped by `-shortest`; no black tail) |
| bitrate / size | ~5.20 Mbps · 151,061,054 bytes |
| black segments ≥ 0.3 s | 0 |
| freezes ≥ 0.8 s | 0 |
| timeline coverage | 45/45 shots, 5,583 frames, no gaps/overlaps |
| lyric coverage | 34/34 lines assigned to shots |
| A/V sync | cross-correlation lag = **0 samples (0 ms)**, normalized correlation 0.9999 |
| loudness | integrated ≈ −11.2 LUFS, true peak +0.3 dBTP (inherited from the supplied master; not normalized) |

The audio was muxed from the supplied recording via a PCM intermediate. No time-stretch, pitch
shift, fade or re-encode of the song's timing was performed. The 2 s lead-in silence and the tail
of the supplied file are preserved.

## 2. Timeline validation (PASS with one documented soft finding)

`analysis/timeline_validation.md`:
- Hard gates: PASS — contiguous shots, full duration, all lyric lines covered.
- Soft: L02/L03 are referenced by two adjacent shots (intentional overlap at the paper-crane
  reveal). No other issues.
- Cut-to-music: every cut is within 0.45 s of a beat/lyric/section; most are within 0.1 s of a
  lyric phrase.

## 3. Visual acceptance (reviewed, not automated)

**Reviewed at native resolution:** the pilot (first 18 s), the 20-frame full-film contact sheet,
and key frames at 66 s (eye/recognition), 128 s (hands/seed), 185 s (tree birth), 220 s (older
couple), 228/230/232 s (pool, title, final fade). Evidence: `analysis/qc/contact_film.jpg`,
`analysis/qc/contact_dense.jpg`, `analysis/qc/keyframes/`, `previews/pilot_final_18s.mp4`.

### What works
- The four-act structure is legible without captions: ash world → orchard/guest → storm/choice →
  green valley/coda.
- Palette and motifs are consistent: seed-green, scarf-amber, signal-red are the only saturated
  accents; paper cranes, tally wall, glass, ash→rain recur.
- The eye close-up (S14) and the pool/title (S45) are the strongest images.
- Camera drift and rain/ash keep static tableaux alive; freezedetect returns none.
- The ending answers the opening: the tiny green point becomes a valley; the two figures return
  in the pool reflection.
- Audio and picture are sample-accurate; no truncated chord, no black tail.

### What is weak (residual defects)
1. **Face windows.** Medium/close silhouettes expose a pale face window with simple eyes/brows.
   At thumbnail scale it reads as a mask; it is the least resolved part of the style. Either
   remove the window (pure silhouette) or design a proper graphic face in a future pass.
2. **Limited body animation.** Poses interpolate, but there is little foot planting, hand contact
   or secondary cloth motion. The film reads as animated tableaux more than character animation.
3. **Repeated interior staging.** Several orchard shots share the same central bed/lamp/shelf
   composition; camera and weather vary more than the set does.
4. **Macro shots are graphic, not tactile.** The hands/seed close-ups read as icons; the hands do
   not convincingly grip the pod.
5. **Middle-section legibility.** The argument and the choice are carried by staging and the
   music; a viewer may need a second pass to follow who wants what.
6. **The ark and crowd are forces, not characters.** Their silhouettes are intentionally abstract
   but reduce the sense of a living ark.
7. **Title placement.** The end title overlaps the tree trunk; legible, but a cleaner plate would
   place it in the sky/water negative space.
8. **One-frame rounding.** The source sequence is 5,583 frames; the muxed file is 5,582 because
   `-shortest` ends at the audio duration. No visible truncation.

### Fixes applied during QC
- Re-encoded from yuvj420p to standard yuv420p.
- Rebuilt the frame sequence after gaps were found; all 5,583 source frames validate as
  1080×1920 JPEG and were re-encoded from the complete sequence.
- Re-muxed from the PCM master after an interrupted AAC attempt.
- Removed stray intermediate MP4s from `output/`.

## 4. Not claimed

- Photoreal rendering, phoneme-accurate lip sync, or full character animation.
- That the film is the official MV or endorsed by the artist. It is an original, non-official
  interpretation using a user-supplied recording.
- That automated QC replaces watching. The visual findings above are the reviewer's judgement.

## 5. Evidence

- `analysis/qc/qc.md`, `analysis/qc/qc.json`, `analysis/qc/final_probe.json`
- `analysis/qc/contact_film.jpg` (20 frames), `analysis/qc/contact_dense.jpg`
- `analysis/qc/keyframes/t66.jpg`, `t128.jpg`, `t185.jpg`, `t220.jpg`, `t228.jpg`, `t230.jpg`, `t232.jpg`
- `analysis/timeline_validation.md`
- `analysis/lyrics_aligned.json` / `output/愿与愁_字幕.srt`
- `previews/pilot_final_18s.mp4`
