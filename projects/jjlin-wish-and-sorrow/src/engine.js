/* engine.js — shared math, grain, and camera for code-drawn films.
   No song-specific story. Deterministic: no Math.random. */
const W = 1080, H = 1920;

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function ease(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
function ramp(t, a, b) { return ease((t - a) / (b - a)); }
function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
function mixNum(a, b, t) {
  const o = {};
  for (const k in a) o[k] = typeof a[k] === 'number' ? lerp(a[k], b[k], t) : a[k];
  return o;
}
function mixPt(a, b, t) {
  const o = {};
  for (const k in a) {
    if (typeof a[k] === 'number') o[k] = lerp(a[k], b[k], t);
    else o[k] = [lerp(a[k][0], b[k][0], t), lerp(a[k][1], b[k][1], t)];
  }
  return o;
}

let _paper = null;
function paperCanvas() {
  if (_paper) return _paper;
  _paper = document.createElement('canvas');
  _paper.width = 270; _paper.height = 480;
  const g = _paper.getContext('2d');
  const img = g.createImageData(270, 480);
  for (let i = 0, p = 0; i < img.data.length; i += 4, p++) {
    const n = (hash(p + 1) * 80 + 160) | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return _paper;
}
function grain(ctx, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? 0.16 : alpha;
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(paperCanvas(), 0, 0, W, H);
  ctx.restore();
}
function vignette(ctx, strength) {
  const s = strength == null ? 0.45 : strength;
  const g = ctx.createRadialGradient(W / 2, H * 0.46, H * 0.22, W / 2, H * 0.48, H * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${s})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}
function withCam(ctx, cam, draw) {
  ctx.save();
  ctx.translate(W / 2, H / 2);
  ctx.scale(cam.z, cam.z);
  ctx.translate(-cam.x, -cam.y);
  draw();
  ctx.restore();
}
function driftCam(t, a, b) {
  const u = ease(clamp(t, 0, 1));
  return {
    x: lerp(a.x, b.x, u),
    y: lerp(a.y, b.y, u),
    z: lerp(a.z, b.z, u)
  };
}
function fillPoly(ctx, pts, color) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
function capsule(ctx, x1, y1, x2, y2, r1, r2, color) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.hypot(x2 - x1, y2 - y1) || 0.001;
  ctx.save();
  ctx.translate(x1, y1);
  ctx.rotate(ang);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, r1, Math.PI / 2, -Math.PI / 2, true);
  ctx.arc(len, 0, r2, -Math.PI / 2, Math.PI / 2, true);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
function quad(ctx, pts, color) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  ctx.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]);
  if (pts.length > 3) ctx.quadraticCurveTo(pts[3][0], pts[3][1], pts[0][0], pts[0][1]);
  ctx.fillStyle = color;
  ctx.fill();
}
