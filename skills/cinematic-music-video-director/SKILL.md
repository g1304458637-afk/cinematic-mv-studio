---
name: cinematic-music-video-director
description: "Autonomous director for code-drawn cinematic music videos. Analyzes a song, aligns lyrics honestly, develops and selects an original story, builds a frame-accurate shot plan, draws a deterministic 2D/ink animation in headless Chrome, renders shot-resumably, muxes the original audio, and runs technical plus visual QC. Use for narrative MVs, animated short films, and music-led title sequences."
license: MIT
metadata:
  version: "1.0.0"
  tags: [music-video, animation, directing, p5js, canvas, ffmpeg, storyboard, lyric-alignment, qc]
  created: "2026-10-18"
---

# Cinematic Music Video Director

A production skill for making a **watchable short film whose spine is a song** — not a lyric
template, not a slideshow, not a pile of unrelated generative clips. Every frame is drawn by
code and is reproducible from an integer frame number.

The skill is deliberately music-first and evidence-first:

1. measure the song before imagining pictures;
2. write a thesis and a director score before writing a single shot;
3. lock a frame-accurate edit before rendering;
4. prove the look and the motion in a 10–20 s pilot;
5. render in resumable shot units;
6. verify the file you actually shipped.

> **Hard rule:** never invent a timestamp, a BPM, a lyric line, a render result or a QC pass.
> If evidence is missing, mark the item `unverified` and say so in the delivery notes.

---

## When to use

Use when the user asks for a music video, an animated short cut to music, a title sequence, or
a "make my song into a film" task, and local code rendering is acceptable. The default output is
9:16, 1080×1920, 24 fps, H.264 + AAC, with an optional sidecar subtitle file.

Do **not** use this skill to download copyrighted audio, to clone a living artist's likeness, or
to reproduce an existing MV shot-for-shot. Ask the user for audio they have the right to use.

## Prerequisites (check, don't assume)

- Node 20+, ffmpeg/ffprobe, Google Chrome or Chromium.
- Python 3.10–3.13 with `numpy scipy soundfile librosa` (matplotlib optional, Pillow for sheets).
- `puppeteer-core`, `p5`, `p5.brush` in the project's `node_modules`.
- Enough disk for frames: 1080×1920 JPEG q94 ≈ 0.2–0.5 MB/frame; a 4-minute film ≈ 1–3 GB.
- For Chinese lyrics, an LRC/SRT from the user, or a local Whisper model; never scrape and
  present a random lyric site's timing as verified.

Run `scripts/doctor.sh` (or the equivalent commands in `references/render-recovery.md`) and
record the result. If a prerequisite is missing, fix it or report the block.

---

## The production loop

### 0. Intake and rights

Collect: audio path, lyric text and any timing file, aspect/resolution/fps, deadline, language,
and the usage context. Copy the audio read-only into `assets/`; never overwrite the original.
State the rights assumption in `README.md` (e.g. "user-supplied audio, private use only").

### 1. Music master (gate M)

```bash
python scripts/analyze_music.py assets/song.m4a \
  --out analysis --lrc assets/song.lrc --sections analysis/sections.json \
  --asr analysis/asr/whisper.json --fps 24
```

Produces `analysis/audiomap.json`, `lyrics.json`, `lyrics.srt`, `analysis.md`, `analysis.png`.
The map contains duration, a phase-fitted tempo grid, beats/downbeats, energy/spectral curves,
candidate climax windows, section spans, and line-level lyric timing with provenance.

Acceptance:
- duration and sample rate match the supplied file;
- tempo coherence is reported; if < 0.6, inspect by ear/spectrogram and consider a tempo map;
- every lyric line has a timing source (`lrc_line`, `srt_line`, `cross_checked`, `untimed`);
- loudness is not treated as emotional climax without a structural cross-check.

If the user supplies no lyric timing, run `scripts/align_lyrics.py` with a local ASR transcript
and review it. Keep **phrase time** (bar/phrase mark, used for cuts) separate from **vocal onset**
(used for captions). Never silently shift the whole song to make a cut look neat.

### 2. Three concepts, then one (gate D1)

Write `storyboard/concepts.md` with three genuinely different films. Score each on lyric/music
fit, story completeness, emotional impact, visual originality, code feasibility, and long-form
watchability. Select one and write the reason. Do not start shot code until this exists.

Then write `storyboard/director_score.json`:
thesis, anti-thesis, emotional curve, visual chapters (world/palette/space/camera/grammar),
contrast map, motifs and payoffs, cast wants/needs/arcs, shot roles and handoffs, sound–visual map.

A shot that cannot state its **role**, **incoming handoff** and **outgoing handoff** is not ready.

### 3. Visual language and tests (gate D2)

