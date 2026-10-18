# cinematic-music-video-director

An autonomous production Skill for code-drawn, music-led short films. It takes a song and a
rights-cleared lyric text through measurement, three-concept development, a frame-accurate edit,
a pilot, a resumable render, and technical + visual QC.

## Install

```bash
# Claude Code
ln -s "$PWD/skills/cinematic-music-video-director" ~/.claude/skills/cinematic-music-video-director
# Codex / .agents
ln -s "$PWD/skills/cinematic-music-video-director" ~/.agents/skills/cinematic-music-video-director
```

This repository already contains both links at the repo root (`.claude/skills/` and
`.agents/skills/`) pointing at the single source in `skills/`.

## Use

In an agent session:

> Use cinematic-music-video-director to make a 9:16 animated music video for
> `/path/song.mp3`; lyrics are in `/path/song.lrc`; no paid APIs.

The Skill will ask only for genuine blockers (missing audio, missing rights, a paid service).
Otherwise it proceeds through the gates and reports evidence.

## Tools

```bash
python scripts/analyze_music.py song.m4a --out analysis --lrc song.lrc --sections sections.json
python scripts/align_lyrics.py --lyrics song.lrc --asr whisper.json --out analysis
python scripts/validate_timeline.py --timeline storyboard/timeline.json --audiomap analysis/audiomap.json
node scripts/render.mjs --project . --all --out renders/frames
node scripts/render.mjs --project . --encode --out output/final.mp4
python scripts/qc_video.py output/final.mp4 --audio assets/song.m4a --expected-frames 5583 \
  --timeline storyboard/timeline.json --out analysis/qc
```

Run `bash scripts/doctor.sh` first. Run `bash tests/run_tests.sh` after changes.

## Boundaries

- No paid image/video APIs by default.
- No downloading or cracking copyrighted audio.
- No fabricated timestamps or QC claims.
- No third-party character designs; the example cast is original.
- `musical-mv-storyboard` has no licence and was used for ideas only; no code/text is copied.

See `SKILL.md`, `references/`, `templates/`, `LESSONS.md`, `THIRD_PARTY_LICENSES.md`.
