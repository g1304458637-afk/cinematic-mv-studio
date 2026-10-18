/* main.js — frame composer. Deterministic: frame f -> exact pixels. */
'use strict';
const FPS = 24;
let TL = (typeof TIMELINE_DATA !== 'undefined') ? TIMELINE_DATA : null;

function shotIndexAt(t) {
  const shots = TL.shots;
  for (let i = 0; i < shots.length; i++) {
    if (t >= shots[i].start && t < shots[i].end) return i;
  }
  return t <= 0 ? 0 : shots.length - 1;
}

function renderFrame(canvas, t) {
  const f = Math.max(0, Math.round(t * FPS));
  if (!TL) return;
  const idx = shotIndexAt(t);
  const s = TL.shots[idx];
  const dur = Math.max(1e-6, s.end - s.start);
  const t01 = clamp((t - s.start) / dur, 0, 1);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#0a0908';
  ctx.fillRect(0, 0, W, H);
  const fn = SHOTS[s.id];
  if (fn) fn(ctx, { t01, abs: t, f, shot: s });
  else { ctx.fillStyle = '#e8dcc6'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#a8442f'; ctx.font = '64px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('MISSING ' + s.id, 540, 960); }
  // global film post (screen space)
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  paperOverlay(ctx, t, .11);
  vignette(ctx, .38);
  filmGrain(ctx, f, .026);
}
