/* core.js — deterministic painterly Canvas2D engine.
 * No Math.random. Every stochastic mark is seeded by (time, element id).
 * World is 1080x1920, 9:16.
 */
const W = 1080, H = 1920, TAU = Math.PI * 2;
const PAL = {
  paper: '#e8dcc6', paperDeep: '#d8c8ad', bone: '#f2e7d3',
  ink: '#241d1a', inkSoft: '#3a2f2a', umber: '#4a3527',
  ash: '#8d8579', ashLight: '#b8b0a2', ashDark: '#57514a',
  teal: '#33544f', tealDeep: '#1d3434', moss: '#5c7250', mossLight: '#8fa06f',
  green: '#7fa05a', greenGlow: '#b9d98a', jade: '#6fae8a',
  amber: '#c98a45', amberLight: '#e8b86a', lamp: '#f0c477',
  vermilion: '#a8442f', blood: '#7d2a22', skin: '#cf9a72', skinShade: '#a96f51',
  skinLight: '#e3b58c', hair: '#211b1b', slate: '#46525c', slateDeep: '#2a333c',
  storm: '#283643', stormLight: '#5b7180', rain: '#a9c5c8', gold: '#d9b25f'
};

// ---------- deterministic randomness ----------
function hash(n) {
  n = (n | 0) ^ 0x9e3779b9;
  n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
  n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}
function hash2(a, b) { return hash(Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)); }
function rng(seed) {
  let s = (seed | 0) >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(hash2(i, seed), hash2(i + 1, seed), u);
}
function noise2(x, y, seed = 0) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix + Math.imul(iy, 374761393), seed);
  const b = hash2(ix + 1 + Math.imul(iy, 374761393), seed);
  const c = hash2(ix + Math.imul(iy + 1, 374761393), seed);
  const d = hash2(ix + 1 + Math.imul(iy + 1, 374761393), seed);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}
function fbm(x, y, seed = 0, oct = 4) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += a * noise2(x * f, y * f, seed + i * 17); f *= 2.03; a *= 0.5; }
  return v;
}

// ---------- math / easing ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const invLerp = (a, b, x) => (x - a) / (b - a);
const smoothstep = (a, b, x) => { const t = clamp(invLerp(a, b, x)); return t * t * (3 - 2 * t); };
const easeInCubic = t => t * t * t;
const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutQuint = t => 1 - Math.pow(1 - t, 5);
const easeInOutQuint = t => t < .5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2;
const easeOutBack = t => { const c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const pulse = (t, center, width) => Math.exp(-Math.pow((t - center) / width, 2));

// ---------- canvas helpers ----------
function mkCanvas(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
  return { c, x, w, h };
}
function roundRectPath(x, y, w, h, r) {
  const p = new Path2D(); const rr = Math.min(r, w / 2, h / 2);
  p.moveTo(x + rr, y); p.arcTo(x + w, y, x + w, y + h, rr); p.arcTo(x + w, y + h, x, y + h, rr);
  p.arcTo(x, y + h, x, y, rr); p.arcTo(x, y, x + w, y, rr); p.closePath(); return p;
}
function ellipsePath(cx, cy, rx, ry, rot = 0) {
  const p = new Path2D(); p.ellipse(cx, cy, Math.max(.01, rx), Math.max(.01, ry), rot, 0, TAU); return p;
}
function blobPath(cx, cy, rx, ry, seed = 0, wob = .08, n = 16, rot = 0) {
  const p = new Path2D();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * TAU, r = 1 + (noise1(i * .9 + seed * 3.1, seed) - .5) * wob * 2;
    const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
    const xx = cx + (x - cx) * Math.cos(rot) - (y - cy) * Math.sin(rot);
    const yy = cy + (x - cx) * Math.sin(rot) + (y - cy) * Math.cos(rot);
    i ? p.lineTo(xx, yy) : p.moveTo(xx, yy);
  }
  p.closePath(); return p;
}
function polyPath(pts) {
  const p = new Path2D(); pts.forEach((q, i) => i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1])); p.closePath(); return p;
}
function smoothPath(pts, closed = false) {
  const p = new Path2D(); if (!pts.length) return p;
  if (!closed) { p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const xc = (pts[i][0] + pts[i + 1][0]) / 2, yc = (pts[i][1] + pts[i + 1][1]) / 2; p.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc); } p.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]); }
  else { p.moveTo(pts[0][0], pts[0][1]); for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const xc = (a[0] + b[0]) / 2, yc = (a[1] + b[1]) / 2; p.quadraticCurveTo(a[0], a[1], xc, yc); } p.closePath(); }
  return p;
}
function jitterPts(pts, seed, amt = 1.2, closed = false) {
  return pts.map((q, i) => [q[0] + (hash2(seed, i * 3 + 1) - .5) * amt * 2, q[1] + (hash2(seed, i * 3 + 2) - .5) * amt * 2]);
}