Write `style-guide.md` and a character/art bible before animating. Define:
palette with hex values and a colour script; lens/composition grammar for 9:16; line and texture
rules; character proportions, silhouettes, wardrobe continuity and expression range; lighting;
transition vocabulary; the exact things the film will **not** do (e.g. "no floating particles
without narrative cause").

Render 1–3 style frames and a character sheet. Judge them at full resolution, not thumbnails.
If the look is weak, change the language now — not after 40 shots.

### 4. Frame-accurate edit (gate E)

Write `storyboard/timeline.json` with `fps`, `total_frames`, `shots[]` and, for each shot:
`id, start_frame, end_frame, section, lyric_refs, size, composition, environment, action,
expression, camera, transition_in/out, emotion, function, implementation, complexity`.
Shots must be contiguous and cover the full audio.

```bash
python scripts/validate_timeline.py \
  --timeline storyboard/timeline.json --audiomap analysis/audiomap.json \
  --out analysis/timeline_validation.md
```

The validator is a hard gate: no gaps, no overlaps, last frame ≥ ceil(duration×fps), every lyric
line accounted for, no cut absurdly far from a beat/lyric/section without a written reason.

### 5. Pilot (gate P)

Render 10–20 s containing at least: one wide establishing shot, one character medium, one
close-up, one fast action or impact, and one transition. Build a contact sheet and a watchable
clip with the real audio. Check:
- Does the style hold at 100%?
- Are character proportions, costume and light continuous?
- Is the camera move motivated, or does it drift for no reason?
- Do cuts land on musical events?
- Does the renderer survive 300+ frames without an exception?
- What is the measured ms/frame and disk cost?

Fix the pilot before the full pass. Record the measured performance in `LESSONS.md`.

### 6. Full render (gate R)

Use a deterministic page contract: `window.renderAt(t) -> dataURL`, no `Math.random`, seeded
noise, integer frame indices. Render shot by shot or frame by frame with atomic writes; keep a
manifest of completed units and hashes so a changed shot invalidates only itself.

```bash
node scripts/render.mjs --project . --start 0 --end 232.6 --out renders/frames
```

Prefer per-shot units and a `--force`/`--shot` path over "delete everything and start again".
Do not render the same approved shot twice. Never let a failed frame pass as complete: a frame
must exist, be non-zero, and decode.

### 7. Assembly (gate A)

```bash
ffmpeg -y -framerate 24 -i renders/frames/f_%06d.jpg -i assets/song.m4a \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -level 4.2 \
  -c:a aac -b:a 256k -ar 44100 -shortest -movflags +faststart output/final.mp4
```

The master audio is immutable. Do not fade, retime or re-encode the song to fit the picture.
The last shot must cover the audio tail; no black tail, no truncated final chord.

### 8. QC (gate Q)

Run both, and attach the evidence:

```bash
python scripts/qc_video.py output/final.mp4 --audio assets/song.m4a \
  --expected-frames 5583 --timeline storyboard/timeline.json --out analysis/qc
```

Technical: decode, duration vs audio (tolerance ≤ 0.12 s), stream counts, resolution, fps,
pix_fmt, frame count, blackdetect, freezedetect, coverage, missing/placeholder frames.
Visual: full-resolution contact sheets, per-scene key frames, consecutive-frame strips at cuts,
A/V sync spot checks, character-continuity inspection, title/caption safety.

**Visual QC is not automated away.** State exactly which shots you watched, at what resolution,
and what you found. A clean ffprobe is not a visual pass.

### 9. Deliver

Ship: master MP4, low-res preview, `storyboard.md`, `timeline.json`, `style-guide.md`,
`qc-report.md`, `README.md`, optional SRT, and the reproducible source. Keep the audio and lyrics
local unless the user has the rights to publish them. Add a dated `LESSONS.md` entry.

---

## File contract

```text
project/
  assets/            # song.m4a, lyrics.lrc/srt, user-supplied references (do not overwrite)
  analysis/          # audiomap.json, lyrics.json, sections.json, validation, QC
  storyboard/        # concepts.md, director_score.json, timeline.json, storyboard.md
  characters/        # art bible, model sheets
  src/               # deterministic drawing code: lib/, custom_shots.js, shots.js
  studio.html        # window.renderAt(t) contract
  renders/           # frames/ (global sequence), pilot/, manifests
  previews/          # pilot.mp4, contact sheets, review board
  output/            # final MP4, preview, SRT, storyboard.md, timeline.json, style-guide.md, QC
```

## Non-negotiable craft rules

- The song is the master timeline. Picture is cut to music; music is never cut to picture.
- One film, not a playlist of looks. Motifs return and **change**.
- A repeated chorus may rhyme visually; it may not reuse the same composition unchanged.
- Characters need want, obstacle, choice, consequence. Faces and hands must act.
- Camera moves need a motivation (reveal, pressure, release), not a default Ken Burns.
- Every shot must contain at least one moving element that belongs to the story world.
- Do not hide a missing story behind particles, speed ramps or gratuitous bloom.
- If the honest result is stylised and limited, say so in the QC report; do not call it photoreal.

## Failure and recovery

The renderer is designed to fail loudly and resume cheaply:
- atomic frame writes (`*.tmp` → rename), never a half JPEG counted as done;
- a per-shot manifest with source hash, start/end frame and status;
- `--shot` / `--start/--end` re-renders only the affected range;
- keep the last known-good encode; never overwrite the master until QC passes.

If the browser or GPU dies, retry the unit twice with a fresh page/profile. If a frame fails
three times, stop, isolate the shot, and report the frame number and error. Do not fill with a
duplicate frame or a still.

## Reference index

- `references/directing.md` — concept selection, director score, duration, rhythm, endings.
- `references/visual-language.md` — 9:16 composition, cameras, colour, character, texture.
- `references/audio-lyrics.md` — measurement, phase-fit tempo, sections, honest alignment.
- `references/render-recovery.md` — deterministic contract, manifests, encoding, resume.
- `references/qc.md` — hard/soft gates, contact sheets, what automation cannot see.
- `templates/` — director score, timeline, shot card, style guide, project config.
- `tests/` — parser, coverage and validator tests; run `bash tests/run_tests.sh`.
- `LESSONS.md` — what broke in real productions and what fixed it.

## Credits and licences

Engine patterns are informed by the MIT-licensed **ClaudeAnimationBase** (John Heibel) and
**claude-music-video-skill** (Sage Arbor). The workflow concepts were studied from
**musical-mv-storyboard**, which has **no licence**; no code or text from it is copied.
See `THIRD_PARTY_LICENSES.md`. p5 is LGPL-2.1, p5.brush MIT, puppeteer-core Apache-2.0,
librosa ISC, ffmpeg GPL. The song and lyrics used in a project are **not** part of this skill.
