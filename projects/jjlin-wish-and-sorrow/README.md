# 《愿与愁》— The Last Orchard

An original 3:52.6 animated music film cut to 林俊杰《愿与愁》, drawn frame by frame in code.
This directory is a complete, reproducible production project, not a prompt or a plan.

## Quick start

```bash
# 1. inspect the music master
python ../../skills/cinematic-music-video-director/scripts/analyze_music.py \
  assets/song.m4a --out analysis --lrc assets/song.lrc \
  --sections analysis/sections.json --fps 24

# 2. validate the edit
python ../../skills/cinematic-music-video-director/scripts/validate_timeline.py \
  --timeline storyboard/timeline.json --audiomap analysis/audiomap.json

# 3. re-render (deterministic)
node render.mjs --start 0 --end 232.625 --out renders/frames
node render.mjs --encode --frames renders/frames --audio assets/song.m4a \
  --out "output/愿与愁_完整AI动画MV.mp4"
```

## What is here

| path | what |
|---|---|
| `assets/` | user-supplied master audio, clean LRC, source lyric JSON |
| `analysis/` | audiomap, sections, ASR cross-check, alignment, validation, QC |
| `storyboard/` | concepts, director score, 45-shot EDL, human storyboard |
| `characters/` | art bible |
| `src/` | deterministic Canvas2D engine, character rig, sets, props, shots |
| `studio.html` | `window.renderAt(t)` page |
| `render.mjs` | resumable headless renderer + encoder |
| `renders/` | pilot and full frame sequence |
| `previews/` | pilot clip, contact sheets, shot tests |
| `output/` | final master, preview, SRT, docs, QC |

## Story

**Act I — The Tally (0:00–1:26).** Mu keeps the last orchard on a cliff. She counts days, waters
one seedling, and watches the ark cross the sky. A pod falls.

**Act II — The Guest (1:26–2:26).** The intruder is Chen, the boy who gave her a paper crane
before the ark took him — but the ark has conditioned him to forget. He needs the seed for his
dying people; she needs it for her mother's memory. They fight, repair the dome together, and the
seed opens at their touch.

**Act III — The Storm (2:26–3:18).** The countdown forces him to leave. He takes the pod and finds
it empty; she kept the seed. He turns back as the storm tears the dome apart. They shelter the
seed with their bodies; it becomes a tree and the ash turns to rain.

**Coda (3:18–3:52).** The ark comes home. The valley greens. Years later, two older figures sit
under the tree; a leaf falls into a pool. The title.

## Rights and credits

The song and lyrics are used at the project owner's direction and are not part of the reusable
Skill. The animation, characters, story and code are original. Research sources and licences are
listed in `../../skills/cinematic-music-video-director/THIRD_PARTY_LICENSES.md`.
