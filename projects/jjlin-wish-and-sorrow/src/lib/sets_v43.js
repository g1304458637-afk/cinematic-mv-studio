/* sets.js — painterly 2.5D sets, drawn in world coordinates (1080x1920 at cam 1). */
const WORLD = { w: 1080, h: 1920 };

function skyGradient(ctx, top, mid, bottom, y0 = -500, y1 = 2000) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, top); g.addColorStop(.55, mid); g.addColorStop(1, bottom);
  ctx.fillStyle = g; ctx.fillRect(-700, y0, 2480, y1 - y0 + 300);
}
function cloudBand(ctx, y, h, color, alpha, seed, t = 0, speed = 1) {
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < 26; i++) {
    const x = ((i * 137 + t * 5 * speed + hash2(seed, i) * 400) % 1900) - 500;
    const yy = y + (hash2(seed + 1, i) - .5) * h;
    const rx = 90 + hash2(seed + 2, i) * 220, ry = 24 + hash2(seed + 3, i) * 70;
    const g = ctx.createRadialGradient(x, yy, 0, x, yy, rx);
    g.addColorStop(0, withAlpha(color, .5)); g.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x, yy, rx, ry, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function stars(ctx, t, n = 90, seed = 4, alpha = .5) {
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const x = hash2(seed, i) * 1600 - 260, y = hash2(seed + 1, i) * 1000 - 200;
    const tw = .5 + .5 * Math.sin(t * (.6 + hash2(seed + 2, i)) + i);
    ctx.fillStyle = withAlpha('#dce6dd', .3 + tw * .5);
    ctx.beginPath(); ctx.arc(x, y, .8 + hash2(seed + 3, i) * 1.8, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function ashMotes(ctx, t, cam, n = 220, seed = 8, opts = {}) {
  const { color = '#c9bda6', alpha = .5, speed = 12, size = 2, wind = 1 } = opts;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const baseX = hash2(seed, i) * 2200 - 600, baseY = hash2(seed + 1, i) * 2200 - 200;
    const x = baseX + t * speed * wind * (.4 + hash2(seed + 2, i)) + Math.sin(t * .4 + i) * 18;
    const y = ((baseY + t * speed * (.2 + hash2(seed + 3, i) * .5)) % 2300) - 200;
    const a = alpha * (.3 + hash2(seed + 4, i) * .7);
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.ellipse(x, y, size * (.5 + hash2(seed + 5, i)), size * .45, hash2(seed + 6, i) * 3, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function rain(ctx, t, n = 320, opts = {}) {
  const { alpha = .45, color = '#b7d0d2', len = 60, speed = 1700, slant = .16, seed = 12, top = -400, bottom = 2300 } = opts;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x = hash2(seed, i) * 2100 - 510 + Math.sin(t * .3 + i) * 20;
    const y = ((hash2(seed + 1, i) * 2600 + t * speed * (.55 + hash2(seed + 2, i) * .7)) % (bottom - top)) + top;
    const l = len * (.4 + hash2(seed + 3, i));
    ctx.globalAlpha = alpha * (.25 + hash2(seed + 4, i) * .75);
    ctx.strokeStyle = color; ctx.lineWidth = .7 + hash2(seed + 5, i) * 1.6;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l * slant, y + l); ctx.stroke();
  }
  ctx.restore();
}
function ridge(ctx, pts, color, inkC, seed, edge = 3) {
  const p = smoothPath(pts, true);
  paintShape(ctx, p, { color, gy0: -200, gy1: 1900, edgeW: 18, texA: .22, ink: inkC, inkW: edge, seed });
  return p;
}
function ark(ctx, x, y, s, t, alpha = .8, lights = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = alpha;
  // whale-like generation ship: a long spine, ribs, hanging modules
  const p = new Path2D();
  p.moveTo(-260, 0); p.bezierCurveTo(-200, -52, -40, -70, 120, -44);
  p.bezierCurveTo(220, -28, 280, -8, 300, 10); p.bezierCurveTo(220, 26, 130, 36, 20, 34);
  p.bezierCurveTo(-90, 32, -190, 22, -260, 0); p.closePath();
  paintShape(ctx, p, { color: '#2b3439', gy0: -60, gy1: 40, edgeW: 4, texA: .2, ink: '#11181a', inkW: 2, seed: 21 });
  // ribs
  for (let i = 0; i < 9; i++) {
    const xx = -180 + i * 46;
    inkStroke(ctx, [[xx, -34 + Math.sin(i) * 6], [xx + 18, 0], [xx, 28]], { w: 2.2, color: '#4c5a5d', seed: 30 + i, taper: .3, alpha: .8, jitter: .5 });
  }
  // hanging lights
  if (lights) {
    for (let i = 0; i < 22; i++) {
      const xx = -170 + hash2(40, i) * 390, yy = 14 + hash2(41, i) * 48;
      const a = .35 + .65 * (.5 + .5 * Math.sin(t * 1.4 + i));
      glow(ctx, xx, yy, 8 + hash2(42, i) * 18, i % 5 ? '#e8c377' : '#9fd6c8', .25 * a);
      ctx.fillStyle = withAlpha(i % 5 ? '#ffe4a6' : '#d6fff2', .8 * a);
      ctx.beginPath(); ctx.arc(xx, yy, 1.1, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
}
function dome(ctx, x, groundY, r, opts = {}) {
  const { broken = 0, glowC = '#9ec7a1', glass = .18, ribs = 11, seed = 50, night = false } = opts;
  ctx.save();
  // glass fill
  const gx = ctx.createRadialGradient(x - r * .2, groundY - r * .5, r * .1, x, groundY - r * .3, r * 1.1);
  gx.addColorStop(0, withAlpha(glowC, glass * 1.2)); gx.addColorStop(.6, withAlpha('#5f7d78', glass * .55)); gx.addColorStop(1, withAlpha('#2a3b3a', glass * .2));
  ctx.fillStyle = gx; ctx.beginPath(); ctx.arc(x, groundY, r, Math.PI, TAU); ctx.fill();
  // ribs
  for (let i = 0; i <= ribs; i++) {
    const a = Math.PI + (i / ribs) * Math.PI;
    const ex = x + Math.cos(a) * r, ey = groundY + Math.sin(a) * r;
    const mx = x + Math.cos(a) * r * .55, my = groundY + Math.sin(a) * r * .55;
    inkStroke(ctx, [[x, groundY], [mx, my], [ex, ey]], { w: 2.2, color: night ? '#6f857c' : '#566b61', seed: seed + i, taper: .25, alpha: .55, jitter: .6 });
  }
  // horizontal rings
  for (let k = 1; k <= 3; k++) {
    const rr = r * (k / 4);
    ctx.save(); ctx.globalAlpha = .22; ctx.strokeStyle = '#8aa597'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(x, groundY, rr, Math.PI, TAU); ctx.stroke(); ctx.restore();
  }
  // broken panes
  if (broken > 0) {
    for (let i = 0; i < broken; i++) {
      const a = Math.PI + hash2(seed + 10, i) * Math.PI, rr = r * (.55 + hash2(seed + 11, i) * .42);
      const bx = x + Math.cos(a) * rr, by = groundY + Math.sin(a) * rr;
      ctx.save(); ctx.globalAlpha = .28; ctx.fillStyle = '#dce9e2';
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 40 + hash2(seed + 12, i) * 60, by - 30); ctx.lineTo(bx + 20, by + 50); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  }
  // base stone ring
  ctx.save(); ctx.globalAlpha = .55; ctx.strokeStyle = '#3b3a31'; ctx.lineWidth = 8;
  ctx.beginPath(); ctx.arc(x, groundY, r, Math.PI, TAU); ctx.stroke(); ctx.restore();
  ctx.restore();
}

// ---------------- ORCHARD INTERIOR ----------------
function setOrchard(ctx, t, cam, opts = {}) {
  const { night = false, storm = 0, broken = 0, tree = 0, warm = 1, clutter = 1 } = opts;
  ctx.save(); applyCam(ctx, cam, 1, false);
  // background shell
  const top = night ? '#141b1c' : '#2d3b38', bottom = night ? '#1a1713' : '#3a3126';
  ctx.fillStyle = night ? '#141a1a' : '#26312e'; ctx.fillRect(-700, -600, 2480, 2700);
  // dome back: tall arched window panes
  const wx = 540, wy = 1220, wr = 560;
  ctx.save();
  const sky = ctx.createLinearGradient(0, 150, 0, 1200);
  if (storm > .4) { sky.addColorStop(0, '#263746'); sky.addColorStop(.6, '#3c4d55'); sky.addColorStop(1, '#6b6352'); }
  else if (night) { sky.addColorStop(0, '#0e1a21'); sky.addColorStop(.6, '#1d3032'); sky.addColorStop(1, '#4b4b3d'); }
  else { sky.addColorStop(0, '#8fa7a0'); sky.addColorStop(.55, '#b4b59d'); sky.addColorStop(1, '#c7a878'); }
  ctx.fillStyle = sky;
  ctx.beginPath(); ctx.arc(wx, wy, wr * 1.25, Math.PI * 1.02, TAU * .49); ctx.lineTo(wx + wr * 1.25, 1250); ctx.lineTo(wx - wr * 1.25, 1250); ctx.closePath(); ctx.fill();
  // distant ash plain through glass
  ctx.save(); ctx.globalAlpha = .55;
  ctx.fillStyle = night ? '#3b403a' : '#8f8268';
  ctx.beginPath(); ctx.moveTo(wx - wr, 880); ctx.quadraticCurveTo(wx - 200, 780, wx, 840); ctx.quadraticCurveTo(wx + 240, 900, wx + wr, 820); ctx.lineTo(wx + wr, 1250); ctx.lineTo(wx - wr, 1250); ctx.closePath(); ctx.fill();
  ctx.restore();
  // stars / ark through glass
  if (night) stars(ctx, t, 60, 70, .35);
  ark(ctx, wx + 330, 380 + Math.sin(t * .05) * 10, .42, t, night ? .55 : .32, true);
  // glass ribs (interior)
  for (let i = -5; i <= 5; i++) {
    const a = -Math.PI / 2 + i * .28;
    inkStroke(ctx, [[wx + Math.cos(a) * 120, 1180], [wx + Math.cos(a) * 300, 760], [wx + Math.cos(a) * 520, 300]], { w: 3.2, color: night ? '#4d5c55' : '#6b796d', seed: 60 + i, taper: .2, alpha: .5, jitter: .5 });
  }
  for (let k = 0; k < 4; k++) {
    ctx.save(); ctx.globalAlpha = .18; ctx.strokeStyle = '#9aab97'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(wx, 1120, 430 - k * 85, 760 - k * 160, 0, Math.PI, TAU); ctx.stroke(); ctx.restore();
  }
  // broken pane
  if (broken > 0) {
    ctx.save(); ctx.globalAlpha = .3; ctx.fillStyle = '#d7e5df';
    ctx.beginPath(); ctx.moveTo(wx - 180, 520); ctx.lineTo(wx - 90, 470); ctx.lineTo(wx - 140, 630); ctx.lineTo(wx - 40, 700); ctx.lineTo(wx - 210, 660); ctx.closePath(); ctx.fill(); ctx.restore();
    for (let i = 0; i < 5; i++) {
      const sx = wx - 200 + i * 50, sy = 500 + hash2(80, i) * 180;
      inkStroke(ctx, [[sx, sy], [sx + 18, sy + 30], [sx - 6, sy + 62]], { w: 1.2, color: '#cfe0d8', seed: 82 + i, alpha: .5, jitter: .4 });
    }
  }
  ctx.restore();
  // floor
  const fl = ctx.createLinearGradient(0, 1180, 0, 2000);
  fl.addColorStop(0, night ? '#2c2620' : '#4c4030'); fl.addColorStop(1, night ? '#151311' : '#2e2820');
  ctx.fillStyle = fl; ctx.fillRect(-700, 1180, 2480, 900);
  for (let i = 0; i < 14; i++) {
    const yy = 1210 + i * 58;
    inkStroke(ctx, [[-300, yy], [540, yy + (i % 2 ? 4 : -2)], [1400, yy]], { w: 1.6, color: night ? '#0f0d0b' : '#342b20', seed: 90 + i, alpha: .45, jitter: .6 });
  }
  // back shelves / empty pots
  const shelfY = 980;
  ctx.save(); ctx.globalAlpha = .95;
  paintShape(ctx, roundRectPath(110, shelfY, 300, 14, 4), { color: '#4b3b2b', gy0: shelfY, gy1: shelfY + 14, edgeW: 3, ink: '#2a2118', inkW: 2, seed: 100 });
  paintShape(ctx, roundRectPath(700, shelfY + 40, 290, 14, 4), { color: '#4b3b2b', gy0: shelfY + 40, gy1: shelfY + 54, edgeW: 3, ink: '#2a2118', inkW: 2, seed: 101 });
  for (let i = 0; i < 5; i++) pot(ctx, 150 + i * 52, shelfY, 22 + (i % 3) * 5, 26, night ? '#5b5040' : '#7c6a51', 1 - i * .06);
  for (let i = 0; i < 4; i++) pot(ctx, 740 + i * 62, shelfY + 40, 24, 30, '#6b5a45', .9);
  ctx.restore();
  // hanging dried plants
  for (let i = 0; i < 4; i++) {
    const hx = 180 + i * 70, hy = 600 + (i % 2) * 40;
    inkStroke(ctx, [[hx, hy], [hx + 2, hy + 120]], { w: 1.2, color: '#6e5a3c', seed: 110 + i, alpha: .5, jitter: .4 });
    for (let k = 0; k < 4; k++) {
      inkStroke(ctx, [[hx, hy + 40 + k * 18], [hx + 18 * (k % 2 ? 1 : -1), hy + 60 + k * 18]], { w: 1, color: '#7d6a45', seed: 120 + i * 4 + k, alpha: .35, jitter: .4 });
    }
  }
  // central raised seed bed
  const bedX = 540, bedY = 1420;
  paintShape(ctx, roundRectPath(bedX - 190, bedY - 20, 380, 95, 18), { color: night ? '#3a3127' : '#5c4a35', gy0: bedY - 20, gy1: bedY + 75, edgeW: 6, ink: '#2a2118', inkW: 3, seed: 130 });
  paintShape(ctx, ellipsePath(bedX, bedY - 8, 170, 28), { color: night ? '#2a251e' : '#3e3225', gy0: bedY - 30, gy1: bedY + 15, edgeW: 4, ink: '#241c15', inkW: 2, seed: 131 });
  // sapling / tree
  drawTree(ctx, bedX, bedY - 10, tree, { night, glow: true, seed: 140 });
  // lamp
  lamp(ctx, 300, 700, 1.1, t, warm, night);
  // worktable left
  ctx.save(); ctx.globalAlpha = .95;
  paintShape(ctx, roundRectPath(60, 1330, 250, 22, 4), { color: '#5a432d', gy0: 1330, gy1: 1352, edgeW: 4, ink: '#2d2216', inkW: 2.2, seed: 150 });
  paintShape(ctx, roundRectPath(80, 1352, 18, 180, 3), { color: '#3f2f20', seed: 151 });
  paintShape(ctx, roundRectPath(272, 1352, 18, 180, 3), { color: '#3f2f20', seed: 152 });
  for (let i = 0; i < 3; i++) pot(ctx, 95 + i * 56, 1310, 18, 22, '#6f5a43', .9);
  // lantern
  glow(ctx, 300, 700, 210, '#f0c477', night ? .4 : .28);
  ctx.restore();
  // right foreground / ladder
  for (let i = 0; i < 2; i++) inkStroke(ctx, [[850 + i * 36, 520], [820 + i * 36, 1500]], { w: 5, color: '#4a3a28', seed: 160 + i, taper: .1, alpha: .85, jitter: .5 });
  for (let i = 0; i < 7; i++) inkStroke(ctx, [[848, 620 + i * 120], [888, 620 + i * 120]], { w: 3.2, color: '#4a3a28', seed: 170 + i, alpha: .8, jitter: .5 });
  // foreground pots / leaves
  for (let i = 0; i < 3; i++) pot(ctx, 930 - i * 90, 1750, 42, 50, night ? '#2f2a22' : '#4e4232', 1, true);
  // dust
  ashMotes(ctx, t, cam, night ? 120 : 160, 180, { color: night ? '#8b9488' : '#d8c6a4', alpha: night ? .3 : .35, speed: 8, size: 1.6 });
  ctx.restore();
}
function pot(ctx, x, y, w, h, color, alpha = 1, big = false) {
  ctx.save(); ctx.globalAlpha *= alpha;
  const p = new Path2D();
  p.moveTo(x - w, y - h); p.lineTo(x + w, y - h); p.quadraticCurveTo(x + w * .78, y, x + w * .55, y + h * .15);
  p.quadraticCurveTo(x, y + h * .3, x - w * .55, y + h * .15); p.quadraticCurveTo(x - w * .78, y, x - w, y - h);
  paintShape(ctx, p, { color, gy0: y - h, gy1: y + h * .2, edgeW: 3, texA: .2, ink: '#2b2219', inkW: 1.6, seed: (x | 0) + (y | 0) });
  ctx.restore();
}
function lamp(ctx, x, y, s, t, warm = 1, night = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  glow(ctx, 0, 0, 180, '#f0c477', (night ? .34 : .26) * warm);
  inkStroke(ctx, [[0, -260], [0, -40]], { w: 1.6, color: '#2c241a', seed: 201, alpha: .7, jitter: .4 });
  paintShape(ctx, new Path2D(), {});
  const shade = new Path2D(); shade.moveTo(-55, -40); shade.lineTo(55, -40); shade.lineTo(28, 10); shade.lineTo(-28, 10); shade.closePath();
  paintShape(ctx, shade, { color: '#3b3022', gy0: -50, gy1: 12, edgeW: 3, ink: '#241c13', inkW: 1.8, seed: 202 });
  ctx.fillStyle = '#f6d38c'; ctx.beginPath(); ctx.ellipse(0, 12, 24, 6, 0, 0, TAU); ctx.fill();
  glow(ctx, 0, 16, 60, '#ffdf9e', .55);
  ctx.restore();
}
function drawTree(ctx, x, y, stage, opts = {}) {
  // stage 0 = seed/sprout, 1 = young tree, 2 = full tree, 3 = giant
  const { night = false, glow: glowing = true, seed = 300 } = opts;
  if (stage <= 0.001) {
    glow(ctx, x, y - 24, 70, '#b9d98a', .35);
    inkStroke(ctx, [[x, y], [x - 4, y - 34]], { w: 3, color: '#5a6b3e', seed, taper: .5, alpha: .9, jitter: .4 });
    for (let i = 0; i < 3; i++) {
      const a = -2.2 + i * .75, rx = 18 + i * 4;
      paintShape(ctx, ellipsePath(x + Math.cos(a) * rx, y - 34 + Math.sin(a) * rx * .5, 16, 8, a), { color: i % 2 ? '#7f9b56' : '#9db86a', gy0: y - 50, gy1: y - 10, edgeW: 2, ink: '#435030', inkW: 1.2, seed: seed + i });
    }
    return;
  }
  const scale = stage === 1 ? .35 : stage === 2 ? .8 : 1;
  const H = 620 * scale, W = 360 * scale;
  // trunk
  const trunk = new Path2D();
  trunk.moveTo(x - 26 * scale, y); trunk.bezierCurveTo(x - 30 * scale, y - H * .3, x - 16 * scale, y - H * .65, x - 8 * scale, y - H);
  trunk.lineTo(x + 10 * scale, y - H); trunk.bezierCurveTo(x + 20 * scale, y - H * .6, x + 30 * scale, y - H * .25, x + 30 * scale, y);
  paintShape(ctx, trunk, { color: night ? '#3a3326' : '#5a4a35', gy0: y - H, gy1: y, edgeW: 8, texA: .35, ink: '#241e17', inkW: 3.2, seed: seed + 1 });
  // branches
  const branches = stage === 1 ? 7 : stage === 2 ? 14 : 22;
  for (let i = 0; i < branches; i++) {
    const side = i % 2 ? 1 : -1;
    const yy = y - H * (.38 + hash2(seed + 2, i) * .55);
    const bx = x + side * (18 + hash2(seed + 3, i) * 40) * scale;
    const ex = x + side * (60 + hash2(seed + 4, i) * W) ;
    const ey = yy - (30 + hash2(seed + 5, i) * 110) * scale;
    inkStroke(ctx, [[x, yy], [bx, yy - 20 * scale], [ex, ey]], { w: (5 - i * .1) * scale + 1, color: night ? '#3a3326' : '#5a4a35', seed: seed + 10 + i, taper: .5, alpha: .9, jitter: .5 });
    // leaf clusters
    const nl = stage === 1 ? 2 : 3;
    for (let k = 0; k < nl; k++) {
      const lx = ex + (hash2(seed + 20 + i, k) - .5) * 100 * scale, ly = ey + (hash2(seed + 30 + i, k) - .5) * 70 * scale;
      const c = k % 2 ? (night ? '#3d4d38' : '#6e8a4f') : (night ? '#4b5c42' : '#8aa45f');
      paintShape(ctx, blobPath(lx, ly, (28 + hash2(seed + 40 + i, k) * 30) * scale, (18 + hash2(seed + 50 + i, k) * 18) * scale, seed + i * 7 + k, .25, 11), { color: c, gy0: ly - 40, gy1: ly + 30, edgeW: 3, texA: .25, ink: night ? '#22301f' : '#3c4a2b', inkW: 1.2, seed: seed + 60 + i * 5 + k });
    }
  }
  if (glowing) glow(ctx, x, y - H * .6, 160 * scale, '#b9d98a', night ? .25 : .18);
}
