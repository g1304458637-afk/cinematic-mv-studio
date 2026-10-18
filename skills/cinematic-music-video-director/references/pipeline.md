# Pipeline and recovery

## Audio

`ffprobe` is the duration authority. The analyzer's duration must match it within 50 ms. Mux with `-shortest` only after the frame count covers the audio:

```
frames >= ceil(duration * fps) - 1
```

Keep the source audio untouched. Encode AAC from it. Do not time-stretch.

## Resume

`render.mjs` writes `f_NNNNNN.jpg` via a `.tmp` rename. A file under 12 KB is treated as failed and redone. To redo a range, delete those JPEGs first.

Parallel workers must use non-overlapping `--start` / `--end` on the same output directory. Two workers on the same index will race.

Stop after two failed attempts on a range. Record the page error in `logs/` and fix the shot; do not loop.

## Encode

```
ffmpeg -framerate 24 -i frames/f_%06d.jpg -i song.m4a \
  -c:v libx264 -pix_fmt yuv420p -crf 18 \
  -c:a aac -b:a 192k -shortest -movflags +faststart out.mp4
```

The picture ends on the last composed frame, not on black, unless the story's last image is darkness and it is only the final beat.

## Project files that are song-specific

`studio.html`, `src/shots.js`, character palettes, and `storyboard/` stay in the project. Do not copy them back into this skill.