// ---------- textures ----------
let TEX = null;
function buildTextures() {
  // paper grain: tileable-ish value noise + fibers
  const g = mkCanvas(512, 512), gd = g.x.createImageData(512, 512);
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const i = (y * 512 + x) * 4;
    let v = 128 + (fbm(x * .035, y * .035, 11, 4) - .5) * 60 + (hash2(x, y) - .5) * 22;
    const fib = Math.sin((x * .8 + y * .06) + noise2(x * .01, y * .01, 5) * 8) * 3;
    v += fib;
    gd.data[i] = gd.data[i + 1] = gd.data[i + 2] = clamp(v, 0, 255); gd.data[i + 3] = 255;
  }
  g.x.putImageData(gd, 0, 0);
  // wash: soft monochrome clouds for overlay
  const wsh = mkCanvas(512, 512), wx = wsh.x;
  wx.fillStyle = '#808080'; wx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 220; i++) {
    const x = hash2(i, 1) * 512, y = hash2(i, 2) * 512, r = 20 + hash2(i, 3) * 130;
    const gr = wx.createRadialGradient(x, y, 0, x, y, r);
    const lite = hash2(i, 4) > .5;
    gr.addColorStop(0, lite ? 'rgba(230,230,230,0.10)' : 'rgba(40,40,40,0.08)');
    gr.addColorStop(1, 'rgba(128,128,128,0)');
    wx.fillStyle = gr; wx.beginPath(); wx.arc(x, y, r, 0, TAU); wx.fill();
  }
  // dry-brush streaks
  const dry = mkCanvas(512, 512), dx = dry.x;
  dx.clearRect(0, 0, 512, 512);
  for (let i = 0; i < 160; i++) {
    const x = hash2(i, 7) * 512, y = hash2(i, 8) * 512, len = 40 + hash2(i, 9) * 260, a = -.3 + hash2(i, 10) * .6;
    dx.strokeStyle = `rgba(${180 + hash2(i, 11) * 60 | 0},${180 + hash2(i, 12) * 60 | 0},${180 + hash2(i, 13) * 60 | 0},${.05 + hash2(i, 14) * .15})`;
    dx.lineWidth = .6 + hash2(i, 15) * 3;
    dx.beginPath(); dx.moveTo(x, y); dx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); dx.stroke();
  }
  TEX = {
    paper: g.c, wash: wsh.c, dry: dry.c,
    paperPat: null, washPat: null, dryPat: null
  };
}
function initPatterns(ctx) {
  if (!TEX) buildTextures();
  TEX.paperPat = ctx.createPattern(TEX.paper, 'repeat');
  TEX.washPat = ctx.createPattern(TEX.wash, 'repeat');
  TEX.dryPat = ctx.createPattern(TEX.dry, 'repeat');
}

