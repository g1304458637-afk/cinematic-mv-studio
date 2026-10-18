# 愿与愁 · The Last Orchard

An original, non-official animated interpretation of 林俊杰《愿与愁》 (Dust and Ashes),
made entirely with deterministic code-drawn animation. No AI image/video API was used.

- **Film:** 《最后的果园》 / *The Last Orchard*
- **Runtime:** 3:52.6 (232.595 s)
- **Format:** 1080×1920, 9:16, 24 fps, H.264 High + AAC 256 kbps, yuv420p, faststart
- **Master audio:** the user-supplied `song.m4a`, unchanged in speed and pitch
- **Subtitles:** `愿与愁_字幕.srt` (vocal-aligned; not burned in)

## Logline

In a world buried by ash, a young gardener guarding the last living seed shelters a sky-dweller
who came to steal it. The seed will only open for two people who choose to stay.

## Files

| file | what |
|---|---|
| `愿与愁_完整AI动画MV.mp4` | master, 1080×1920 |
| `愿与愁_低清预览.mp4` | 540×960 review copy |
| `愿与愁_字幕.srt` | optional Chinese captions, vocal-onset aligned |
| `storyboard.md` | 45 shot cards |
| `timeline.json` | frame-accurate EDL |
| `style-guide.md` | visual language and palette |
| `qc-report.md` | technical + visual QC evidence |
| `shot-list.csv` | compact shot table |

## Rebuild

From `projects/jjlin-wish-and-sorrow`:

```bash
node render.mjs --start 0 --end 232.625 --out renders/frames
node render.mjs --encode --frames renders/frames --audio assets/song.m4a \
  --out "output/愿与愁_完整AI动画MV.mp4"
```

The renderer is deterministic at 24 fps. A full 5,583-frame pass took ~75 s on an Apple M5 Pro
with Chrome/Metal. Frames are written atomically; delete only the affected range to re-render.

## Rights

The song, lyrics and recording are **not** part of the reusable Skill. They are used here at the
project owner's direction for a private, non-commercial interpretation. Do not upload or publish
the audio or the lyric captions without the rights to do so. The original animation code and the
characters `Mu` and `Chen` are original work.

## Known limitations (honest)

- The film uses an **ink-silhouette** language, not fully painted faces. This was a deliberate
  production decision after a more detailed face rig failed the style test. Faces are carried by
  eye/hand close-ups and silhouette poses.
- Several interior shots share a similar stage; the film relies on camera, weather and light for
  variety more than on new sets.
- The middle section (verse 2 / pre-chorus 2) is talkier in silhouette than the images can fully
  carry; the story is legible but not subtle.
- The ark and crowd remain silhouettes; they read as forces, not as individual characters.
- The end title is the only typography in the film; captions are sidecar only.
