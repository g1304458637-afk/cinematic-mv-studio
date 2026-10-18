# LESSONS — cinematic-music-video-director

Newest first. Each entry: what broke, what fixed it, what to try next time. Promote a lesson into
`SKILL.md` once it has held for two productions.

## 2026-10-18 · 《愿与愁》 / The Last Orchard (first full production, 232.6 s)

**Worked**
- Offline librosa map + phase-fitted tempo (71.97 BPM, coherence .756) gave a stable cut grid.
- Keeping official LRC `phrase_start` separate from ASR `vocal_start` explained a consistent
  ~1.2 s offset and prevented inventing a shifted song.
- 45 shots, 5,583 frames, 1080×1920, Canvas2D + pigment texture: ~75 s to render all frames on
  an M5 Pro. This is fast enough to iterate.
- The eye close-up and the pool coda were the strongest frames. Macro close-ups of hands/eyes
  carry more emotion than a medium shot of a weak face rig.
- Frame contract + atomic writes + fresh Chrome profile made the render reproducible.

**Broke / fix**
- `file://` script caching repeatedly served old JS. Query on the HTML was not enough. Fix: add a
  version query to every `<script>` and launch Chrome with a fresh `userDataDir`; disable cache.
- A variable-width ink polygon self-intersected at tight curves and produced giant spikes. Fix:
  stamp/stroke segments and scale jitter by the current transform. Never treat pixel jitter as
  local units.
- Capsule caps were built on the same side twice, creating a self-intersecting bow-tie and white
  holes. Fix: end cap left→outward→right; start cap right→outward→left.
- Global `function lerp` collided with `const lerp` from core. Fix: namespace helpers.
- `window.shotAt = (t) => shotAt(t).id` overwrote the function and recursed forever. Fix: give
  the exposed helper a different name.
- Hand paths were built at the origin and never translated; all macro shots looked empty. Fix:
  apply x/y translation in the draw wrapper.
- Freezedetect flagged static dialogue scenes. Fix: 1–2 px living camera drift + default dust +
  animated grain/flicker. Do not use a duplicate frame to "fix" a freeze.
- A tree growth stage of 0.05 drew a full tree because the scale branch only handled 1 and 2.
  Fix: continuous `pow(stage, .72)` scaling; test intermediate values, not just endpoints.
- The first character rig looked like a paper doll. The pivot to **ink silhouettes + object/eye
  close-ups** was more coherent than trying to render detailed faces at 1080p. Next time, choose
  the abstraction before building the face rig.

**Try next**
- Build the shot as a data spec from the start; the 45-spec table cut iteration time dramatically.
- Render a 3-shot style test before the character rig is final.
- Add a real per-shot manifest/hash; this run resumed by frame existence only.
- A hand model with a thumb and four distinct fingers is still weak in profile; model and test it
  separately.
- Add a low-cost "shot strip" QC tool that samples 3 consecutive frames at every cut.
- Add `-cpu-used` and `-row-mt` to the ffmpeg encode to halve the wall time on big renders;
  the default libx264 thread tuning leaves Apple Silicon cores idle.

**Supplementary · handoff (same production, 2026-10-18)**
- Chinese title/lyric text drew as tofu in the encoded master. Root cause: the engine named
  `"Noto Serif CJK SC"` / `"Songti SC"` / `"PingFang SC"` (in `src/shots.js` and `src/shots/blocks.js`)
  but the headless Chrome on this macOS only carries `STHeiti` plus core text fonts — none of the
  named fonts existed, so Canvas2D fell back to a CJK-less default. Fix: name a font that is
  actually installed, e.g. `"STHeiti Medium","STHeiti Light",serif`, and render a 1-frame
  font test before committing to a full pass. This was not flagged in QC because the affected
  frames (title card, lyric overlays) are short and sit on otherwise-strong compositions.
- `ffmpeg` 9 removed the `-vsync` flag. Use `-fps_mode passthrough` when extracting frames
  with the `select` filter.
- The default 2-minute tool timeout silently killed a 1080p x264 medium encode mid-pass.
  Pass an explicit long `timeout` (≥ 600000 ms) for any encode that runs longer than two
  minutes.
- A background render process from an earlier session was still re-encoding the master in
  the same project directory. When the project root is shared, do not assume a file is
  missing without re-`ls`ing; use a unique output name and coordinate.