// ---------- painting ----------
function shadeColor(hex, amt) {
  const c = hex.replace('#', ''); const n = parseInt(c, 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = clamp(r + amt, 0, 255); g = clamp(g + amt, 0, 255); b = clamp(b + amt, 0, 255);
  return `rgb(${r | 0},${g | 0},${b | 0})`;
}
function withAlpha(hex, a) {
  const c = hex.replace('#', ''); const n = parseInt(c, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
/**
 * Paint a closed shape with pigment variation, edge pooling and an optional ink line.
 * opts: {color, tex, texA, edge, edgeW, ink, inkW, grad, seed, alpha, shade}
 */
function paintShape(ctx, path, opts = {}) {
  const { color = PAL.ash, tex = TEX?.washPat, texA = .16, edge = shadeColor(color.startsWith('#') ? color : PAL.ash, -28),
    edgeW = 0.012, ink = null, inkW = 3, grad = .25, seed = 1, alpha = 1, shade = true,
    gy0 = -1200, gy1 = 900, bounds = [-1200, -1600, 3200, 4400] } = opts;
  ctx.save(); ctx.globalAlpha *= alpha;
  ctx.fillStyle = color; ctx.fill(path);
  if (shade) {
    ctx.save(); ctx.clip(path);
    const gg = ctx.createLinearGradient(0, gy0, 0, gy1);
    gg.addColorStop(0, 'rgba(255,245,225,' + (grad * .55) + ')');
    gg.addColorStop(.45, 'rgba(255,255,255,0)');
    gg.addColorStop(1, 'rgba(25,18,16,' + (grad * .8) + ')');
    ctx.fillStyle = gg; ctx.fillRect(bounds[0], bounds[1], bounds[2], bounds[3]);
    // pigment mottling
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha *= texA;
    if (tex) { ctx.fillStyle = tex; ctx.fillRect(bounds[0], bounds[1], bounds[2], bounds[3]); }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha /= texA;
    // edge pooling (inside only)
    if (!window.__NO_EDGE__ && edgeW > 0) {
      ctx.globalAlpha *= .55; ctx.strokeStyle = edge; ctx.lineWidth = edgeW; ctx.filter = 'blur(4px)';
      ctx.stroke(path); ctx.filter = 'none';
    }
    ctx.restore();
  }
  if (ink && !window.__NO_INK__) {
    if (window.__TRACEINK__ && inkW > .012) console.log('WIDEOUTLINE', inkW, ink, new Error().stack.split('\n')[2]);
    ctx.globalAlpha *= .9; ctx.strokeStyle = ink; ctx.lineWidth = inkW;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke(path);
  }
  ctx.restore();
}
function inkStroke(ctx, pts, opts = {}) {
  const { w = 3, color = PAL.ink, seed = 1, taper = .35, alpha = .9, bristle = true, jitter = .6 } = opts;
  if (!pts || pts.length < 2) return;
  if (window.__NO_INKSTROKE__) return;
  if (window.__TRACEINK2__) {
    const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]);
    const bad=pts.some(p=>!isFinite(p[0])||!isFinite(p[1]));
    const dx=Math.max(...xs)-Math.min(...xs), dy=Math.max(...ys)-Math.min(...ys);
    console.log('INKCALL', 'w='+w, 'col='+color, 'n='+pts.length, 'dx='+dx.toFixed(3), 'dy='+dy.toFixed(3), 'bad='+bad, JSON.stringify(pts[0]), JSON.stringify(pts[pts.length-1]));
  }
  if (window.__TRACEINK__) {
    if (w > .012) console.log('WIDEINK', w, JSON.stringify(pts.slice(0,3)), new Error().stack.split('\n')[2]);
    const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]);
    const dx=Math.max(...xs)-Math.min(...xs), dy=Math.max(...ys)-Math.min(...ys);
    if (dx>.30||dy>.30) console.log('LONGINK',w,dx.toFixed(2),dy.toFixed(2),JSON.stringify(pts.slice(0,2)),new Error().stack.split('\n')[2]);
  }
  const P = jitterPts(pts, seed, jitter);
  // variable-width polygon along the polyline
  const left = [], right = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    const nx = -dy, ny = dx;
    const u = i / (P.length - 1);
    const tw = w * (1 - taper + taper * Math.sin(Math.PI * Math.pow(u, .72))) * (1 + (hash2(seed, i) - .5) * .35);
    left.push([P[i][0] + nx * tw / 2, P[i][1] + ny * tw / 2]);
    right.push([P[i][0] - nx * tw / 2, P[i][1] - ny * tw / 2]);
  }
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color;
  ctx.beginPath(); left.forEach((q, i) => i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]));
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i][0], right[i][1]);
  ctx.closePath(); ctx.fill();
  if (bristle && w > 2.2) {
    ctx.globalAlpha *= .22; ctx.strokeStyle = color; ctx.lineWidth = Math.max(.5, w * .18);
    for (let k = 1; k <= 2; k++) {
      ctx.beginPath();
      for (let i = 0; i < P.length; i++) {
        const off = (k - 1.5) * w * .22 + (hash2(seed + k, i) - .5) * 1.2;
        const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
        let dx = b[0] - a[0], dy = b[1] - a[1]; const L = Math.hypot(dx, dy) || 1;
        const x = P[i][0] - dy / L * off, y = P[i][1] + dx / L * off;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}
function hachure(ctx, path, opts = {}) {
  const { color = PAL.ink, alpha = .12, spacing = 7, angle = -.6, seed = 3, w = 1 } = opts;
  ctx.save(); ctx.clip(path); ctx.globalAlpha *= alpha; ctx.strokeStyle = color; ctx.lineWidth = w;
  ctx.translate(540, 960); ctx.rotate(angle); ctx.translate(-540, -960);
  for (let y = -2000; y < 3000; y += spacing) {
    ctx.beginPath(); ctx.moveTo(-1500, y + (hash2(seed, y | 0) - .5) * 3); ctx.lineTo(2200, y + (hash2(seed + 1, y | 0) - .5) * 3); ctx.stroke();
  }
  ctx.restore();
}
function glow(ctx, x, y, r, color, a = .5, blend = 'screen') {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, withAlpha(color, a)); g.addColorStop(.4, withAlpha(color, a * .35)); g.addColorStop(1, withAlpha(color, 0));
  ctx.save(); ctx.globalCompositeOperation = blend; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function paperOverlay(ctx, t = 0, alpha = .13) {
  if (!TEX) buildTextures();
  if (!TEX.paperPat) initPatterns(ctx);
  ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = alpha;
  ctx.fillStyle = TEX.paperPat; ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = alpha * .35;
  const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, 'rgba(255,240,210,.9)'); g.addColorStop(.5, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(255,220,190,.6)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}
function vignette(ctx, strength = .45) {
  const g = ctx.createRadialGradient(W * .5, H * .46, H * .18, W * .5, H * .5, H * .78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.72, 'rgba(8,10,12,' + strength * .35 + ')'); g.addColorStop(1, 'rgba(8,8,10,' + strength + ')');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function bloom(ctx, src, amount = .25, blur = 18) {
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = amount; ctx.filter = `blur(${blur}px)`;
  ctx.drawImage(src, 0, 0); ctx.filter = 'none'; ctx.restore();
}
function filmGrain(ctx, frame, alpha = .035) {
  const r = rng(1000 + (frame % 7));
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < 900; i++) {
    const x = r() * W, y = r() * H, s = r() * 2 + .4;
    ctx.fillStyle = r() > .5 ? '#fff' : '#000';
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

// ---------- camera ----------
function makeCamera() {
  return { x: 0, y: 0, zoom: 1, rot: 0, shake: 0, seed: 0, frame: 0 };
}
/** Apply camera to a layer. depth<1 = far (moves less), >1 = near. */
function applyCam(ctx, cam, depth = 1, shake = true) {
  const sx = shake ? (hash2(cam.frame, 11 + cam.seed) - .5) * cam.shake : 0;
  const sy = shake ? (hash2(cam.frame, 23 + cam.seed) - .5) * cam.shake : 0;
  ctx.translate(W / 2, H / 2);
  ctx.rotate(cam.rot * depth);
  ctx.scale(cam.zoom * depth, cam.zoom * depth);
  ctx.translate(-cam.x - sx, -cam.y - sy);
}
function camKey(t, keys) {
  // keys: [[time,x,y,zoom,rot],...] linear/eased interpolation
  if (!keys.length) return { x: 0, y: 0, zoom: 1, rot: 0 };
  if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], zoom: keys[0][3], rot: keys[0][4] || 0 };
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a[0] && t <= b[0]) {
      const u = easeInOutCubic(clamp(invLerp(a[0], b[0], t)));
      return { x: lerp(a[1], b[1], u), y: lerp(a[2], b[2], u), zoom: lerp(a[3], b[3], u), rot: lerp(a[4] || 0, b[4] || 0, u) };
    }
  }
  const l = keys[keys.length - 1]; return { x: l[1], y: l[2], zoom: l[3], rot: l[4] || 0 };
}
