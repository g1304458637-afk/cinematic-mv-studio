# QC: technical evidence and visual judgement

## Hard gates (fail the delivery)

- File decodes end-to-end (`ffmpeg -v error -i final.mp4 -f null -`).
- One video + one audio stream; H.264 + AAC; 1080×1920; 24 fps; yuv420p; faststart.
- Duration vs supplied audio ≤ 0.12 s; no truncated final chord.
- Frame count matches the expected count (or the documented last-frame rounding).
- No black segment > 0.3 s except an intentional opening/closing card declared in the timeline.
- Every timeline shot is covered exactly once; no gap, overlap, or missing shot.
- No placeholder, 0-byte, duplicate or previous-shot frame in the final sequence.
- Audio is the user's master; no time-stretch, pitch-shift or unapproved re-encode.

## Soft gates (fix or document)

- Freeze > 0.6 s in a shot that is supposed to move. Add a living camera drift, atmosphere,
  cloth/hair, or a performance beat. A deliberate hold is allowed if declared.
- Character identity/wardrobe break between adjacent shots.
- Cut > 0.35 s from any beat/lyric/section and no `intentional_offgrid` reason.
- A chorus composition reused without a story change.
- A close-up with no readable emotion or action.
- Caption timing that leads/lags the vocal by > 0.4 s.
- A final image that is static, empty or unrelated to the thesis.

## Visual review protocol

1. Build a full-film contact sheet (16–24 frames) and read the story without sound.
2. Build per-section sheets at full resolution; inspect faces, hands, props and light continuity.
3. Extract 3–5 frame strips around every cut and every impact.
4. Watch the pilot and the final at 100% on a calibrated display if possible; at minimum inspect
   key frames at native resolution, not thumbnails.
5. Check A/V sync at the first vocal, the first chorus, the biggest impact, the last vocal and the
   final chord.
6. Write down what you actually watched. "Automated checks passed" is not a visual pass.

## Report template

- File/streams/duration/frame count/bitrate.
- Hard gate table with PASS/FAIL and the command output.
- Black/freeze findings with timecodes.
- Coverage table (shots, gaps, overlaps, lyric coverage).
- Visual findings by act, with frame numbers and the fix applied.
- Residual defects and why they remain.
- Evidence paths (contact sheets, strips, ffprobe JSON).

## What automation cannot see

Whether the shot is boring. Whether the character is acting. Whether the joke lands, the grief
reads, the ending is earned. Whether the film is worth watching twice. Those require a human (or
an agent doing an honest visual pass) and must be stated as judgement, not as a metric.
