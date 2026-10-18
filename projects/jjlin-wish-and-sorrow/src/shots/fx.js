/* fx.js — particles, weather, props, transitions. All deterministic. */
'use strict';

/* ---------- particle systems ---------- */
function ashMotes(n = 150, seed = 7, wide = W, high = H) {
  const r = rng(seed), a = [];
  for (let i = 0; i < n; i++) a.push({ x: r() * wide, y: r() * high, z: .3 + r() * .7, s: .6 + r() * 2.2, ph: r() * TAU, sp: .3 + r() * .8 });
  return a;
}
function drawAsh(ctx, arr, t, o = {}) {
  const dir = o.dir != null ? o.dir : -1, col = o.color || 'rgba(216,204,186,', tilt = o.tilt != null ? o.tilt : 1;
  ctx.save();
  for (const p of arr) {
    const x = ((p.x + t * 26 * p.sp * dir * (0.4 + p.z)) % (W + 80) + W + 80) % (W + 80) - 40;
    const y = p.y + Math.sin(t * .7 * p.sp + p.ph) * 10 * p.z + t * 6 * tilt * p.z;
    const yy = ((y % (H + 60)) + H + 60) % (H + 60) - 30;
    ctx.fillStyle = col + (o.alpha != null ? o.alpha * (.25 + p.z * .55) : (.25 + p.z * .55)) + ')';
    ctx.fillRect(x, yy, p.s * (0.6 + p.z), p.s * (0.6 + p.z) * .8);
  }
  ctx.restore();
}
function rainDrops(n = 220, seed = 3) {
  const r = rng(seed), a = [];
  for (let i = 0; i < n; i++) a.push({ x: r() * W * 1.4 - W * .2, y: r() * H, z: .3 + r() * .7, len: 14 + r() * 46, sp: 1.6 + r() * 2.2 });
  return a;
}
function drawRain(ctx, arr, t, o = {}) {
  const a = o.alpha != null ? o.alpha : .5, slant = o.slant != null ? o.slant : .22;
  ctx.save(); ctx.strokeStyle = o.color || 'rgba(185,205,210,' + a + ')'; ctx.lineWidth = 1.4;
  for (const p of arr) {
    const y = (p.y + t * 1400 * p.sp) % (H + 120) - 60;
    const x = p.x + (H - y) * slant * (0.4 + p.z);
    ctx.globalAlpha = a * (.3 + p.z * .6);
    ctx.lineWidth = .8 + p.z * 1.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - p.len * slant, y + p.len); ctx.stroke();
  }
  ctx.restore();
}
function emberBits(n = 90, seed = 5) {
  const r = rng(seed), a = [];
  for (let i = 0; i < n; i++) a.push({ x: r() * W, y: r() * H, z: .3 + r() * .7, s: 1 + r() * 3, ph: r() * TAU, sp: .5 + r() * 1.4 });
  return a;
}
function drawEmbers(ctx, arr, t, o = {}) {
  ctx.save();
  const col = o.color || '240,180,100';
  for (const p of arr) {
    const y = ((p.y - t * 40 * p.sp) % (H + 60) + H + 60) % (H + 60) - 30;
    const x = p.x + Math.sin(t * 1.3 * p.sp + p.ph) * 22 * p.z;
    const f = .5 + .5 * Math.sin(t * 5 * p.sp + p.ph * 3);
    ctx.fillStyle = `rgba(${col},${(.25 + f * .6) * (.4 + p.z * .6)})`;
    ctx.beginPath(); ctx.arc(x, y, p.s * (.5 + p.z * .7), 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function sporeBits(n = 60, seed = 9) {
  const r = rng(seed), a = [];
  for (let i = 0; i < n; i++) a.push({ x: r() * W, y: r() * H, z: .4 + r() * .6, s: 1.2 + r() * 2.4, ph: r() * TAU, sp: .4 + r() });
  return a;
}
function drawSpores(ctx, arr, t, o = {}) {
  ctx.save();
  for (const p of arr) {
    const x = p.x + Math.sin(t * .8 * p.sp + p.ph) * 26;
    const y = ((p.y - t * 22 * p.sp) % (H + 60) + H + 60) % (H + 60) - 30;
    const f = .5 + .5 * Math.sin(t * 2.2 + p.ph);
    ctx.fillStyle = `rgba(190,225,150,${(.2 + f * .45) * p.z})`;
    ctx.beginPath(); ctx.arc(x, y, p.s, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function drawWindLines(ctx, t, seed = 1, n = 26, alpha = .22, col = '200,200,195') {
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const z = hash2(seed, i), y = hash2(seed, i + 50) * H, len = 120 + hash2(seed, i + 90) * 420;
    const x = ((hash2(seed, i + 7) * W + t * (500 + z * 900)) % (W + 600)) - 300;
    ctx.strokeStyle = `rgba(${col},${alpha * (.3 + z * .7)})`; ctx.lineWidth = .6 + z * 1.8;
    ctx.globalAlpha = .9;
    ctx.beginPath(); ctx.moveTo(x - len, y + len * .12); ctx.quadraticCurveTo(x - len * .5, y - 6, x, y); ctx.stroke();
  }
  ctx.restore();
}
/* ---------- transitions ---------- */
function tFade(ctx, t01, dur = .3, color = '#0a0908') {
  const a = t01 < dur ? 1 - t01 / dur : (t01 > 1 - dur ? (t01 - (1 - dur)) / dur : 0);
  if (a > 0) { ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}
function tDip(ctx, t01, at = .5, w = .08, color = '#0a0908') {
  const a = Math.max(0, 1 - Math.abs(t01 - at) / w);
  if (a > 0) { ctx.save(); ctx.globalAlpha = a * .92; ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}
function tFlash(ctx, a, color = '#f5ead2') { if (a <= 0) return; ctx.save(); ctx.globalAlpha = clamp(a); ctx.fillStyle = color; ctx.fillRect(0, 0, W, H); ctx.restore(); }
function tWhip(ctx, amt, dir = 1, seed = 3) {
  if (amt <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(amt) * .85; ctx.fillStyle = '#e8dcc6';
  ctx.translate(W / 2, H / 2); ctx.rotate(dir * amt * .06);
  for (let i = 0; i < 26; i++) {
    const y = (i / 26) * H + (hash2(seed, i) - .5) * 30;
    ctx.globalAlpha = clamp(amt) * (.2 + hash2(seed, i + 40) * .6);
    ctx.fillRect(-W, y - 3 + amt * 30 * dir, W * 2, 4 + hash2(seed, i + 80) * 10);
  }
  ctx.restore();
}
function shakeAmt(t01, at, w, amp) { return Math.max(0, 1 - Math.abs(t01 - at) / w) * amp; }

/* ---------- lighting ---------- */
function lampFlicker(t, seed = 1) {
  return .82 + .1 * Math.sin(t * 9 + seed) + .08 * Math.sin(t * 23.7 + seed * 3) + .05 * noise1(t * 6, seed);
}
function drawLantern(ctx, x, y, s, t, o = {}) {
  const f = o.f != null ? o.f : lampFlicker(t, 3);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#241d1a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(0, -46); ctx.stroke();
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 26);
  g.addColorStop(0, `rgba(255,224,160,${.95 * f})`); g.addColorStop(1, 'rgba(240,196,119,.15)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.fill();
  paintShape(ctx, ellipsePath(0, 0, 17, 21), { color: '#e8b86a', ink: '#3a2c1c', inkW: 3, texA: .2, seed: 11 });
  paintShape(ctx, ellipsePath(0, -21, 8, 4), { color: '#4a3527', ink: null, seed: 12 });
  paintShape(ctx, ellipsePath(0, 21, 8, 4), { color: '#4a3527', ink: null, seed: 13 });
  ctx.restore();
}
function glow2(ctx, x, y, r, color, a) { glow(ctx, x, y, r, color, a); }
/* ---------- living things ---------- */
// growth: 0 seed · .2 sprout · .5 sapling · 1 young tree
function drawSeedling(ctx, x, y, s, g, t, o = {}) {
  const sway = Math.sin(t * 1.4) * .02 + (o.wind || 0) * .05;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const h = 30 + g * 190, bend = sway * (0.3 + g);
  ctx.strokeStyle = '#5c7250'; ctx.lineWidth = 3 + g * 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(bend * 40, -h * .6, bend * 90, -h); ctx.stroke();
  const lf = g < .15 ? 2 : 3 + Math.floor(g * 5);
  for (let i = 0; i < lf; i++) {
    const p = .35 + (i / lf) * .6, lx = bend * 90 * p, ly = -h * p;
    const side = i % 2 ? 1 : -1, sz = (12 + g * 26) * (1 - p * .35);
    paintShape(ctx, ellipsePath(lx + side * sz * .8, ly, sz, sz * .5, side * (.5 + sway)), { color: i % 3 ? '#7fa05a' : '#8fa06f', ink: '#41502f', inkW: 2, texA: .18, seed: 30 + i });
  }
  if (g > .85) { ctx.fillStyle = 'rgba(240,196,119,.8)'; ctx.beginPath(); ctx.arc(bend * 90, -h, 4, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function treeBranch(ctx, x, y, ang, len, w, depth, seed, t, blossom) {
  if (depth <= 0 || len < 6) return;
  const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
  const sway = Math.sin(t * .8 + seed * .01 + depth) * .02 * (5 - depth);
  ctx.strokeStyle = blossom ? '#4a3c2e' : '#3d332a'; ctx.lineWidth = w; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(ang + sway) * len * .6, y + Math.sin(ang + sway) * len * .6, x2 + sway * 30, y2); ctx.stroke();
  if (blossom && depth <= 2) {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = `rgba(238,190,200,${.5 + hash2(seed, i) * .4})`;
      ctx.beginPath(); ctx.arc(x2 + (hash2(seed, i + 5) - .5) * 26, y2 + (hash2(seed, i + 9) - .5) * 26, 5 + hash2(seed, i + 2) * 9, 0, TAU); ctx.fill();
    }
  }
  const n = depth > 3 ? 2 : (hash2(seed, 1) > .4 ? 3 : 2);
  for (let i = 0; i < n; i++) {
    const a = ang + (i - (n - 1) / 2) * (.5 + hash2(seed, i + 20) * .3) + sway * .5;
    treeBranch(ctx, x2 + sway * 30, y2, a, len * (.66 + hash2(seed, i + 30) * .14), w * .62, depth - 1, seed * 3 + i * 7 + depth, t, blossom);
  }
}
function drawTree(ctx, x, y, s, t, o = {}) {
  const blossom = o.blossom || 0, h = o.h || 620;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paintShape(ctx, polyPath([[-26, 0], [-14, -h * .22], [14, -h * .22], [26, 0]]), { color: '#3d332a', ink: '#241d1a', inkW: 5, seed: 5 });
  treeBranch(ctx, 0, -h * .2, -Math.PI / 2, h * .30, 22, 5, 77, t, blossom > .5);
  ctx.restore();
}
function drawPaperCrane(ctx, x, y, s, rot, col = '#e8dcc6', seed = 4) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = col; ctx.strokeStyle = 'rgba(60,45,35,.55)'; ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-26, 4); ctx.lineTo(-6, -2); ctx.lineTo(-2, -14); ctx.lineTo(6, -4); ctx.lineTo(26, -2);
  ctx.lineTo(8, 6); ctx.lineTo(4, 18); ctx.lineTo(-2, 6); ctx.lineTo(-12, 12); ctx.closePath();
  ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-2, -14); ctx.lineTo(2, -22); ctx.lineTo(8, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}
/* ---------- vehicles & props ---------- */
function drawPod(ctx, x, y, s, rot, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const em = o.ember != null ? o.ember : 0;
  if (em > 0) {
    const g = ctx.createLinearGradient(0, 0, 0, 260);
    g.addColorStop(0, `rgba(240,150,80,${.55 * em})`); g.addColorStop(1, 'rgba(240,150,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-10, 10); ctx.lineTo(10, 10); ctx.lineTo(26, 260); ctx.lineTo(-26, 260); ctx.closePath(); ctx.fill();
  }
  paintShape(ctx, blobPath(0, 0, 34, 46, 3, .12, 14), { color: '#8d8579', ink: '#241d1a', inkW: 3.4, texA: .22, seed: 8 });
  paintShape(ctx, ellipsePath(0, -12, 20, 13), { color: '#a9c5c8', ink: '#3a2f2a', inkW: 2.6, seed: 9 });
  if (o.win > 0) glow(ctx, 0, -12, 46, '#f0c477', o.win);
  if (o.red > 0) glow(ctx, 0, 6, 30, '#d34a2e', o.red * (0.5 + 0.5 * Math.sin(t * 6)));
  ctx.restore();
}
function drawArk(ctx, x, y, s, t, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paintShape(ctx, blobPath(0, 0, 300, 54, 4, .1, 20), { color: o.color || '#2a333c', ink: '#191f26', inkW: 4, seed: 12 });
  for (let i = 0; i < 14; i++) {
    const wx = -240 + i * 36 + Math.sin(t * .4 + i) * 2, wy = -6 + Math.sin(i * 2.1) * 10;
    const lit = noise1(t * .5 + i * 3.7, 2) > .35;
    ctx.fillStyle = lit ? 'rgba(240,196,119,.9)' : 'rgba(120,130,140,.5)';
    ctx.fillRect(wx, wy, 13, 8);
    if (lit) glow(ctx, wx + 6, wy + 4, 22, '#f0c477', .5);
  }
  ctx.restore();
}
function drawWristDevice(ctx, x, y, s, t, o = {}) {
  const blink = o.red != null ? o.red : (Math.sin(t * 5) > 0 ? 1 : .15);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paintShape(ctx, roundRectPath(-16, -10, 32, 20, 7), { color: '#2b2520', ink: '#17120f', inkW: 2.4, seed: 3 });
  ctx.fillStyle = `rgba(211,74,46,${blink})`; ctx.beginPath(); ctx.arc(0, 0, 5.4, 0, TAU); ctx.fill();
  if (blink > .5) glow(ctx, 0, 0, 26, '#d34a2e', .8);
  ctx.restore();
}
function drawVial(ctx, x, y, s, tilt = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.scale(s, s);
  paintShape(ctx, roundRectPath(-9, -13, 18, 26, 4), { color: 'rgba(200,215,210,.5)', edge: '#8d8579', edgeW: 2, ink: '#57514a', inkW: 2, shade: false, seed: 6 });
  ctx.fillStyle = 'rgba(216,204,186,.85)';
  ctx.beginPath(); ctx.moveTo(-6, 2); ctx.quadraticCurveTo(0, 13, 6, 2); ctx.closePath(); ctx.fill();
  paintShape(ctx, roundRectPath(-5, -18, 10, 6, 2), { color: '#4a3527', ink: null, seed: 7 });
  ctx.restore();
}
function drawChalkTally(ctx, x, y, n, groupGap = 5, rowGap = 44) {
  ctx.save(); ctx.strokeStyle = 'rgba(235,228,210,.9)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  let col = 0, row = 0;
  for (let i = 0; i < n; i++) {
    if (col >= 30) { col = 0; row++; }
    const gx = x + col * 18, gy = y + row * rowGap;
    ctx.beginPath(); ctx.moveTo(gx - 6, gy + 7); ctx.lineTo(gx + 6, gy - 7); ctx.stroke();
    if ((i + 1) % groupGap === 0) col++;
    col++;
  }
  ctx.restore();
}
function drawCrowd(ctx, x, y, s, n, t, col = '#2a333c') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < n; i++) {
    const px = (i / n - .5) * 620 + Math.sin(i * 12.9) * 40;
    const ph = t * 2 + i * 1.7, sc = .8 + hash2(9, i) * .4;
    ctx.save(); ctx.translate(px, Math.sin(ph) * 3); ctx.scale(sc, sc);
    paintShape(ctx, capsulePath(0, -34, 0, -8, 9, 12, 8), { color: col, ink: null, shade: false, seed: i });
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, -42, 8, 0, TAU); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
function drawRipples(ctx, cx, cy, t, n = 4, col = 'rgba(230,240,235,)') {
  ctx.save(); ctx.strokeStyle = '#dfeae4';
  for (let i = 0; i < n; i++) {
    const p = ((t * .5 + i / n) % 1);
    ctx.globalAlpha = (1 - p) * .5;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, 30 + p * 460, 12 + p * 190, 0, 0, TAU); ctx.stroke();
  }
  ctx.restore();
}
function drawWishTag(ctx, x, y, s, rot, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + Math.sin(t * 2.2) * .06); ctx.scale(s, s);
  paintShape(ctx, roundRectPath(-16, -22, 32, 44, 3), { color: '#e8dcc6', ink: '#4a3527', inkW: 2, seed: 21 });
  ctx.strokeStyle = '#4a3527'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-8, -8); ctx.quadraticCurveTo(0, 6, 8, -6); ctx.moveTo(-8, 6); ctx.quadraticCurveTo(0, 18, 8, 6); ctx.stroke();
  ctx.restore();
}
/* FX_END */
