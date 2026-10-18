/* props.js — story props drawn in world coordinates. */
function paperCrane(ctx, x, y, s = 1, rot = 0, opts = {}) {
  const { color = '#e6dcc6', ink = '#5a4a38', alpha = 1, flap = 0 } = opts;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  const wing = Math.sin(flap) * .25;
  const p1 = new Path2D(); p1.moveTo(0, 0); p1.lineTo(-46, -22 + wing * 10); p1.lineTo(-10, 8); p1.closePath();
  const p2 = new Path2D(); p2.moveTo(0, 0); p2.lineTo(42, -26 - wing * 8); p2.lineTo(8, 10); p2.closePath();
  const body = new Path2D(); body.moveTo(-10, 8); body.lineTo(0, 32); body.lineTo(8, 10); body.lineTo(0, 0); body.closePath();
  paintShape(ctx, p1, { color, gy0: -30, gy1: 20, edgeW: 1.5, ink, inkW: 1.2, seed: 501 });
  paintShape(ctx, p2, { color: shadeColor(color, -16), gy0: -30, gy1: 20, edgeW: 1.5, ink, inkW: 1.2, seed: 502 });
  paintShape(ctx, body, { color: shadeColor(color, 8), gy0: -5, gy1: 34, edgeW: 1.2, ink, inkW: 1, seed: 503 });
  inkStroke(ctx, [[-10, 8], [0, 0], [8, 10]], { w: 1.1, color: ink, seed: 504, alpha: .7, jitter: .3 });
  ctx.restore();
}
function seedPod(ctx, x, y, s = 1, opts = {}) {
  const { open = 0, glowOn = true, t = 0, alpha = 1 } = opts;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  if (glowOn) glow(ctx, 0, -8, 90, '#b9d98a', .3 + .1 * Math.sin(t * 2));
  const p = new Path2D();
  p.moveTo(0, 34); p.bezierCurveTo(-30, 18, -28, -24, 0, -38); p.bezierCurveTo(28, -24, 30, 18, 0, 34); p.closePath();
  paintShape(ctx, p, { color: '#5d6b3d', gy0: -40, gy1: 36, edgeW: 3, texA: .35, ink: '#2c3520', inkW: 1.8, seed: 510 });
  // seam
  inkStroke(ctx, [[0, -36], [open ? -10 : 0, 0], [0, 32]], { w: 1.5, color: '#2c3520', seed: 511, alpha: .7, jitter: .4 });
  if (open > 0) {
    for (let i = 0; i < 4; i++) {
      const a = -.5 + i * .32;
      inkStroke(ctx, [[0, 0], [Math.cos(a) * 34 * open, Math.sin(a) * 20 * open]], { w: 1.4, color: '#8aa45f', seed: 512 + i, alpha: .8, jitter: .4 });
    }
    glow(ctx, 0, 0, 46 * open, '#d8f0a6', .5);
  }
  // root fibers
  for (let i = 0; i < 5; i++) inkStroke(ctx, [[-10 + i * 5, 28], [-14 + i * 7 + Math.sin(t + i) * 2, 42]], { w: 1, color: '#7b6a45', seed: 520 + i, alpha: .5, jitter: .3 });
  ctx.restore();
}
function lantern(ctx, x, y, s = 1, t = 0, lit = true, opts = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lit) glow(ctx, 0, 0, 130, '#f4c777', .28 + .03 * Math.sin(t * 9));
  ctx.strokeStyle = '#2c241a'; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.roundRect(-22, -34, 44, 58, 5); ctx.stroke();
  ctx.fillStyle = lit ? 'rgba(244,199,119,.32)' : 'rgba(80,90,90,.18)'; ctx.fill();
  inkStroke(ctx, [[-22, -34], [0, -52], [22, -34]], { w: 2, color: '#2c241a', seed: 530, alpha: .9 });
  inkStroke(ctx, [[-22, 24], [0, 36], [22, 24]], { w: 2, color: '#2c241a', seed: 531, alpha: .9 });
  if (lit) {
    ctx.fillStyle = '#ffe4a6'; ctx.beginPath(); ctx.ellipse(0, 4, 6, 12 + Math.sin(t * 10) * 2, 0, 0, TAU); ctx.fill();
    glow(ctx, 0, 4, 34, '#ffdf9e', .7);
  }
  ctx.restore();
}
function maskProp(ctx, x, y, s = 1, rot = 0, cracked = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const p = new Path2D(); p.ellipse(0, 0, 40, 28, 0, 0, TAU);
  paintShape(ctx, p, { color: '#4a5556', gy0: -30, gy1: 30, edgeW: 3, ink: '#202a2b', inkW: 2, seed: 540 });
  ctx.save(); ctx.globalAlpha = .55; ctx.fillStyle = '#9fc4c0'; ctx.beginPath(); ctx.ellipse(-8, -4, 24, 14, -.15, 0, TAU); ctx.fill(); ctx.restore();
  if (cracked) for (let i = 0; i < 3; i++) inkStroke(ctx, [[-20 + i * 12, -20], [-6 + i * 9, -2], [-14 + i * 12, 16]], { w: 1.2, color: '#c7d6cf', seed: 541 + i, alpha: .6, jitter: .3 });
  inkStroke(ctx, [[-36, 4], [-48, 16]], { w: 2, color: '#2b3333', seed: 545, alpha: .8 });
  inkStroke(ctx, [[36, 4], [48, 16]], { w: 2, color: '#2b3333', seed: 546, alpha: .8 });
  ctx.restore();
}
function deviceProp(ctx, x, y, s = 1, t = 0, mode = 'red') {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  paintShape(ctx, roundRectPath(-16, -10, 32, 20, 4), { color: '#26211d', ink: '#15110f', inkW: 1.5, seed: 550 });
  const c = mode === 'red' ? '#d5482f' : '#8fd7b1';
  const blink = .45 + .55 * (.5 + .5 * Math.sin(t * 7));
  glow(ctx, 0, 0, 20, c, .5 * blink);
  ctx.fillStyle = withAlpha(c, .75 * blink); ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
  ctx.restore();
}
function photoProp(ctx, x, y, s = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  paintShape(ctx, roundRectPath(-38, -48, 76, 96, 3), { color: '#d9c9a9', gy0: -50, gy1: 50, edgeW: 2, ink: '#584838', inkW: 1.2, seed: 560 });
  ctx.fillStyle = '#8a7b61'; ctx.fillRect(-30, -40, 60, 76);
  // two children silhouettes
  ctx.fillStyle = '#3b3228';
  ctx.beginPath(); ctx.ellipse(-10, 8, 7, 9, 0, 0, TAU); ctx.fill(); ctx.fillRect(-14, 15, 8, 18);
  ctx.beginPath(); ctx.ellipse(10, 12, 6, 8, 0, 0, TAU); ctx.fill(); ctx.fillRect(7, 18, 7, 15);
  ctx.strokeStyle = '#3b3228'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-3, 20); ctx.lineTo(7, 20); ctx.stroke();
  paperCrane(ctx, 6, -20, .18, -.2, { color: '#e6dcc6', ink: '#5a4a38', alpha: .9 });
  ctx.restore();
}
function wishPaper(ctx, x, y, s = 1, rot = 0, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + Math.sin(t * 2) * .05); ctx.scale(s, s);
  paintShape(ctx, roundRectPath(-22, -34, 44, 68, 2), { color: '#e7dcc4', gy0: -36, gy1: 36, edgeW: 1.5, ink: '#6b5a43', inkW: 1, seed: 570 });
  paperCrane(ctx, 0, 0, .32, .1, { color: '#b9a88a', ink: '#5a4a38', alpha: .8 });
  inkStroke(ctx, [[-14, 24], [14, 24]], { w: .8, color: '#8a7a60', seed: 571, alpha: .5, jitter: .2 });
  ctx.restore();
}
function blanket(ctx, x, y, w, h, color = '#7d6a52') {
  const p = smoothPath([[x - w / 2, y], [x - w / 2 + 10, y + h], [x + w / 2 - 6, y + h + 6], [x + w / 2, y + 8]], true);
  paintShape(ctx, p, { color, gy0: y, gy1: y + h, edgeW: 3, texA: .25, ink: '#3a3024', inkW: 1.5, seed: 580 });
}
function launchPod(ctx, x, y, s = 1, t = 0, flame = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const p = new Path2D(); p.moveTo(0, -70); p.bezierCurveTo(34, -40, 36, 40, 0, 72); p.bezierCurveTo(-36, 40, -34, -40, 0, -70);
  paintShape(ctx, p, { color: '#3b4448', gy0: -72, gy1: 72, edgeW: 5, texA: .25, ink: '#1a2224', inkW: 2.2, seed: 590 });
  ctx.fillStyle = '#8fb9b3'; ctx.beginPath(); ctx.ellipse(0, -30, 14, 18, 0, 0, TAU); ctx.fill();
  if (flame > 0) {
    glow(ctx, 0, 70, 90 * flame, '#ffb45e', .55 * flame);
    for (let i = 0; i < 4; i++) inkStroke(ctx, [[-10 + i * 6, 64], [-6 + i * 4, 64 + 70 * flame * (.6 + hash2(600 + i, 1))]], { w: 4, color: i % 2 ? '#ffd27a' : '#e86e3a', seed: 601 + i, alpha: .5, jitter: 1 });
  }
  ctx.restore();
}
function shard(ctx, x, y, w, h, rot, alpha = .5, color = '#cfe0d8') {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.fillStyle = color; ctx.beginPath();
  ctx.moveTo(x, y); ctx.lineTo(x + w, y + h * .2); ctx.lineTo(x + w * .5, y + h); ctx.lineTo(x - w * .3, y + h * .4); ctx.closePath(); ctx.fill();
  ctx.restore();
}
