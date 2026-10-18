# Deterministic rendering, assembly and recovery

## 1. The frame contract

The page exposes one pure function:

```js
window.renderAt(timeSeconds) -> data:image/jpeg;base64,...
```

It must not depend on wall-clock time, mouse, network or `Math.random`. Seed every random mark
with `(elementId, floor(time*12))`. Use integer frame indices in the driver; convert to seconds
only at the page boundary. Reset camera/global state at the start of every call. If a frame fails,
throw; do not return the previous frame.

## 2. Render units

- Global sequence: `renders/frames/f_000000.jpg` …
- Per-shot units: `renders/shots/S01/…` plus a manifest:
  `{shot_id, start_frame, end_frame, source_hash, status, rendered_at}`.
- Write `*.tmp`, fsync/close, then rename. A 0-byte or partial file is never "done".
- Resume only when the manifest says `complete` and the source hash matches. If a shot changed,
  invalidate that shot, not the whole film.
- A changed shared library (character, set, core) invalidates every shot that imports it. Hash the
  dependency list, not just the shot file.
- Keep a `--force` path for deliberate re-renders, and a `--shot=S07` path for fixes.

## 3. Browser and GPU

- Launch Chrome with a fresh temporary profile per run; disable disk cache; append a unique query
  to the page URL. Cache bugs masquerade as rendering bugs.
- On macOS, `--use-gl=angle` gave a Metal-backed WebGL context in this environment. Probe it and
  record the unmasked renderer.
- On Linux, `--no-sandbox` is often required in containers; never enable it on a shared desktop.
- Set `protocolTimeout: 0` for long renders, but keep a per-frame watchdog in the driver.
- Retry a failed frame twice with a fresh page. If it fails three times, stop and report the frame.
- Close the browser in `finally`; orphan Chrome processes will eat the next run's memory.

## 4. Performance

Measure, don't guess. In this project, 1080×1920 Canvas2D + cached textures rendered at roughly
70–90 fps in headless Chrome on an M5 Pro; 5,583 frames took about 75 s. p5.brush at the same size
was ~67 ms/frame for a simple plate, so use it for cached backgrounds, not every frame.
Budget disk: JPEG q94 ≈ 0.15–0.4 MB/frame; PNG is 10× larger.

## 5. Encode

```bash
ffmpeg -y -framerate 24 -i renders/frames/f_%06d.jpg -i assets/song.m4a \
  -c:v libx264 -preset slow -crf 16 -pix_fmt yuv420p -profile:v high -level 4.2 \
  -c:a aac -b:a 256k -ar 44100 -shortest -movflags +faststart output/final.mp4
```

- `-shortest` prevents audio overhang; verify the resulting duration, don't assume.
- The last shot must extend to `ceil(duration*fps)`; otherwise the tail is black/truncated.
- Keep a lossless or high-bitrate intermediate if you will grade again.
- Make a low-res preview at 540×960 for review; do not judge grain or line quality from it.

## 6. Recovery

If the render dies:
1. read the last completed frame and the manifest;
2. check the frame decodes (`ffprobe`/PIL);
3. rerender from the next incomplete frame, not from zero;
4. if a whole shot is corrupt, delete only that shot's frames;
5. if the encode is corrupt, keep the frames and re-encode.

Never overwrite the last known-good master before the new QC passes.
