/* blocks.js — the 45 shots. Each: (ctx, p) where p={t01, abs, f}. */
'use strict';
const SOX = (BW - W) / 2, SOY = (BH - H) / 2;
const FL_INT = BH * .70 - SOY;            // interior floor (screen y)
const WALLY = BH * .34 - SOY;             // interior wall base
const SEED_X = 830, SEED_Y = FL_INT;      // seedling position (screen)
const TALLY_X = BW * .38 - SOX, TALLY_Y = BH * .44 - SOY;

// camera group opener. k: {zoom,px,py,rot,shake} as fn(t01) or number
function layer(ctx, p, k = {}, depth = 1) {
  ctx.save();
  const z = typeof k.zoom === 'function' ? k.zoom(p.t01) : (k.zoom || 1);
  const px = typeof k.px === 'function' ? k.px(p.t01) : (k.px || 0);
  const py = typeof k.py === 'function' ? k.py(p.t01) : (k.py || 0);
  const r = typeof k.rot === 'function' ? k.rot(p.t01) : (k.rot || 0);
  const sh = typeof k.shake === 'function' ? k.shake(p.t01) : (k.shake || 0);
  const sx = (hash2(p.f, 3) - .5) * sh * depth, sy = (hash2(p.f, 7) - .5) * sh * depth;
  const zz = 1 + (z - 1) * depth;
  ctx.translate(W / 2, H / 2); ctx.rotate(r * depth); ctx.scale(zz, zz);
  ctx.translate(-W / 2 + px * depth + sx, -H / 2 + py * depth + sy);
}
function bgDraw(ctx, set) { ctx.drawImage(set.c, -SOX, -SOY, BW, BH); }
function person(ctx, who, x, y, h, o = {}) { drawPerson(ctx, o.t || 0, Object.assign({ who, x, y, h }, o)); }
function breath(t, seed = 5) { return { x: noise1(t * 2.2, seed) * 7 - 3.5, y: noise1(t * 1.9 + 9, seed) * 5 - 2.5 }; }
function dofDim(ctx, cx, cy, rx, ry, a = .4) {
  const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(rx, ry));
  g.addColorStop(0, 'rgba(18,16,14,0)'); g.addColorStop(.55, `rgba(18,16,14,${a * .35})`); g.addColorStop(1, `rgba(18,16,14,${a})`);
  ctx.save(); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}

/* ===== S01 — 0.00–6.42 · EWS · ash sea, the far dome ===== */
const S01 = (ctx, p) => {
  const ash = ashMotes(170, 7);
  layer(ctx, p, { zoom: 1.06, px: t => lerp(46, -46, easeInOutCubic(t)), py: t => Math.sin(t * 3) * 6 });
  bgDraw(ctx, getSet('ashsea', setAshSea));
  // the dome's green heartbeat
  const dx = BW * .70 - SOX, dy = BH * .615 - SOY, gp = .55 + .45 * Math.sin(p.abs * 1.6);
  glow(ctx, dx, dy, 60, '#8fb96e', .35 * gp);
  glow(ctx, dx, dy, 150, '#7fa05a', .12 * gp);
  layer(ctx, p, {}, 1.12);
  drawAsh(ctx, ash, p.abs, { dir: -1, alpha: .5 });
  drawAsh(ctx, ash.slice(60), p.abs * .6, { dir: -1, alpha: .8, color: 'rgba(140,135,125,' });
  ctx.restore(); ctx.restore();
  tFade(ctx, p.t01, .22, '#0a0908'); // in 1.4s
};

/* ===== S02 — 6.42–10.08 · WS · the ark and the falling pod ===== */
const S02 = (ctx, p) => {
  const b = breath(p.abs, 9);
  layer(ctx, p, { px: b.x, py: b.y, zoom: 1.04 });
  bgDraw(ctx, getSet('arksky', setArkSky));
  const ax = lerp(1250, 120, easeInOutCubic(p.t01)), ay = 300 + b.y * 2;
  drawArk(ctx, ax, ay, .78, p.abs, { color: '#232b33' });
  glow(ctx, ax, ay + 26, 300, '#5b7180', .10);
  // pod detaches
  const dt = clamp((p.t01 - .48) / .5);
  if (dt > 0) {
    const px2 = lerp(ax + 40, ax + 210, dt), py2 = lerp(ay + 46, 900, easeInCubic(dt));
    layer(ctx, p, {}, 1);
    ctx.save(); ctx.translate(px2, py2);
    const g = ctx.createLinearGradient(0, 0, 0, 420);
    g.addColorStop(0, 'rgba(240,150,80,.5)'); g.addColorStop(1, 'rgba(240,150,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-9, 8); ctx.lineTo(9, 8); ctx.lineTo(24, 420); ctx.lineTo(-24, 420); ctx.closePath(); ctx.fill();
    ctx.restore();
    drawPod(ctx, px2, py2, 1, Math.sin(p.abs * 3) * .12, p.abs, { ember: dt });
  }
  ctx.restore();
  drawAsh(ctx, ashMotes(60, 12), p.abs, { alpha: .3, dir: -1 });
  tFade(ctx, p.t01, .2, '#0a0908');
};

/* ===== S03 — 10.08–12.71 · ECU · the dust grain and the spore ===== */
const S03 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.02, 1.14, easeInOutCubic(t)) });
  bgDraw(ctx, getSet('macrosill', setMacroSill));
  ctx.restore();
  const cx = 470, cy = 780;
  const split = smoothstep(.30, .52, p.t01);
  // dust grain halves
  ctx.save();
  ctx.fillStyle = '#9a917f';
  ctx.beginPath(); ctx.ellipse(cx - 26 * split, cy + Math.sin(p.abs * 6) * 3, 30 * (1 - split * .5), 22 * (1 - split * .4), .3, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.ellipse(cx + 30 * split, cy - 4 * split + Math.sin(p.abs * 6 + 1) * 3, 26 * (1 - split * .5), 20 * (1 - split * .4), -.2, 0, TAU); ctx.fill();
  ctx.restore();
  // green spore revealed
  if (split > .05) glow(ctx, cx, cy, 70 * split, '#a9d98a', .8 * split);
  if (split > .05) { ctx.fillStyle = `rgba(150,205,110,${.9 * split})`; ctx.beginPath(); ctx.arc(cx, cy, 9 * split, 0, TAU); ctx.fill(); }
  drawSpores(ctx, sporeBits(26, 4), p.abs);
  // Mu's fingers enter from top and cup the spore
  const dy = smoothstep(.45, .85, p.t01);
  ctx.save();
  ctx.translate(cx + 6, lerp(-260, 120, dy));
  drawHand(ctx, 0, 0, 118, 1, { curl: .35 + dy * .5, spread: .8, rot: .5 }, 21, Math.floor(p.abs * 12));
  ctx.restore();
  tDip(ctx, p.t01, .5, .1);
};

/* ===== S04 — 12.71–17.58 · MS · watering the seedling ===== */
const S04 = (ctx, p) => {
  const b = breath(p.abs, 3);
  layer(ctx, p, { zoom: t => lerp(1.0, 1.16, easeInOutCubic(t)), px: t => lerp(30, 70, t) + b.x, py: b.y });
  bgDraw(ctx, getSet('int_day', () => setOrchardInt('day')));
  // soil pot + seedling (right third)
  ctx.save(); ctx.translate(SEED_X, SEED_Y);
  paintShape(ctx, polyPath([[-64, 0], [58, 0], [46, -78], [-52, -78]]), { color: '#6b563f', ink: '#2e2418', inkW: 4, texA: .2, seed: 2 });
  paintShape(ctx, ellipsePath(0, -78, 52, 12), { color: '#3a2e22', ink: null, seed: 3 });
  drawSeedling(ctx, 4, -80, 1.05, .22 + p.t01 * .06, p.abs, { wind: .1 });
  ctx.restore();
  // Mu at left, eyedropper
  const g = .22 + p.t01 * .06;
  person(ctx, 'mu', 400, FL_INT, 600, {
    expression: 'soft', turn: .5,
    pose: {
      lean: -.04, headTilt: .05,
      handR: [SEED_X - 40, SEED_Y - 210 - g * 40], handL: [330, FL_INT - 300],
      handRPose: { curl: .55, rot: -.4 }, handLPose: { curl: .3 }
    }, wind: .05
  });
  // eyedropper + falling drop
  const dropT = (p.abs * 1.4) % 1;
  ctx.save(); ctx.translate(SEED_X - 40, SEED_Y - 210 - g * 40);
  ctx.rotate(-.5); paintShape(ctx, capsulePath(0, -60, 0, 30, 9, 5), { color: 'rgba(190,210,205,.55)', ink: '#57514a', inkW: 2, shade: false, seed: 5 }); ctx.restore();
  if (dropT > .55) {
    const dp = (dropT - .55) / .45;
    ctx.fillStyle = 'rgba(180,220,200,.9)';
    ctx.beginPath(); ctx.ellipse(SEED_X - 47, SEED_Y - 205 - g * 40 + dp * 110, 5, 7 + dp * 2, 0, 0, TAU); ctx.fill();
    glow(ctx, SEED_X - 47, SEED_Y - 205 - g * 40 + dp * 110, 20, '#b9d98a', .5);
  }
  // she wipes condensation from a leaf (t>0.62)
  const w = smoothstep(.62, 1, p.t01);
  if (w > 0) {
    ctx.save(); ctx.globalAlpha = w * .8; ctx.fillStyle = 'rgba(220,235,230,.5)';
    ctx.beginPath(); ctx.arc(SEED_X - 60 + w * 60, SEED_Y - 250, 8 + w * 10, 0, TAU); ctx.fill(); ctx.restore();
  }
  ctx.restore();
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S05 — 17.58–22.21 · CU · the chalk tally ===== */
const S05 = (ctx, p) => {
  const b = breath(p.abs, 11);
  layer(ctx, p, { zoom: t => lerp(1.42, 1.56, easeInOutCubic(t)), px: t => lerp(150, 168, t) + b.x, py: t => lerp(178, 196, t) + b.y });
  bgDraw(ctx, getSet('int_day', () => setOrchardInt('day')));
  // chalk in hand, a new mark being drawn
  const mark = smoothstep(.12, .6, p.t01);
  ctx.save(); ctx.translate(TALLY_X + 40 + mark * 66, TALLY_Y - 40);
  ctx.strokeStyle = 'rgba(235,228,210,.95)'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-33, 42); ctx.lineTo(-33 + 66 * mark, 42 - 66 * mark); ctx.stroke();
  ctx.restore();
  // her hand with the chalk
  person(ctx, 'mu', 1010, FL_INT + 210, 760, {
    expression: 'neutral', turn: -.8, face: facePreset('neutral', { lid: .1 }),
    pose: { lean: -.1, headTilt: .04, handR: [TALLY_X + 66, TALLY_Y - 18], handRPose: { curl: .7, rot: .2 }, handL: [700, FL_INT - 240] }
  });
  // chalk dust
  ctx.save(); ctx.fillStyle = 'rgba(235,228,210,.5)';
  for (let i = 0; i < 8; i++) {
    const a = p.abs * 2 + i;
    ctx.globalAlpha = .3 + .3 * Math.sin(a * 3);
    ctx.fillRect(TALLY_X + 40 + mark * 66 + Math.sin(a) * 14, TALLY_Y - 30 + Math.cos(a * 1.3) * 14, 2.4, 2.4);
  }
  ctx.restore();
  // palm pressed to the glass at the end
  const pr = smoothstep(.82, 1, p.t01);
  if (pr > 0) {
    ctx.save(); ctx.globalAlpha = pr * .9;
    ctx.translate(560, 700);
    drawHand(ctx, 0, 0, 150, -1, { curl: .1, spread: 1.1, rot: -.15 }, 31, Math.floor(p.abs * 12));
    ctx.restore();
  }
  ctx.restore();
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S09 — 39.17–45.67 · WS · dusk, the ember trail grows, she runs ===== */
const S09 = (ctx, p) => {
  const b = breath(p.abs, 21);
  layer(ctx, p, { zoom: 1.05, px: t => lerp(-30, 40, easeInOutCubic(t)) + b.x * 2, py: b.y * 2, shake: 2.2 });
  bgDraw(ctx, getSet('dome_dusk', () => setDomeExt('dusk')));
  // the ember trail grows in the sky
  const tr = clamp(p.t01 * 1.3);
  const tx = lerp(980, 700, tr), ty = lerp(120, 620, tr);
  ctx.save();
  const g = ctx.createLinearGradient(tx, ty - 500, tx, ty);
  g.addColorStop(0, 'rgba(240,150,80,0)'); g.addColorStop(1, `rgba(240,150,80,${.5 * tr})`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(tx - 8, ty - 520); ctx.lineTo(tx + 8, ty - 520); ctx.lineTo(tx + 30, ty); ctx.lineTo(tx - 30, ty); ctx.closePath(); ctx.fill();
  ctx.restore();
  glow(ctx, tx, ty, 160 * tr, '#f0b466', .5 * tr);
  drawPod(ctx, tx, ty, 1, .3, p.abs, { ember: tr });
  // Mu runs out of the dome toward camera-right, scarf whipping
  const run = p.t01 * 6.5, rx = lerp(560, 760, easeInOutCubic(p.t01));
  const sw = Math.sin(run), sw2 = Math.sin(run + Math.PI);
  person(ctx, 'mu', rx, FL_INT + 130, 640, {
    expression: 'fear', turn: .2,
    pose: {
      lean: .16, pelvisY: -.5 + Math.abs(Math.sin(run * 2)) * .015,
      handL: [rx - 120 + sw * 70, FL_INT + 130 - 330 + Math.abs(sw) * 50],
      handR: [rx + 120 - sw * 70, FL_INT + 130 - 300 + Math.abs(sw2) * 50],
      handLPose: { curl: .5 }, handRPose: { curl: .5 },
      footL: [rx - 60 + sw * 80, FL_INT + 130], footR: [rx + 60 - sw * 80, FL_INT + 130]
    }, wind: .9
  });
  ctx.restore();
  drawAsh(ctx, ashMotes(90, 31), p.abs, { alpha: .5, dir: -1 });
  drawEmbers(ctx, emberBits(40, 33), p.abs, {});
  tFade(ctx, p.t01, .22, '#0a0908');
};

/* ===== S10 — 45.67–52.42 · MS · the pod tumbles, the scarf tears free ===== */
const S10 = (ctx, p) => {
  const b = breath(p.abs, 22);
  layer(ctx, p, { zoom: t => lerp(1.1, 1.22, easeInOutCubic(t)), px: t => lerp(40, 90, t) + b.x * 2, py: b.y * 2, shake: 3 });
  bgDraw(ctx, getSet('dome_dusk', () => setDomeExt('dusk')));
  // pod tumbles behind the ridge with a retro-burn
  const t0 = clamp(p.t01 * 1.25);
  const px2 = lerp(760, 1080, t0), py2 = lerp(300, 430, t0) + Math.sin(p.t01 * 8) * 16;
  drawPod(ctx, px2, py2, .9, Math.sin(p.abs * 4) * .3 + 1.2, p.abs, { ember: .4 + t0 * .6 });
  const burn = smoothstep(.55, .75, p.t01) * (1 - smoothstep(.8, .95, p.t01));
  if (burn > 0) { glow(ctx, px2, py2, 320 * burn, '#f0b466', .8 * burn); tFlash(ctx, burn * .18); }
  // Mu, closer: shielding her eyes
  person(ctx, 'mu', 470, FL_INT + 170, 700, {
    expression: 'fear', turn: .1, face: facePreset('fear', { gazeY: -.2 }),
    pose: { lean: -.1, headTilt: -.12, handR: [520, FL_INT - 480], handRPose: { curl: .2, spread: 1, rot: -.5 }, handL: [400, FL_INT - 380] }, wind: 1.0
  });
  // the scarf tears free and flies
  const tf = smoothstep(.45, .9, p.t01);
  if (tf > 0) {
    ctx.save();
    ctx.translate(lerp(520, 980, easeOutCubic(tf)), lerp(FL_INT - 480, FL_INT - 700, tf) + Math.sin(tf * 7) * 40);
    ctx.rotate(tf * 4 + 1);
    paintShape(ctx, smoothPath([[-60, 0], [-20, -22], [20, 18], [62, -6], [40, 26], [-30, 20]], true), { color: '#a86137', ink: '#6f3d24', inkW: 3, seed: 8 });
    ctx.restore();
  }
  ctx.restore();
  drawAsh(ctx, ashMotes(120, 41), p.abs, { alpha: .6, dir: -1 });
  drawEmbers(ctx, emberBits(50, 43), p.abs, {});
  tFade(ctx, p.t01, .22, '#0a0908');
};

/* ===== S11 — 52.42–57.04 · WS · impact ===== */
const S11 = (ctx, p) => {
  const hit = p.t01 < .12;
  layer(ctx, p, { zoom: t => lerp(1.02, 1.1, t), px: t => lerp(0, 30, t), shake: hit ? 26 : (p.t01 < .3 ? 12 * (1 - p.t01 / .3) : 1.5) });
  bgDraw(ctx, getSet('dome_night', () => setDomeExt('night')));
  // the dust-and-glass wall spraying toward camera
  const w = smoothstep(0, .45, p.t01);
  ctx.save();
  for (let i = 0; i < 3; i++) {
    const rr = (w * (1.1 + i * .5)) % 1.4;
    ctx.globalAlpha = .5 * (1 - w) + .1;
    ctx.fillStyle = i ? 'rgba(150,145,130,' : 'rgba(190,182,165,';
    ctx.beginPath();
    ctx.ellipse(W * .62, BH * .60 - SOY + i * 30, 260 * (0.4 + w * 1.3), 210 * (0.4 + w * 1.3), .2, 0, TAU); ctx.fill();
  }
  ctx.restore();
  // glass shards
  ctx.save();
  for (let i = 0; i < 22; i++) {
    const a = hash2(51, i) * TAU, sp = .4 + hash2(52, i);
    const d = w * 900 * sp;
    const gx = W * .62 + Math.cos(a) * d, gy = BH * .60 - SOY + Math.sin(a) * d * .7;
    ctx.save(); ctx.translate(gx, gy); ctx.rotate(a + w * 6);
    ctx.fillStyle = `rgba(200,220,225,${.7 * (1 - w)})`;
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(2, -5); ctx.lineTo(10, 3); ctx.lineTo(-2, 8); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // Mu drops behind a rock (foreground silhouettes)
  ctx.fillStyle = '#1a1714';
  ctx.beginPath(); ctx.moveTo(0, H); ctx.quadraticCurveTo(W * .2, H * .78, W * .42, H * .82); ctx.quadraticCurveTo(W * .58, H * .86, W * .66, H); ctx.closePath(); ctx.fill();
  person(ctx, 'mu', 350, H + 40, 520, {
    expression: 'fear',
    pose: { crouch: 1.2, lean: .12, headTilt: .2, handL: [300, H - 60], handR: [400, H - 40], handLPose: { curl: .8 }, handRPose: { curl: .8 }, footL: [300, H + 40], footR: [400, H + 40], pelvisY: -.58 }
  });
  // the lantern, about to go out
  const lf = 1 - smoothstep(.05, .35, p.t01);
  drawLantern(ctx, 780, FL_INT - 40, 1.0, p.abs, { f: .3 + lf * lampFlicker(p.abs, 3) });
  ctx.restore();
  drawAsh(ctx, ashMotes(150, 55), p.abs, { alpha: .75, dir: -1 });
  tFade(ctx, p.t01, .12, '#0a0908');
};

/* ===== S12 — 57.04–61.46 · MCU · relight; the crawler; the hook ===== */
const S12 = (ctx, p) => {
  const b = breath(p.abs, 23);
  layer(ctx, p, { zoom: t => lerp(1.08, 1.2, easeInOutCubic(t)), px: b.x * 1.5, py: b.y * 1.5, shake: 2 });
  bgDraw(ctx, getSet('dome_night', () => setDomeExt('night')));
  // Mu (from behind, over-shoulder) raising the pruning hook
  const hookUp = smoothstep(.55, .8, p.t01);
  person(ctx, 'mu', 300, FL_INT + 60, 660, {
    expression: 'resolve', turn: -.9, flip: -1,
    pose: { lean: -.05, headTilt: -.05, handR: [410, FL_INT - 300 - hookUp * 260], handRPose: { curl: .9 }, handL: [230, FL_INT - 260] }, wind: .2
  });
  // the hook
  ctx.save(); ctx.translate(410, FL_INT - 300 - hookUp * 260); ctx.rotate(-.5 - hookUp * .3);
  ctx.strokeStyle = '#3a3028'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(10, -160); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(10, -160); ctx.quadraticCurveTo(38, -190, 30, -150); ctx.stroke();
  ctx.restore();
  // the lantern, relit
  drawLantern(ctx, 300, FL_INT - 40, 1.05, p.abs);
  glow(ctx, 300, FL_INT - 60, 260, '#f0c477', .22 * lampFlicker(p.abs, 3));
  // Chen crawls from the wreck and collapses
  const crawl = clamp(p.t01 * 1.4);
  person(ctx, 'chen', lerp(830, 760, crawl), FL_INT + 96, 470, {
    expression: 'pain', turn: .4, face: facePreset('pain', { lid: .55 }),
    pose: {
      crouch: 1.5, lean: .3, headTilt: .3,
      handL: [lerp(830, 700, crawl), FL_INT + 40], handR: [lerp(860, 760, crawl), FL_INT + 30],
      handLPose: { curl: .5 }, handRPose: { curl: .5 },
      footL: [lerp(860, 800, crawl), FL_INT + 96], footR: [lerp(890, 830, crawl), FL_INT + 96],
      pelvisY: -.6 + crawl * .04
    }
  });
  ctx.restore();
  drawAsh(ctx, ashMotes(150, 61), p.abs, { alpha: .7, dir: -1 });
  tFade(ctx, p.t01, .22, '#0a0908');
};

/* ===== S13 — 61.46–64.88 · MS · dragging him through the door ===== */
const S13 = (ctx, p) => {
  const b = breath(p.abs, 31);
  layer(ctx, p, { zoom: t => lerp(1.06, 1.16, easeInOutCubic(t)), px: t => lerp(60, 120, easeInOutCubic(t)) + b.x, py: b.y, shake: 2.5 });
  bgDraw(ctx, getSet('int_night', () => setOrchardInt('night')));
  // doorway light spill
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const dg = ctx.createLinearGradient(663, 0, 880, 0);
  dg.addColorStop(0, 'rgba(240,196,119,.12)'); dg.addColorStop(1, 'rgba(240,196,119,0)');
  ctx.fillStyle = dg; ctx.fillRect(663, WALLY, 220, FL_INT - WALLY); ctx.restore();
  // Chen, slumped, half-dragged
  const drag = p.t01;
  person(ctx, 'chen', lerp(905, 830, drag), FL_INT + 60, 520, {
    expression: 'pain', turn: .3, face: facePreset('pain', { lid: .6 }),
    pose: {
      crouch: 1.3, lean: .34, headTilt: .35,
      handL: [815, FL_INT - 60], handR: [850, FL_INT - 20],
      handLPose: { curl: .3 }, handRPose: { curl: .3 },
      footL: [905, FL_INT + 60], footR: [935, FL_INT + 60], pelvisY: -.6
    }, wind: .1
  });
  // Mu hauling him by the collar
  person(ctx, 'mu', 610, FL_INT + 10, 640, {
    expression: 'resolve', turn: -.7,
    pose: {
      lean: .2, crouch: .4, headTilt: -.08,
      handL: [790, FL_INT - 240], handR: [770, FL_INT - 300],
      handLPose: { curl: .85 }, handRPose: { curl: .85 },
      footL: [560, FL_INT + 10], footR: [650, FL_INT + 10], pelvisY: -.54
    }, wind: .15
  });
  // the cracked mask hissing steam
  const hx = 830, hy = FL_INT + 60 - 0.809 * 520 + 6;
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(.3);
  paintShape(ctx, ellipsePath(0, 0, 30, 40), { color: '#4a545c', ink: '#232a30', inkW: 3, seed: 3 });
  ctx.strokeStyle = '#1c2226'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-12, -28); ctx.lineTo(-4, -6); ctx.lineTo(-14, 16); ctx.lineTo(-6, 34); ctx.stroke();
  ctx.restore();
  if (p.t01 > .3) {
    for (let i = 0; i < 6; i++) {
      const a = p.abs * 3 + i * 1.3;
      ctx.fillStyle = `rgba(210,220,225,${.4 - i * .05})`;
      ctx.beginPath(); ctx.arc(hx + Math.sin(a) * 20 + 26, hy + 20 + i * 26 - (p.abs * 30 % 60), 4 + i, 0, TAU); ctx.fill();
    }
  }
  // dark smear from his hand on the door frame
  const sm = smoothstep(.1, .8, p.t01);
  ctx.save(); ctx.globalAlpha = sm * .8;
  ctx.strokeStyle = 'rgba(20,16,14,.7)'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(872, FL_INT - 120); ctx.quadraticCurveTo(886, FL_INT - 260, 872, FL_INT - 380); ctx.stroke();
  ctx.restore();
  ctx.restore();
  drawAsh(ctx, ashMotes(70, 71), p.abs, { alpha: .4, dir: -1 });
  tFade(ctx, p.t01, .2, '#0a0908');
};

/* ===== S14 — 64.88–68.00 · CU · the mask comes off: recognition ===== */
const S14 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.04, 1.1, t), py: t => lerp(0, -14, t) });
  bgDraw(ctx, getSet('int_night', () => setOrchardInt('night')));
  ctx.restore();
  // Chen's face fills frame
  person(ctx, 'chen', 540, 1549, 1050, {
    expression: 'sleep', turn: .15,
    face: (() => { const f = facePreset('sleep'); f.lid = lerp(1, .22, smoothstep(.45, .8, p.t01)); f.gazeY = lerp(.4, -.05, smoothstep(.45, .8, p.t01)); return f; })(),
    pose: { lean: .06, headTilt: .12 + Math.sin(p.abs * 1.1) * .015, handL: [330, 1180], handR: [760, 1220], handLPose: { curl: .4 }, handRPose: { curl: .4 } }, wind: .05
  });
  // the mask, sliding off
  const mo = smoothstep(.05, .5, p.t01);
  ctx.save();
  ctx.translate(540, 700 + mo * 260); ctx.rotate(.15 + mo * .8); ctx.globalAlpha = 1 - mo * .8;
  paintShape(ctx, ellipsePath(0, 0, 66, 88), { color: '#4a545c', ink: '#232a30', inkW: 4, seed: 3 });
  ctx.strokeStyle = '#1c2226'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-26, -60); ctx.lineTo(-10, -12); ctx.lineTo(-30, 34); ctx.lineTo(-14, 72); ctx.stroke();
  ctx.restore();
  // Mu's hands at the mask edges, then stop
  const stop = smoothstep(.02, .45, p.t01);
  const hx1 = lerp(452, 400, stop), hx2 = lerp(628, 680, stop);
  ctx.save(); ctx.translate(hx1, 706); ctx.rotate(-.3 + stop * .2);
  drawHand(ctx, 0, 0, 64, -1, { curl: .5, spread: .9 }, 41, Math.floor(p.abs * 12)); ctx.restore();
  ctx.save(); ctx.translate(hx2, 726); ctx.rotate(.3 - stop * .2);
  drawHand(ctx, 0, 0, 64, 1, { curl: .5, spread: .9 }, 42, Math.floor(p.abs * 12)); ctx.restore();
  // the paper crane in his collar
  drawPaperCrane(ctx, 606, 852, .55, .25, '#c9b89a', 7);
  // the recognition: her breath catches — micro flare
  tFlash(ctx, smoothstep(.48, .55, p.t01) * (1 - smoothstep(.55, .68, p.t01)) * .1);
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S15 — 68.00–74.00 · overhead · he is laid among the pots ===== */
const S15 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.0, 1.1, easeInOutCubic(t)), rot: t => lerp(-.03, .03, easeInOutCubic(t)), px: t => lerp(-20, 20, t), py: t => lerp(10, -10, t) });
  // the dome floor from above
  ctx.fillStyle = '#241f1a'; ctx.fillRect(-SOX, -SOY, BW, BH);
  ctx.save(); ctx.translate(540, 1020);
  paintShape(ctx, ellipsePath(0, 0, 470, 640), { color: '#4a4036', ink: '#241d1a', inkW: 8, texA: .2, seed: 6 });
  for (let i = 1; i <= 3; i++) { ctx.strokeStyle = `rgba(30,25,20,${.3 - i * .05})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 470 - i * 100, 640 - i * 135, 0, 0, TAU); ctx.stroke(); }
  // the ribs converging overhead
  ctx.strokeStyle = 'rgba(35,30,25,.5)'; ctx.lineWidth = 14;
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 560, Math.sin(a) * 760); ctx.stroke(); }
  ctx.restore();
  // pots around the edge (from above: circles)
  ctx.save(); ctx.translate(540, 1020);
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU + .4;
    const px2 = Math.cos(a) * 400, py2 = Math.sin(a) * 560;
    paintShape(ctx, ellipsePath(px2, py2, 52, 40), { color: '#6b563f', ink: '#2e2418', inkW: 4, seed: 20 + i });
    paintShape(ctx, ellipsePath(px2, py2 - 4, 40, 28), { color: '#3a2e22', ink: null, seed: 40 + i });
    // a few dead, a few with a leaf
    if (i % 3 === 0) { ctx.save(); ctx.translate(px2, py2); ctx.rotate(a); paintShape(ctx, ellipsePath(0, -34, 22, 10, .4), { color: '#7fa05a', ink: '#41502f', inkW: 2, seed: 60 + i }); ctx.restore(); }
  }
  ctx.restore();
  // Chen, laid among the pots (from above)
  ctx.save(); ctx.translate(640, 1120); ctx.rotate(-.12);
  paintShape(ctx, capsulePath(-150, 0, 150, 0, 62, 74, 10), { color: '#474b4d', ink: '#2d3133', inkW: 5, seed: 5 });
  paintShape(ctx, ellipsePath(-190, -6, 60, 66), { color: '#b07c59', ink: '#85563e', inkW: 4, seed: 6 });
  paintShape(ctx, ellipsePath(-190, -40, 62, 50), { color: '#191514', ink: null, seed: 7 }); // hair
  ctx.strokeStyle = '#8b5444'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-160, -34); ctx.lineTo(-150, -10); ctx.stroke(); // scar
  paintShape(ctx, capsulePath(60, -50, 180, -30, 20, 16, 8), { color: '#474b4d', ink: null, seed: 8 });
  paintShape(ctx, capsulePath(60, 50, 180, 34, 20, 16, 8), { color: '#474b4d', ink: null, seed: 9 });
  ctx.restore();
  // Mu kneeling over him (from above), tears falling
  ctx.save(); ctx.translate(370, 1040); ctx.rotate(.15);
  paintShape(ctx, ellipsePath(0, 0, 96, 116), { color: '#66634f', ink: '#454436', inkW: 5, seed: 10 });
  paintShape(ctx, ellipsePath(-30, -110, 58, 64), { color: '#c79470', ink: '#a06a4e', inkW: 4, seed: 11 });
  paintShape(ctx, ellipsePath(-30, -150, 60, 54), { color: '#221a18', ink: null, seed: 12 });
  paintShape(ctx, capsulePath(70, -30, 190, 0, 24, 20, 8), { color: '#66634f', ink: null, seed: 13 });
  ctx.restore();
  const tear = (p.abs * .8) % 1;
  if (tear < .8) {
    const ty = lerp(950, 1116, tear / .8);
    ctx.fillStyle = 'rgba(220,240,238,.8)';
    ctx.beginPath(); ctx.ellipse(400, ty, 6, 9, 0, 0, TAU); ctx.fill();
  }
  // the seedling at center: its leaves turn toward him
  ctx.save(); ctx.translate(540, 880);
  paintShape(ctx, ellipsePath(0, 0, 74, 60), { color: '#6b563f', ink: '#2e2418', inkW: 5, seed: 14 });
  const ang = Math.atan2(1120 - 880, 640 - 540);
  for (let i = 0; i < 4; i++) {
    const a = ang + (i - 1.5) * .5 + Math.sin(p.abs * 1.4 + i) * .05;
    ctx.save(); ctx.rotate(a); paintShape(ctx, ellipsePath(70, 0, 62, 22, .3), { color: i % 2 ? '#7fa05a' : '#8fa06f', ink: '#41502f', inkW: 3, seed: 70 + i }); ctx.restore();
  }
  ctx.restore();
  glow(ctx, 540, 880, 200, '#a9d98a', .3);
  ctx.restore();
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S16 — 74.00–80.00 · inserts · quiet labor, the countdown ===== */
const S16 = (ctx, p) => {
  const cut = Math.floor(p.t01 * 3); // 3 inserts, 8-frame cuts
  const lt = (p.t01 * 3) % 1;
  layer(ctx, p, { zoom: t => lerp(1.03, 1.09, lt) });
  if (cut === 0) {
    // insert 1: cleaning the wound — CU on his shoulder
    ctx.fillStyle = '#2a2620'; ctx.fillRect(-SOX, -SOY, BW, BH);
    paintShape(ctx, capsulePath(200, 1400, 620, 1150, 150, 130, 10), { color: '#474b4d', ink: '#2d3133', inkW: 5, seed: 3 });
    ctx.strokeStyle = '#7d2a22'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(430, 1210); ctx.quadraticCurveTo(480, 1260, 440, 1310); ctx.stroke();
    ctx.save(); ctx.translate(660, 1120); ctx.rotate(-.5);
    drawHand(ctx, 0, 0, 120, 1, { curl: .55, spread: 1 }, 51, Math.floor(p.abs * 12)); ctx.restore();
    // cloth
    ctx.save(); ctx.translate(500, 1250); ctx.rotate(Math.sin(p.abs * 3) * .2 - .4);
    paintShape(ctx, blobPath(0, 0, 70, 60, 2, .16, 12), { color: '#d6c9af', ink: '#8a7a5c', inkW: 3, seed: 4 }); ctx.restore();
  } else if (cut === 1) {
    // insert 2: two paper cranes, one faded
    ctx.fillStyle = '#332c24'; ctx.fillRect(-SOX, -SOY, BW, BH);
    for (let i = 0; i < 24; i++) {
      ctx.fillStyle = `rgba(20,16,12,${.05 + hash2(61, i) * .1})`;
      ctx.fillRect(-SOX + hash2(62, i) * BW, -SOY + hash2(63, i) * BH, 3 + hash2(64, i) * 6, 2);
    }
    drawPaperCrane(ctx, 420, 900, 1.5, -.12, '#e8dcc6', 11);
    ctx.save(); ctx.globalAlpha = .38;
    drawPaperCrane(ctx, 660, 1010, 1.35, .18, '#cbbfa6', 12); ctx.restore();
    glow(ctx, 540, 950, 180, '#e8b86a', .1);
  } else {
    // insert 3: the wrist device blinks red
    ctx.fillStyle = '#221d18'; ctx.fillRect(-SOX, -SOY, BW, BH);
    paintShape(ctx, capsulePath(300, 1500, 700, 1050, 120, 100, 10), { color: '#474b4d', ink: null, seed: 5 });
    const blink = Math.sin(p.abs * 5.5) > 0 ? 1 : .12;
    drawWristDevice(ctx, 560, 1130, 2.2, p.abs, { red: blink });
    ctx.save(); ctx.globalAlpha = .5 + blink * .5;
    ctx.strokeStyle = '#d34a2e'; ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(560, 1130, 60 + i * 26 + (p.abs * 60 % 40), 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore();
};

/* ===== S17 — 80.00–86.04 · WS · the dome breathes; they sleep ===== */
const S17 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.14, 1.0, easeInOutCubic(t)), py: t => lerp(-40, 30, easeInOutCubic(t)) });
  bgDraw(ctx, getSet('int_night', () => setOrchardInt('night')));
  // dawn light entering the window wall
  const dl = smoothstep(.05, .9, p.t01);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const dg = ctx.createLinearGradient(0, BH * .1 - SOY, 0, BH * .68 - SOY);
  dg.addColorStop(0, `rgba(255,190,120,${.30 * dl})`); dg.addColorStop(1, `rgba(255,160,100,${.05 * dl})`);
  ctx.fillStyle = dg; ctx.fillRect(0, BH * .1 - SOY, W, BH * .58 - SOY); ctx.restore();
  // Mu sleeps sitting up beside Chen
  person(ctx, 'mu', 430, FL_INT + 30, 560, {
    expression: 'sleep', wind: 0,
    pose: { crouch: .5, lean: .1, headTilt: .3 + Math.sin(p.abs * .8) * .01, handL: [470, FL_INT - 160], handR: [390, FL_INT - 170], handLPose: { curl: .6 }, handRPose: { curl: .6 }, footL: [380, FL_INT + 30], footR: [480, FL_INT + 30], pelvisY: -.53 }
  });
  // Chen, still
  person(ctx, 'chen', 760, FL_INT + 20, 560, {
    expression: 'sleep',
    pose: { crouch: .15, lean: .05, headTilt: .18, handL: [720, FL_INT - 200], handR: [800, FL_INT - 190], footL: [710, FL_INT + 20], footR: [770, FL_INT + 20], pelvisY: -.5 }
  });
  // the seedling glows faintly between them
  const sg = .5 + .5 * Math.sin(p.abs * 1.5);
  glow(ctx, SEED_X, SEED_Y - 120, 240, '#a9d98a', .10 + sg * .07);
  ctx.save(); ctx.translate(SEED_X, SEED_Y);
  paintShape(ctx, polyPath([[-64, 0], [58, 0], [46, -78], [-52, -78]]), { color: '#6b563f', ink: '#2e2418', inkW: 4, seed: 2 });
  drawSeedling(ctx, 4, -80, 1.05, .3, p.abs, { wind: .02 });
  ctx.restore();
  ctx.restore();
  drawAsh(ctx, ashMotes(60, 81), p.abs, { alpha: .3, dir: -1 });
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S18 — 86.04–92.54 · MCU · he wakes; the temptation ===== */
const S18 = (ctx, p) => {
  const b = breath(p.abs, 81);
  layer(ctx, p, { zoom: t => lerp(1.05, 1.16, easeInOutCubic(t)), px: t => lerp(40, 90, t) + b.x, py: b.y, shake: 1.5 });
  bgDraw(ctx, getSet('int_day', () => setOrchardInt('day')));
  // Chen, sitting up, watching her sleep
  const wake = smoothstep(.05, .3, p.t01);
  person(ctx, 'chen', 620, FL_INT + 40, 640, {
    expression: 'neutral', turn: -.6,
    face: facePreset('neutral', { lid: lerp(.9, .2, wake), gazeX: -.5, gazeY: .05 }),
    pose: {
      crouch: .2, lean: -.08, headTilt: .06 + Math.sin(p.abs * 1.1) * .012,
      handL: [640, FL_INT - 260], handR: [lerp(700, 730, wake), lerp(FL_INT - 300, FL_INT - 420, smoothstep(.4, .8, p.t01))],
      handLPose: { curl: .4 }, handRPose: { curl: .3 },
      footL: [580, FL_INT + 40], footR: [680, FL_INT + 40], pelvisY: -.52
    }
  });
  // the seed pod on the floor between them
  drawPod(ctx, 800, FL_INT - 10, .8, .2, p.abs, { win: .3 + .2 * Math.sin(p.abs * 2) });
  glow(ctx, 800, FL_INT - 20, 120, '#b9d98a', .18 + .08 * Math.sin(p.abs * 1.7));
  // Mu asleep behind (soft)
  ctx.save(); ctx.globalAlpha = .96;
  person(ctx, 'mu', 330, FL_INT + 30, 540, {
    expression: 'sleep',
    pose: { crouch: .55, lean: .12, headTilt: .3, handL: [370, FL_INT - 160], handR: [290, FL_INT - 170], footL: [280, FL_INT + 30], footR: [380, FL_INT + 30], pelvisY: -.54 }
  });
  ctx.restore();
  // his wrist: the red signal pulses
  drawWristDevice(ctx, 700, FL_INT - 260, 1.0, p.abs);
  ctx.restore();
  dofDim(ctx, 730, FL_INT - 380, 420, 380, .34);
  drawAsh(ctx, ashMotes(50, 91), p.abs, { alpha: .25 });
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S19 — 92.54–99.96 · two-shot · the argument ===== */
const S19 = (ctx, p) => {
  const b = breath(p.abs, 91);
  // handheld two-shot, slow orbit to profile
  layer(ctx, p, { zoom: t => lerp(1.04, 1.12, easeInOutCubic(t)), px: t => lerp(90, 130, t) + b.x * 1.6, py: b.y * 1.6, shake: 2.2 });
  bgDraw(ctx, getSet('int_day', () => setOrchardInt('day')));
  // Chen points to the sky (his people)
  const point = smoothstep(.25, .5, p.t01);
  person(ctx, 'chen', 730, FL_INT + 20, 620, {
    expression: 'anger', turn: -.7,
    pose: {
      lean: -.1, headTilt: -.14,
      handR: [lerp(760, 850, point), lerp(FL_INT - 380, FL_INT - 560, point)],
      handRPose: { curl: .15, spread: .8, rot: -.5 },
      handL: [660, FL_INT - 260], footL: [690, FL_INT + 20], footR: [780, FL_INT + 20], pelvisY: -.5
    }
  });
  // Mu catches his wrist, points to the last green
  const catchT = smoothstep(.05, .3, p.t01);
  person(ctx, 'mu', 400, FL_INT + 10, 620, {
    expression: 'resolve', turn: .7,
    pose: {
      lean: .1, headTilt: .1,
      handR: [lerp(470, 745, catchT), lerp(FL_INT - 300, FL_INT - 400, catchT)],
      handRPose: { curl: .85 },
      handL: [lerp(330, 300, point), lerp(FL_INT - 340, FL_INT - 520, point)],
      handLPose: { curl: .2, spread: .8, rot: .4 },
      footL: [350, FL_INT + 10], footR: [460, FL_INT + 10], pelvisY: -.5
    }
  });
  // neither backs down: a held beat — micro push
  ctx.restore();
  drawAsh(ctx, ashMotes(40, 95), p.abs, { alpha: .22 });
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S20 — 99.96–106.88 · macro two-shot · dead gardens, the ashes ===== */
const S20 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.06, 1.14, easeInOutCubic(t)), px: t => lerp(60, 90, t) });
  bgDraw(ctx, getSet('int_day', () => setOrchardInt('day')));
  // rack focus: his tray of dead-garden dust (left)
  const rack = smoothstep(.45, .62, p.t01);
  ctx.save(); ctx.translate(360, 980); ctx.rotate(-.06);
  paintShape(ctx, roundRectPath(-190, -90, 380, 180, 10), { color: '#3a444c', ink: '#232a30', inkW: 4, seed: 2 });
  paintShape(ctx, roundRectPath(-170, -74, 340, 148, 6), { color: '#6a6357', ink: null, seed: 3 });
  // rows of dust where gardens died
  for (let r = 0; r < 6; r++) {
    ctx.fillStyle = `rgba(40,36,30,${.35 + r * .06})`;
    ctx.fillRect(-160, -60 + r * 24, 320, 5);
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = 'rgba(52,46,38,.8)';
      ctx.beginPath(); ctx.arc(-140 + i * 48 + (hash2(r, i) - .5) * 10, -60 + r * 24, 5 + hash2(r + 3, i) * 5, 0, TAU); ctx.fill();
    }
  }
  ctx.restore();
  // his hand presenting it
  ctx.save(); ctx.translate(520, 900); ctx.rotate(.4);
  drawHand(ctx, 0, 0, 74, 1, { curl: .3, spread: .7 }, 61, Math.floor(p.abs * 12)); ctx.restore();
  // her hands: the vial of her mother's ashes, a little falls into the seed bed
  ctx.save(); ctx.translate(830, 900); ctx.rotate(.5);
  drawVial(ctx, 0, 0, 1.0, .3);
  ctx.restore();
  ctx.save(); ctx.translate(830, 900); ctx.rotate(.5);
  drawHand(ctx, -10, 20, 60, -1, { curl: .55 }, 62, Math.floor(p.abs * 12)); ctx.restore();
  if (p.t01 > .5) {
    const fall = (p.abs * .55) % 1;
    for (let i = 0; i < 8; i++) {
      const fx = 852 + Math.sin(i * 2.1) * 12, fy = lerp(940, 1290, fall + i * .02);
      ctx.fillStyle = `rgba(216,204,186,${.8 - fall * .5})`;
      ctx.fillRect(fx, fy, 3, 3);
    }
  }
  // the seed bed catching the ashes
  ctx.save(); ctx.translate(852, 1300);
  paintShape(ctx, ellipsePath(0, 0, 60, 16), { color: '#3a2e22', ink: null, seed: 4 });
  ctx.restore();
  ctx.restore();
  dofDim(ctx, rack > .5 ? 852 : 360, 980, 480, 420, .38);
  drawAsh(ctx, ashMotes(30, 97), p.abs, { alpha: .2 });
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S21 — 106.88–112.50 · WS · quiet before the storm ===== */
const S21 = (ctx, p) => {
  layer(ctx, p, { zoom: 1.08, px: 40, py: 10 });
  bgDraw(ctx, getSet('int_dusk', () => setOrchardInt('dusk')));
  // ash falls through a crack in the dome
  ctx.save();
  const cr = ctx.createLinearGradient(700, 0, 760, 900);
  cr.addColorStop(0, 'rgba(216,204,186,.14)'); cr.addColorStop(1, 'rgba(216,204,186,0)');
  ctx.fillStyle = cr; ctx.fillRect(690, BH * .1 - SOY, 80, 900);
  ctx.restore();
  // they sit apart
  person(ctx, 'chen', 330, FL_INT + 60, 540, {
    expression: 'sad', turn: .5,
    pose: { crouch: .8, lean: .06, headTilt: .16, handL: [300, FL_INT - 120], handR: [370, FL_INT - 110], handLPose: { curl: .6 }, handRPose: { curl: .6 }, footL: [290, FL_INT + 60], footR: [380, FL_INT + 60], pelvisY: -.56 }
  });
  // the seed glows faintly between them
  const sg = .5 + .5 * Math.sin(p.abs * 1.2);
  glow(ctx, 560, FL_INT - 60, 200, '#b9d98a', .1 + sg * .05);
  ctx.save(); ctx.translate(560, FL_INT + 10);
  paintShape(ctx, ellipsePath(0, -20, 46, 20), { color: '#3a2e22', ink: '#2e2418', inkW: 3, seed: 4 });
  drawSeedling(ctx, 0, -30, .8, .34, p.abs, { wind: .03 });
  ctx.restore();
  // Mu sits turned away; the blanket crosses to him
  const blanket = smoothstep(.45, .8, p.t01);
  person(ctx, 'mu', 790, FL_INT + 60, 540, {
    expression: 'sad', turn: -.6, face: facePreset('sad', { lid: .3 }),
    pose: { crouch: .8, lean: -.08, headTilt: -.12, handL: [760, FL_INT - 130], handR: [830, FL_INT - 120], handLPose: { curl: .5 }, handRPose: { curl: .5 }, footL: [750, FL_INT + 60], footR: [840, FL_INT + 60], pelvisY: -.56 }
  });
  if (blanket > 0) {
    ctx.save(); ctx.globalAlpha = blanket * .95;
    paintShape(ctx, smoothPath([[800, FL_INT - 160], [560, FL_INT - 190 - Math.sin(p.abs * 2) * 6], [380, FL_INT - 150], [400, FL_INT - 60], [600, FL_INT - 60], [790, FL_INT - 70]], true), { color: '#8d8579', ink: '#57514a', inkW: 3, seed: 5 });
    ctx.restore();
  }
  ctx.restore();
  drawAsh(ctx, ashMotes(70, 99), p.abs, { alpha: .35, dir: -1 });
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S22 — 112.50–119.21 · WS · the storm; sealing the pane ===== */
const S22 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.06, 1.14, easeInOutCubic(t)), px: t => lerp(20, 70, t), shake: 5 + Math.sin(p.abs * 7) * 3 });
  bgDraw(ctx, getSet('int_storm', () => setOrchardInt('storm')));
  // a pane cracks, rain and ash pour through
  ctx.save();
  ctx.strokeStyle = 'rgba(225,235,238,.8)'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(760, 300); ctx.lineTo(790, 420); ctx.lineTo(750, 520); ctx.lineTo(800, 640); ctx.lineTo(770, 760);
  ctx.moveTo(790, 420); ctx.lineTo(870, 470); ctx.moveTo(750, 520); ctx.lineTo(680, 580);
  ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(700, 280, 200, 500); ctx.clip();
  drawRain(ctx, rainDrops(90, 5), p.abs, { alpha: .5, slant: .35 });
  ctx.restore();
  // they climb the dome: she holds the pane, he seals it
  const climb = Math.sin(p.abs * 2.4) * 10;
  person(ctx, 'mu', 460, FL_INT - 200 + climb, 560, {
    expression: 'resolve', turn: .6,
    pose: { lean: .12, headTilt: -.1, handR: [560, FL_INT - 560], handRPose: { curl: .7, spread: 1 }, handL: [430, FL_INT - 380], footL: [430, FL_INT - 200 + climb], footR: [500, FL_INT - 200 + climb], pelvisY: -.52 }
  });
  person(ctx, 'chen', 830, FL_INT - 320 - climb, 560, {
    expression: 'resolve', turn: -.6,
    pose: { lean: -.12, headTilt: .1, handL: [790, FL_INT - 660], handLPose: { curl: .6 }, handR: [860, FL_INT - 520], footL: [790, FL_INT - 320 - climb], footR: [870, FL_INT - 320 - climb], pelvisY: -.52 }
  });
  // resin seal stroke
  if (p.t01 > .5) {
    ctx.save(); ctx.strokeStyle = 'rgba(200,190,150,.85)'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(700, 300); ctx.quadraticCurveTo(760, 420, 730, 540); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  drawWindLines(ctx, p.abs, 3, 30, .3, '180,190,195');
  drawAsh(ctx, ashMotes(120, 21), p.abs, { alpha: .55, dir: -1 });
  tFade(ctx, p.t01, .2, '#0a0908');
};

/* ===== S23 — 119.21–125.75 · MS · the beam snaps; the fall ===== */
const S23 = (ctx, p) => {
  // whip pan into the shot
  const whip = (1 - smoothstep(0, .12, p.t01)) + smoothstep(.86, 1, p.t01);
  layer(ctx, p, { zoom: t => lerp(1.0, 1.24, easeInCubic(clamp(t * 1.1))), px: t => lerp(-80, 60, t), py: t => lerp(60, -30, t), shake: 4 + whip * 16, rot: t => lerp(.02, -.02, t) });
  bgDraw(ctx, getSet('int_storm', () => setOrchardInt('storm')));
  // the support beam snaps
  const snap = smoothstep(.08, .2, p.t01);
  ctx.save();
  ctx.strokeStyle = '#241d1a'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(180, BH * .1 - SOY); ctx.lineTo(340, BH * .3 - SOY);
  if (snap > 0) { ctx.moveTo(300, BH * .24 - SOY); ctx.lineTo(420, BH * .2 - SOY); }
  ctx.stroke();
  ctx.restore();
  if (snap > 0 && snap < 1) {
    for (let i = 0; i < 14; i++) {
      const a = hash2(11, i) * TAU;
      ctx.save(); ctx.translate(360 + Math.cos(a) * snap * 160, BH * .26 - SOY + Math.sin(a) * snap * 120); ctx.rotate(a);
      ctx.fillStyle = 'rgba(60,50,40,.9)'; ctx.fillRect(-14, -4, 28, 8); ctx.restore();
    }
  }
  // they fall toward lower-left
  const fall = smoothstep(.15, .8, p.t01);
  const fy = fall * 240, fx = -fall * 160;
  person(ctx, 'mu', 400 + fx, FL_INT + 30 + fy, 580, {
    expression: 'fear', turn: .4,
    pose: { lean: .4, crouch: .6, headTilt: .4, handL: [380 + fx, FL_INT - 200 + fy], handR: [470 + fx, FL_INT - 160 + fy], handLPose: { curl: .8 }, handRPose: { curl: .8 }, footL: [350 + fx, FL_INT + 60 + fy], footR: [460 + fx, FL_INT + 30 + fy], pelvisY: -.58 }
  });
  person(ctx, 'chen', 660 + fx, FL_INT + 20 + fy, 580, {
    expression: 'fear', turn: .3,
    pose: { lean: .34, crouch: .7, headTilt: .3, handL: [700 + fx, FL_INT - 120 + fy], handR: [620 + fx, FL_INT - 150 + fy], footL: [620 + fx, FL_INT + 50 + fy], footR: [710 + fx, FL_INT + 20 + fy], pelvisY: -.58 }
  });
  // the seed pod rolls toward the broken edge
  const roll = smoothstep(.3, .95, p.t01);
  const podX = lerp(SEED_X - 40, 1010, easeInCubic(roll)), podY = lerp(FL_INT - 10, FL_INT + 90, roll);
  drawPod(ctx, podX, podY, .8, roll * 9, p.abs, { win: .3 });
  ctx.restore();
  // ECU on her hand grabbing his wrist (final beat)
  const ecu = smoothstep(.82, 1, p.t01);
  if (ecu > 0) {
    ctx.save(); ctx.globalAlpha = ecu;
    ctx.fillStyle = 'rgba(10,9,8,' + ecu * .55 + ')'; ctx.fillRect(0, 0, W, H);
    ctx.translate(540, 1000);
    drawHand(ctx, -70, -20, 130, -1, { curl: .9, rot: .3 }, 71, Math.floor(p.abs * 12));
    ctx.save(); ctx.rotate(.6); drawHand(ctx, 80, 30, 130, 1, { curl: .9, rot: -.3 }, 72, Math.floor(p.abs * 12)); ctx.restore();
    ctx.restore();
  }
  tFade(ctx, p.t01, .15, '#0a0908');
};

/* ===== S24 — 125.75–130.12 · ECU · the pod opens at their touch ===== */
const S24 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.16, 1.3, easeInOutCubic(t)), rot: t => lerp(-.03, .03, easeInOutCubic(t)), px: t => lerp(20, -10, t) });
  ctx.fillStyle = '#221d18'; ctx.fillRect(-SOX, -SOY, BW, BH);
  // ground shadow
  ctx.fillStyle = 'rgba(10,9,8,.5)'; ctx.beginPath(); ctx.ellipse(540, 1220, 380, 90, 0, 0, TAU); ctx.fill();
  // the pod, open
  const open = smoothstep(.3, .8, p.t01);
  ctx.save(); ctx.translate(540, 1080);
  paintShape(ctx, blobPath(0, 0, 60 + open * 40, 40 + open * 16, 3, .14, 14), { color: '#8d8579', ink: '#241d1a', inkW: 4, seed: 8 });
  paintShape(ctx, ellipsePath(0, -14, 34 + open * 26, 16 + open * 8), { color: '#3a332a', ink: null, seed: 9 });
  // the seed, drinking
  glow(ctx, 0, -8, 130 * (0.4 + open * .6), '#f0e6b8', .85);
  ctx.fillStyle = `rgba(240,235,200,${.9})`;
  ctx.beginPath(); ctx.ellipse(0, -10, 10 + open * 6, 14 + open * 8, 0, 0, TAU); ctx.fill();
  ctx.restore();
  // both hands close on the pod; fingers touch
  person(ctx, 'mu', 300, 1300, 700, {
    expression: 'wonder', turn: .9,
    pose: { lean: -.3, crouch: .4, headTilt: .2, handR: [470, 1090], handRPose: { curl: .5 }, handL: [260, 1180], footL: [250, 1300], footR: [350, 1300], pelvisY: -.55 }
  });
  person(ctx, 'chen', 790, 1320, 700, {
    expression: 'wonder', turn: -.9,
    pose: { lean: .3, crouch: .4, headTilt: .2, handL: [610, 1090], handLPose: { curl: .5 }, handR: [830, 1200], footL: [740, 1320], footR: [840, 1320], pelvisY: -.55 }
  });
  // the white root curls around both wrists
  const root = smoothstep(.45, .95, p.t01);
  if (root > 0) {
    ctx.save();
    ctx.strokeStyle = `rgba(235,240,225,${.9})`; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(540, 1050);
    ctx.bezierCurveTo(470, 1010, 460, 1120, 480 + root * 10, 1140);
    ctx.moveTo(540, 1050);
    ctx.bezierCurveTo(610, 1010, 620, 1120, 600 - root * 10, 1140);
    ctx.stroke();
    ctx.globalAlpha = .5; ctx.lineWidth = 12; ctx.filter = 'blur(3px)'; ctx.stroke(); ctx.filter = 'none';
    ctx.restore();
    glow(ctx, 540, 1080, 260, '#f0e6b8', .3 * root);
  }
  ctx.restore();
  drawSpores(ctx, sporeBits(30, 6), p.abs);
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S25 — 130.12–134.71 · two-shot CU · lit from below, laughing through tears ===== */
const S25 = (ctx, p) => {
  const b = breath(p.abs, 41);
  layer(ctx, p, { zoom: t => lerp(1.02, 1.12, easeInOutCubic(t)), px: b.x, py: b.y, shake: 1.5 });
  ctx.fillStyle = '#1c1815'; ctx.fillRect(-SOX, -SOY, BW, BH);
  // the sprout's light from below
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const ug = ctx.createLinearGradient(0, H, 0, H * .55);
  ug.addColorStop(0, 'rgba(185,217,138,.4)'); ug.addColorStop(1, 'rgba(185,217,138,0)');
  ctx.fillStyle = ug; ctx.fillRect(0, H * .5, W, H * .5); ctx.restore();
  // two faces close
  person(ctx, 'mu', 400, 1160, 860, {
    expression: 'laugh', turn: .55, face: facePreset('laugh', { tear: .4 }),
    pose: { lean: -.06, headTilt: .08 + Math.sin(p.abs * 2.2) * .02, handR: [520, 1080], handRPose: { curl: .5 }, handL: [330, 1120], footL: [350, 1160], footR: [450, 1160], pelvisY: -.5 }
  });
  person(ctx, 'chen', 760, 1180, 860, {
    expression: 'laugh', turn: -.55, face: facePreset('laugh', { tear: .3 }),
    pose: { lean: .06, headTilt: -.08 + Math.sin(p.abs * 2 + 1) * .02, handL: [640, 1080], handLPose: { curl: .5 }, handR: [830, 1140], footL: [710, 1180], footR: [810, 1180], pelvisY: -.5 }
  });
  // the storm quiets: last rain streaks, slowing
  ctx.save(); ctx.globalAlpha = .3 * (1 - p.t01);
  drawRain(ctx, rainDrops(50, 9), p.abs * .4, { alpha: .3 });
  ctx.restore();
  ctx.restore();
  drawSpores(ctx, sporeBits(24, 8), p.abs);
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S26 — 134.71–138.25 · WS · the sprout becomes a young tree ===== */
const S26 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.12, 1.02, easeInOutCubic(t)), py: t => lerp(60, -40, easeInOutCubic(t)), px: t => lerp(60, 20, t) });
  bgDraw(ctx, getSet('int_day', () => setOrchardInt('day')));
  // golden sap falls like rain
  if (p.t01 > .2) {
    for (let i = 0; i < 26; i++) {
      const ph = (p.abs * .5 + hash2(21, i)) % 1;
      const sx = SEED_X - 60 + hash2(22, i) * 140, sy = FL_INT - 300 + ph * 380;
      ctx.fillStyle = `rgba(240,196,119,${.8 * (1 - ph)})`;
      ctx.beginPath(); ctx.arc(sx, sy, 2.4 + hash2(23, i) * 2.4, 0, TAU); ctx.fill();
      if (hash2(24, i) > .6) glow(ctx, sx, sy, 16, '#f0c477', .3 * (1 - ph));
    }
  }
  // the young tree where the seedling was
  ctx.save(); ctx.translate(SEED_X + 40, SEED_Y);
  paintShape(ctx, ellipsePath(0, -20, 80, 22), { color: '#3a2e22', ink: '#2e2418', inkW: 4, seed: 4 });
  drawTree(ctx, 0, -30, .5, p.abs, { h: 620, blossom: .3 });
  ctx.restore();
  glow(ctx, SEED_X + 40, FL_INT - 260, 320, '#e8b86a', .16);
  // they work around it, stealing looks
  person(ctx, 'mu', 480, FL_INT + 16, 580, {
    expression: 'soft', turn: .8,
    pose: { lean: -.05, headTilt: .1, handR: [560, FL_INT - 300], handRPose: { curl: .4 }, handL: [440, FL_INT - 260], footL: [440, FL_INT + 16], footR: [530, FL_INT + 16], pelvisY: -.51 }
  });
  person(ctx, 'chen', 900, FL_INT + 16, 580, {
    expression: 'soft', turn: -.8,
    pose: { lean: .05, headTilt: -.1, handL: [830, FL_INT - 300], handLPose: { curl: .4 }, handR: [960, FL_INT - 260], footL: [850, FL_INT + 16], footR: [950, FL_INT + 16], pelvisY: -.51 }
  });
  ctx.restore();
  drawSpores(ctx, sporeBits(20, 12), p.abs);
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S27 — 138.25–141.33 · MCU · palms on the trunk ===== */
const S27 = (ctx, p) => {
  const b = breath(p.abs, 51);
  layer(ctx, p, { zoom: t => lerp(1.1, 1.18, easeInOutCubic(t)), px: t => lerp(40, 80, t) + b.x * 1.4, py: b.y * 1.4, shake: 1.6 });
  bgDraw(ctx, getSet('int_day', () => setOrchardInt('day')));
  // the young tree
  ctx.save(); ctx.translate(700, FL_INT + 10);
  paintShape(ctx, ellipsePath(0, -16, 90, 24), { color: '#3a2e22', ink: '#2e2418', inkW: 4, seed: 4 });
  drawTree(ctx, 0, -26, .58, p.abs, { h: 680, blossom: .3 });
  ctx.restore();
  // light runs up the branches
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 5; i++) {
    const ph = (p.abs * .6 + i * .2) % 1;
    ctx.strokeStyle = `rgba(240,220,150,${.5 * (1 - ph)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(700, FL_INT - 60);
    ctx.quadraticCurveTo(700 - 40 + i * 20, FL_INT - 200 - ph * 200, 660 - i * 26, FL_INT - 320 - ph * 240); ctx.stroke();
  }
  ctx.restore();
  glow(ctx, 700, FL_INT - 300, 300, '#e8b86a', .14);
  // both press their palms to the trunk
  person(ctx, 'mu', 470, FL_INT + 10, 580, {
    expression: 'soft', turn: .9,
    pose: { lean: -.04, headTilt: .06, handR: [640, FL_INT - 280], handRPose: { curl: .1, spread: 1.1 }, handL: [420, FL_INT - 240], footL: [430, FL_INT + 10], footR: [520, FL_INT + 10], pelvisY: -.51 }
  });
  person(ctx, 'chen', 930, FL_INT + 10, 580, {
    expression: 'soft', turn: -.9,
    pose: { lean: .04, headTilt: -.06, handL: [760, FL_INT - 280], handLPose: { curl: .1, spread: 1.1 }, handR: [980, FL_INT - 240], footL: [880, FL_INT + 10], footR: [970, FL_INT + 10], pelvisY: -.51 }
  });
  ctx.restore();
  dofDim(ctx, 700, FL_INT - 300, 560, 520, .3);
  drawSpores(ctx, sporeBits(16, 14), p.abs);
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S28 — 141.33–146.08 · CU · the signal turns red ===== */
const S28 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.05, 1.14, easeInOutCubic(t)), px: t => lerp(40, 70, t) });
  bgDraw(ctx, getSet('int_night', () => setOrchardInt('night')));
  ctx.restore();
  // Chen's face falls
  const fall = smoothstep(.35, .75, p.t01);
  person(ctx, 'chen', 470, 1500, 1020, {
    expression: 'sad', turn: .2,
    face: facePreset(fall > .5 ? 'sad' : 'neutral', { mouth: lerp(.02, -.16, fall), brow: lerp(0, .2, fall), lid: lerp(.15, .3, fall) }),
    pose: { lean: .04, headTilt: .05 + fall * .08, handR: [640, 1230], handRPose: { curl: .4 }, handL: [300, 1260] }
  });
  // the wrist device, red
  drawWristDevice(ctx, 660, 1250, 1.15, p.abs);
  // Mu enters frame right — she understands before he speaks
  const muIn = smoothstep(.5, .8, p.t01);
  if (muIn > 0) {
    ctx.save(); ctx.globalAlpha = muIn;
    person(ctx, 'mu', 900, FL_INT + 20, 620, {
      expression: 'neutral', turn: -.9, face: facePreset('neutral', { brow: -.1, lid: .26, mouth: -.04 }),
      pose: { lean: -.04, headTilt: -.05, handR: [860, FL_INT - 260], handRPose: { curl: .4 }, handL: [940, FL_INT - 220], footL: [860, FL_INT + 20], footR: [950, FL_INT + 20], pelvisY: -.51 }
    });
    ctx.restore();
  }
  // rack focus to Mu
  dofDim(ctx, lerp(470, 900, smoothstep(.55, .9, p.t01)), 900, 620, 560, .4 * Math.max(fall, muIn));
  tFlash(ctx, smoothstep(.3, .36, p.t01) * (1 - smoothstep(.36, .5, p.t01)) * .12, '#d34a2e');
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S29 — 146.08–152.54 · WS · night; she does not stop him ===== */
const S29 = (ctx, p) => {
  layer(ctx, p, { zoom: 1.06, px: 30, py: 6 });
  bgDraw(ctx, getSet('int_night', () => setOrchardInt('night')));
  // the open door: cold light and wind
  ctx.save();
  const dg = ctx.createLinearGradient(663, 0, 900, 0);
  dg.addColorStop(0, 'rgba(150,175,195,.16)'); dg.addColorStop(1, 'rgba(150,175,195,0)');
  ctx.fillStyle = dg; ctx.fillRect(663, WALLY, 240, FL_INT - WALLY);
  // wind moves the curtain
  ctx.globalAlpha = .5;
  paintShape(ctx, smoothPath([[672, WALLY + 10], [720, WALLY + 120 + Math.sin(p.abs * 2.2) * 26], [690, WALLY + 300 + Math.sin(p.abs * 1.7) * 20], [730, WALLY + 460], [668, WALLY + 460]], true), { color: '#57514a', ink: '#3a352f', inkW: 3, seed: 2 });
  ctx.restore();
  // Chen stands in the door with the seed pod
  person(ctx, 'chen', 770, FL_INT, 600, {
    expression: 'sad', turn: -.2,
    pose: { lean: -.03, headTilt: .08, handR: [820, FL_INT - 320], handRPose: { curl: .6 }, handL: [740, FL_INT - 300], footL: [740, FL_INT], footR: [810, FL_INT], pelvisY: -.5 }
  });
  drawPod(ctx, 830, FL_INT - 340, .55, -.2, p.abs, { win: .2 });
  // Mu wakes; her hand lowers — she does not stop him
  const wake = smoothstep(.15, .5, p.t01);
  person(ctx, 'mu', 420, FL_INT + 20, 580, {
    expression: 'sad', turn: .6,
    face: facePreset('sad', { lid: lerp(.8, .34, wake) }),
    pose: {
      crouch: lerp(.6, .2, wake), lean: .05,
      headTilt: lerp(.3, .1, wake) + Math.sin(p.abs * 1.2) * .01,
      handR: [470, lerp(FL_INT - 150, FL_INT - 300, wake)],
      handRPose: { curl: .4 },
      handL: [380, FL_INT - 180],
      footL: [370, FL_INT + 20], footR: [470, FL_INT + 20], pelvisY: lerp(-.55, -.51, wake)
    }
  });
  ctx.restore();
  drawAsh(ctx, ashMotes(60, 31), p.abs, { alpha: .3, dir: -1 });
  tFade(ctx, p.t01, .35, '#0a0908');
};

/* ===== S30 — 152.54–159.33 · WS · he runs to the pod; she stays in the light ===== */
const S30 = (ctx, p) => {
  const b = breath(p.abs, 61);
  layer(ctx, p, { zoom: t => lerp(1.04, 1.1, easeInOutCubic(t)), px: t => lerp(0, 50, easeInOutCubic(t)) + b.x * 1.6, py: b.y * 1.6, shake: 2.5 });
  bgDraw(ctx, getSet('dome_night', () => setDomeExt('night')));
  // the pod on its pad outside the dome
  drawPod(ctx, 800, FL_INT + 60, 1.0, 0, p.abs, { win: .35 + .15 * Math.sin(p.abs * 2) });
  glow(ctx, 800, FL_INT + 40, 200, '#f0c477', .2);
  // Chen runs to the pod
  const run = p.t01 * 7, rx = lerp(640, 780, easeInOutCubic(clamp(p.t01 * 1.6)));
  const sw = Math.sin(run);
  person(ctx, 'chen', rx, FL_INT + 70, 600, {
    expression: 'sad', turn: .15,
    pose: {
      lean: .18, pelvisY: -.5 + Math.abs(Math.sin(run * 2)) * .015,
      handL: [rx - 110 + sw * 60, FL_INT - 300 + Math.abs(sw) * 40],
      handR: [rx + 110 - sw * 60, FL_INT - 280 + Math.abs(Math.sin(run + 3)) * 40],
      handLPose: { curl: .5 }, handRPose: { curl: .5 },
      footL: [rx - 55 + sw * 75, FL_INT + 70], footR: [rx + 55 - sw * 75, FL_INT + 70]
    }, wind: .4
  });
  // Mu follows, stops at the pad's edge — a small figure in the door light
  const muStop = smoothstep(.35, .6, p.t01);
  person(ctx, 'mu', lerp(300, 250, muStop), FL_INT + 40, 520, {
    expression: 'sad', turn: .3,
    pose: { lean: .06, headTilt: .1, handR: [300, FL_INT - 240], handRPose: { curl: .3 }, handL: [220, FL_INT - 220], footL: [220, FL_INT + 40], footR: [300, FL_INT + 40], pelvisY: -.51 }
  });
  glow(ctx, 270, FL_INT - 200, 120, '#f0c477', .25);
  // he looks back (head turn toward her, small and distant)
  if (p.t01 > .5) {
    ctx.save(); ctx.globalAlpha = clamp((p.t01 - .5) / .2);
    person(ctx, 'chen', rx, FL_INT + 70, 600, {
      expression: 'sad', turn: lerp(.15, -.8, smoothstep(.5, .8, p.t01)),
      face: facePreset('sad', { gazeX: -.6 }),
      pose: {
        lean: .05, headTilt: lerp(.08, -.1, smoothstep(.5, .8, p.t01)),
        handL: [rx - 110, FL_INT - 300], handR: [rx + 110, FL_INT - 280],
        handLPose: { curl: .5 }, handRPose: { curl: .5 },
        footL: [rx - 55, FL_INT + 70], footR: [rx + 55, FL_INT + 70], pelvisY: -.5
      }, wind: .2
    });
    ctx.restore();
  }
  // pod door closes, lights shift
  const closeT = smoothstep(.82, .98, p.t01);
  if (closeT > 0) {
    ctx.save(); ctx.globalAlpha = closeT;
    paintShape(ctx, ellipsePath(800, FL_INT - 20, 26, 34), { color: '#5a646c', ink: null, seed: 3 });
    ctx.restore();
  }
  ctx.restore();
  drawAsh(ctx, ashMotes(100, 33), p.abs, { alpha: .5, dir: -1 });
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S31 — 159.33–163.38 · WS · the pod launches; the tree dims ===== */
const S31 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.05, 1.18, easeInOutCubic(t)), py: t => lerp(30, -10, t), shake: 1.5 });
  bgDraw(ctx, getSet('dome_night', () => setDomeExt('night')));
  // the pod launches from the pad
  const launch = clamp(p.t01 * 1.4);
  const py2 = lerp(FL_INT + 60, -200, easeInCubic(launch));
  drawPod(ctx, 800, py2, 1.0, 0, p.abs, { ember: launch });
  if (launch > .05) {
    ctx.save();
    const g = ctx.createLinearGradient(800, py2, 800, py2 + 700);
    g.addColorStop(0, `rgba(240,150,80,${.5 * launch})`); g.addColorStop(1, 'rgba(240,150,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(770, py2 + 40); ctx.lineTo(830, py2 + 40); ctx.lineTo(870, py2 + 700); ctx.lineTo(730, py2 + 700); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  glow(ctx, 800, py2, 300 * launch, '#f0b466', .5 * launch);
  // the young tree dims leaf by leaf
  const dim = 1 - smoothstep(.1, .9, p.t01);
  ctx.save(); ctx.translate(700, FL_INT + 130);
  ctx.globalAlpha = .25 + dim * .75;
  drawTree(ctx, 0, 0, .62, p.abs, { h: 640, blossom: .2 });
  glow(ctx, 0, -300, 260, '#e8b86a', .2 * dim);
  ctx.restore();
  // leaves falling
  if (dim < .9) {
    for (let i = 0; i < 12; i++) {
      const ph = (p.abs * .4 + hash2(31, i)) % 1;
      ctx.save(); ctx.translate(640 + Math.sin(i * 3) * 60, FL_INT - 260 + ph * 380); ctx.rotate(ph * 6 + i);
      ctx.globalAlpha = (1 - ph) * .8;
      paintShape(ctx, ellipsePath(0, 0, 12, 6), { color: '#7fa05a', ink: '#41502f', inkW: 2, seed: 50 + i });
      ctx.restore();
    }
  }
  // Mu falls to her knees
  const kneel = smoothstep(.2, .7, p.t01);
  person(ctx, 'mu', 380, FL_INT + 150 + kneel * 40, 600, {
    expression: 'grief', turn: .3,
    pose: {
      crouch: .4 + kneel * .9, lean: .1 + kneel * .1, headTilt: .2 + kneel * .15,
      handL: [330, FL_INT - 100 - kneel * 120], handR: [430, FL_INT - 140 - kneel * 100],
      handLPose: { curl: .6 }, handRPose: { curl: .6 },
      footL: [330, FL_INT + 150 + kneel * 40], footR: [450, FL_INT + 150 + kneel * 40],
      pelvisY: -.52 - kneel * .06
    }
  });
  ctx.restore();
  drawAsh(ctx, ashMotes(150, 41), p.abs, { alpha: .65, dir: -1 });
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S32 — 163.38–168.00 · MCU · the pod is empty ===== */
const S32 = (ctx, p) => {
  const b = breath(p.abs, 71);
  layer(ctx, p, { zoom: t => lerp(1.04, 1.14, easeInOutCubic(t)), px: b.x * 1.4, py: b.y * 1.4, shake: 2 });
  bgDraw(ctx, getSet('podint', setPodInt));
  // Chen, opening the pod
  const real = smoothstep(.15, .5, p.t01);
  person(ctx, 'chen', 500, 1300, 900, {
    expression: 'grief', turn: .3,
    face: facePreset('grief', { lid: lerp(.4, .55, real), mouth: lerp(-.1, -.26, real) }),
    pose: {
      crouch: .3, lean: .06, headTilt: .1 + Math.sin(p.abs * 1.3) * .02,
      handL: [520, 1150], handR: [610, 1160],
      handLPose: { curl: .35 }, handRPose: { curl: .35 },
      footL: [460, 1300], footR: [560, 1300], pelvisY: -.53
    }
  });
  // the empty pod in his hands
  ctx.save(); ctx.translate(565, 1170); ctx.rotate(-.15);
  paintShape(ctx, blobPath(0, 0, 54, 30, 3, .16, 12), { color: '#8d8579', ink: '#241d1a', inkW: 3, seed: 8 });
  paintShape(ctx, ellipsePath(0, -8, 30, 12), { color: '#2e2a24', ink: null, seed: 9 });
  ctx.restore();
  // a single dry leaf in his palm, crumbling
  const cru = smoothstep(.3, .9, p.t01);
  ctx.save(); ctx.translate(620, 1190); ctx.rotate(.4);
  ctx.globalAlpha = 1 - cru;
  paintShape(ctx, ellipsePath(0, 0, 18, 7), { color: '#8a7a5c', ink: '#5c5040', inkW: 2, seed: 6 });
  ctx.restore();
  ctx.save();
  for (let i = 0; i < 10; i++) {
    const a = p.abs * 2 + i;
    ctx.fillStyle = `rgba(138,122,92,${.7 * (1 - cru)})`;
    ctx.fillRect(620 + Math.sin(a) * (10 + cru * 40), 1190 + cru * 60 + Math.cos(a * 1.4) * (6 + cru * 30), 3, 2.4);
  }
  ctx.restore();
  // the orchard below, small and dark, through the window
  ctx.save(); ctx.globalAlpha = .8;
  glow(ctx, BW * .5, BH * .40 - SOY + 120, 130, '#7fa05a', .18 + .05 * Math.sin(p.abs * 1.4));
  ctx.restore();
  ctx.restore();
  drawAsh(ctx, ashMotes(50, 43), p.abs, { alpha: .3, dir: -1 });
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S33 — 168.00–171.50 · WS · the storm tears the dome apart ===== */
const S33 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.02, 1.12, t), px: t => lerp(-40, 20, t), shake: 8 + Math.sin(p.abs * 9) * 5, rot: t => lerp(.01, -.01, t) });
  bgDraw(ctx, getSet('dome_storm', () => setDomeExt('storm')));
  // the dome breaking: glass shards fly
  const br = smoothstep(.1, .9, p.t01);
  ctx.save();
  for (let i = 0; i < 30; i++) {
    const a = hash2(71, i) * TAU, sp = .5 + hash2(72, i);
    const d = br * 700 * sp;
    const gx = 540 + Math.cos(a) * d, gy = BH * .70 - SOY + Math.sin(a) * d * .6;
    ctx.save(); ctx.translate(gx, gy); ctx.rotate(a + br * 8);
    ctx.fillStyle = `rgba(200,220,225,${.8 * (1 - br * .5)})`;
    ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(3, -7); ctx.lineTo(15, 4); ctx.lineTo(-3, 10); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // Mu shields the seedling with her body
  glow(ctx, 620, FL_INT + 60, 200, '#a9d98a', .4);
  person(ctx, 'mu', 560, FL_INT + 150, 540, {
    expression: 'pain', turn: .2,
    pose: {
      crouch: 1.3, lean: .2, headTilt: .3,
      handL: [500, FL_INT - 60], handR: [630, FL_INT - 40],
      handLPose: { curl: .7 }, handRPose: { curl: .7 },
      footL: [500, FL_INT + 150], footR: [640, FL_INT + 150], pelvisY: -.6
    }, wind: 1
  });
  ctx.restore();
  drawRain(ctx, rainDrops(160, 3), p.abs, { alpha: .55, slant: .3 });
  drawWindLines(ctx, p.abs, 5, 26, .35, '170,180,185');
  drawAsh(ctx, ashMotes(140, 51), p.abs, { alpha: .7, dir: -1 });
  // lightning: two whiteouts
  tFlash(ctx, smoothstep(.28, .30, p.t01) * (1 - smoothstep(.30, .39, p.t01)) * .95, '#f5f8ff');
  tFlash(ctx, smoothstep(.58, .60, p.t01) * (1 - smoothstep(.60, .71, p.t01)) * .8, '#f5f8ff');
  tFade(ctx, p.t01, .15, '#0a0908');
};

/* ===== S34 — 171.50–174.54 · WS · the pod turns back; he ejects ===== */
const S34 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.06, 1.14, t), py: t => lerp(40, -30, easeInOutCubic(t)), shake: 4 });
  bgDraw(ctx, getSet('arksky', setArkSky));
  // the ark's lights recede (up-left)
  const ax = lerp(900, 200, easeInOutCubic(p.t01)), ay = lerp(260, 160, p.t01);
  drawArk(ctx, ax, ay, .6 - p.t01 * .18, p.abs, { color: '#232b33' });
  // the pod turns back and burns toward the orchard
  const turn = clamp(p.t01 * 1.2);
  const px2 = lerp(ax + 240, 640, easeInOutCubic(turn)), py2 = lerp(ay + 120, 700, easeInOutCubic(turn));
  drawPod(ctx, px2, py2, .8, 2.4, p.abs, { ember: .9 });
  ctx.save();
  const g = ctx.createLinearGradient(px2, py2, px2 - 200, py2 - 300);
  g.addColorStop(0, 'rgba(240,150,80,.5)'); g.addColorStop(1, 'rgba(240,150,80,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(px2 - 10, py2 - 10); ctx.lineTo(px2 + 10, py2 - 10); ctx.lineTo(px2 - 210, py2 - 320); ctx.lineTo(px2 - 230, py2 - 280); ctx.closePath(); ctx.fill();
  ctx.restore();
  // Chen ejects: a tiny falling figure against the storm
  const ej = smoothstep(.45, .95, p.t01);
  if (ej > 0) {
    const ex = lerp(px2, 600, ej), ey = lerp(py2, 900, easeInCubic(ej));
    // motion streak
    ctx.save(); ctx.globalAlpha = .4;
    ctx.strokeStyle = 'rgba(200,210,215,.5)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ex, ey - 120 - ej * 60); ctx.lineTo(ex, ey - 20); ctx.stroke(); ctx.restore();
    person(ctx, 'chen', ex, ey, 130, {
      expression: 'fear',
      pose: { lean: .1, crouch: .3, headTilt: .2, handL: [ex - 20, ey + 60], handR: [ex + 20, ey + 60], handLPose: { curl: .7 }, handRPose: { curl: .7 }, footL: [ex - 16, ey + 110], footR: [ex + 16, ey + 110], pelvisY: -.52 }
    });
  }
  ctx.restore();
  drawRain(ctx, rainDrops(140, 7), p.abs, { alpha: .5, slant: .3 });
  drawWindLines(ctx, p.abs, 9, 20, .3, '170,180,185');
  tFlash(ctx, smoothstep(.42, .44, p.t01) * (1 - smoothstep(.44, .5, p.t01)) * .3);
  tFade(ctx, p.t01, .2, '#0a0908');
};

/* ===== S35 — 174.54–179.54 · MS · he crashes through; the embrace ===== */
const S35 = (ctx, p) => {
  const b = breath(p.abs, 81);
  layer(ctx, p, { zoom: t => lerp(1.08, 1.16, easeInOutCubic(t)), px: t => lerp(80, 120, t) + b.x * 1.8, py: b.y * 1.8, shake: 3.5 });
  bgDraw(ctx, getSet('int_storm', () => setOrchardInt('storm')));
  // Chen crashes in from above: falling debris, then he lands
  const crash = smoothstep(0, .18, p.t01);
  if (crash < 1) {
    for (let i = 0; i < 12; i++) {
      const d = crash * 500 * (.4 + hash2(81, i));
      ctx.save(); ctx.translate(620 + Math.cos(i * 2.4) * 90, BH * .12 - SOY + d + Math.sin(i * 3) * 40); ctx.rotate(i + d * .01);
      ctx.fillStyle = 'rgba(200,220,225,.85)';
      ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(3, -6); ctx.lineTo(11, 4); ctx.lineTo(-3, 9); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  const cx0 = lerp(700, 620, crash), cy0 = lerp(BH * .1 - SOY, FL_INT + 40, crash);
  // he finds her, pulls her up; they hold each other
  const pull = smoothstep(.25, .55, p.t01);
  person(ctx, 'mu', 470, FL_INT + 40 + (1 - pull) * 90, 580, {
    expression: 'grief', turn: .5,
    face: facePreset(pull > .5 ? 'laugh' : 'grief', { tear: .5 }),
    pose: {
      crouch: lerp(1.1, .1, pull), lean: .1,
      headTilt: .2 - pull * .2,
      handL: [lerp(430, 600, pull), lerp(FL_INT - 40, FL_INT - 260, pull)],
      handR: [lerp(510, 630, pull), lerp(FL_INT - 30, FL_INT - 240, pull)],
      handLPose: { curl: .8 }, handRPose: { curl: .8 },
      footL: [430, FL_INT + 40 + (1 - pull) * 90], footR: [520, FL_INT + 40 + (1 - pull) * 90],
      pelvisY: lerp(-.58, -.5, pull)
    }
  });
  person(ctx, 'chen', cx0, cy0 + pull * 10, 580, {
    expression: 'resolve', turn: -.5,
    face: facePreset(pull > .5 ? 'laugh' : 'resolve', { tear: .3 }),
    pose: {
      lean: -.08, crouch: .1,
      headTilt: -.1 + pull * .12,
      handL: [lerp(cx0 - 60, 540, pull), lerp(FL_INT - 200, FL_INT - 250, pull)],
      handR: [lerp(cx0 + 60, 600, pull), lerp(FL_INT - 180, FL_INT - 230, pull)],
      handLPose: { curl: .8 }, handRPose: { curl: .8 },
      footL: [cx0 - 50, cy0 + pull * 10], footR: [cx0 + 50, cy0 + pull * 10], pelvisY: -.5
    }
  });
  // roots rise around them
  if (p.t01 > .5) {
    const rr = smoothstep(.5, 1, p.t01);
    ctx.save();
    for (let i = 0; i < 6; i++) {
      const rx = 380 + i * 70 + Math.sin(i * 2) * 30;
      const rh = rr * (240 + hash2(91, i) * 220);
      ctx.strokeStyle = `rgba(232,228,210,${.5 + rr * .4})`; ctx.lineWidth = 8 - i * .6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(rx, FL_INT + 40);
      ctx.quadraticCurveTo(rx + Math.sin(p.abs + i) * 30, FL_INT - rh * .6, rx + 20, FL_INT - rh); ctx.stroke();
    }
    ctx.restore();
    glow(ctx, 540, FL_INT - 100, 400, '#f0e6b8', .2 * rr);
  }
  ctx.restore();
  drawRain(ctx, rainDrops(120, 11), p.abs, { alpha: .45 * (1 - p.t01 * .5), slant: .25 });
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S36 — 179.54–183.67 · ECU · the seed cracks; gold runs through the ash ===== */
const S36 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.14, 1.34, easeInOutCubic(t)), rot: t => lerp(-.02, .02, t) });
  ctx.fillStyle = '#1c1815'; ctx.fillRect(-SOX, -SOY, BW, BH);
  // joined hands around the seed
  ctx.save(); ctx.translate(540, 1050);
  drawHand(ctx, -90, 0, 150, -1, { curl: .8, rot: .2 }, 91, Math.floor(p.abs * 12));
  ctx.save(); ctx.rotate(-.2); drawHand(ctx, 100, 10, 150, 1, { curl: .8, rot: -.2 }, 92, Math.floor(p.abs * 12)); ctx.restore();
  // the seed, cracking
  const cr = smoothstep(.15, .6, p.t01);
  glow(ctx, 0, -20, 200 * (.4 + cr), '#f0e6b8', .5 + cr * .4);
  ctx.fillStyle = '#efe6c8';
  ctx.beginPath(); ctx.ellipse(0, -20, 30, 38, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#8a7a3a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-14, -50); ctx.lineTo(-2, -24); ctx.lineTo(-10, -6); ctx.lineTo(2, 14); ctx.stroke();
  // the root pierces down
  if (cr > .3) {
    ctx.save(); ctx.strokeStyle = 'rgba(235,240,225,.95)'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(20, 120, -10, 240); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  // golden light runs through the ash
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 9; i++) {
    const ph = (p.abs * .5 + i * .11) % 1;
    ctx.strokeStyle = `rgba(240,200,120,${.5 * (1 - ph)})`; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(540 + (i - 4) * 90, 1200);
    ctx.lineTo(540 + (i - 4) * 130, 1200 - ph * 700); ctx.stroke();
  }
  ctx.restore();
  // the rain turns silver
  drawRain(ctx, rainDrops(70, 13), p.abs * .8, { alpha: .4 * smoothstep(.2, .8, p.t01), color: 'rgba(215,230,235,', slant: .18 });
  ctx.restore();
  tFlash(ctx, smoothstep(.55, .62, p.t01) * (1 - smoothstep(.62, .8, p.t01)) * .3, '#ffe9b0');
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S37 — 183.67–187.79 · WS · the tree erupts ===== */
const S37 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.0, 1.12, easeInOutCubic(t)), py: t => lerp(60, -50, easeInOutCubic(t)), shake: 2 + Math.sin(p.abs * 8) * 2 });
  bgDraw(ctx, getSet('valley_tree', () => setValley('tree')));
  // the tree erupts: scale grows through the shot
  const grow = lerp(.55, 1.0, easeOutCubic(clamp(p.t01 * 1.15)));
  ctx.save(); ctx.translate(540, BH * .80 - SOY);
  drawTree(ctx, 0, 0, grow, p.abs, { h: 640, blossom: .2 });
  glow(ctx, 0, -300, 380, '#e8b86a', .18);
  ctx.restore();
  // glass shards float like stars
  ctx.save();
  for (let i = 0; i < 40; i++) {
    const z = hash2(77, i);
    const gx = hash2(78, i) * W + Math.sin(p.abs * .5 + i) * 20;
    const gy = ((hash2(79, i) * H - p.abs * (10 + z * 26)) % H + H) % H;
    ctx.fillStyle = `rgba(220,235,240,${.2 + z * .5})`;
    ctx.beginPath(); ctx.arc(gx, gy, 1 + z * 2.6, 0, TAU); ctx.fill();
  }
  ctx.restore();
  // the ark, silhouetted
  drawArk(ctx, 830, 260, .5, p.abs, { color: '#10151b' });
  // their upturned faces, lit from below
  glow(ctx, 540, FL_INT + 60, 320, '#ffe9b0', .3);
  person(ctx, 'mu', 470, FL_INT + 120, 480, {
    expression: 'wonder', turn: .4, face: facePreset('wonder', { gazeY: -.5 }),
    pose: { lean: -.1, headTilt: -.3, handL: [430, FL_INT - 160], handR: [520, FL_INT - 140], footL: [430, FL_INT + 120], footR: [520, FL_INT + 120], pelvisY: -.51 }
  });
  person(ctx, 'chen', 640, FL_INT + 120, 480, {
    expression: 'wonder', turn: -.4, face: facePreset('wonder', { gazeY: -.5 }),
    pose: { lean: .1, headTilt: -.3, handL: [600, FL_INT - 140], handR: [690, FL_INT - 160], footL: [590, FL_INT + 120], footR: [680, FL_INT + 120], pelvisY: -.51 }
  });
  ctx.restore();
  drawRain(ctx, rainDrops(60, 17), p.abs, { alpha: .3, slant: .15 });
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S38 — 187.79–191.29 · EWS · the rain heals the valley ===== */
const S38 = (ctx, p) => {
  layer(ctx, p, { zoom: 1.05, px: t => lerp(50, -50, easeInOutCubic(t)), py: t => lerp(20, -20, t) });
  bgDraw(ctx, getSet('valley_green', () => setValley('green')));
  // the green spreads in a wave from the tree
  const wave = smoothstep(.1, .95, p.t01);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const wg = ctx.createRadialGradient(540, BH * .78 - SOY, 20, 540, BH * .78 - SOY, wave * 900);
  wg.addColorStop(0, 'rgba(150,200,110,.35)'); wg.addColorStop(.7, 'rgba(150,200,110,.12)'); wg.addColorStop(1, 'rgba(150,200,110,0)');
  ctx.fillStyle = wg; ctx.fillRect(0, 0, W, H); ctx.restore();
  // the ark's lights descend toward the ground
  const ay = lerp(300, 620, easeInOutCubic(p.t01));
  drawArk(ctx, 820, ay, .42, p.abs, { color: '#232b33' });
  ctx.restore();
  drawRain(ctx, rainDrops(200, 19), p.abs, { alpha: .5, slant: .2 });
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S39 — 191.29–194.54 · MS · under the tree; two cranes on a branch ===== */
const S39 = (ctx, p) => {
  const b = breath(p.abs, 92);
  layer(ctx, p, { zoom: t => lerp(1.1, 1.2, easeInOutCubic(t)), px: t => lerp(70, 110, t) + b.x, py: b.y, shake: 1.2 });
  bgDraw(ctx, getSet('valley_tree', () => setValley('tree')));
  // the couple under the tree, holding each other
  person(ctx, 'mu', 470, FL_INT + 130, 500, {
    expression: 'soft', turn: .5,
    pose: { lean: -.06, headTilt: .12, handR: [560, FL_INT - 160], handRPose: { curl: .5 }, handL: [430, FL_INT - 150], footL: [430, FL_INT + 130], footR: [520, FL_INT + 130], pelvisY: -.51 }
  });
  person(ctx, 'chen', 610, FL_INT + 130, 500, {
    expression: 'soft', turn: -.5,
    pose: { lean: .06, headTilt: -.12, handL: [540, FL_INT - 160], handLPose: { curl: .5 }, handR: [660, FL_INT - 150], footL: [560, FL_INT + 130], footR: [650, FL_INT + 130], pelvisY: -.51 }
  });
  // a branch in the foreground with two paper cranes, one old, one new
  ctx.save(); ctx.translate(200, 260);
  ctx.strokeStyle = '#3d332a'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-80, 20); ctx.quadraticCurveTo(200, -10, 460, 30); ctx.stroke();
  drawPaperCrane(ctx, 240, 34, .9, .1 + Math.sin(p.abs * 1.4) * .08, '#e8dcc6', 11);
  ctx.save(); ctx.globalAlpha = .55;
  drawPaperCrane(ctx, 330, 52, .8, -.14 + Math.sin(p.abs * 1.2 + 2) * .08, '#c9bda2', 12);
  ctx.restore();
  ctx.restore();
  ctx.restore();
  // rain in bokeh
  ctx.save();
  for (let i = 0; i < 24; i++) {
    const bx = hash2(95, i) * W, by = ((hash2(96, i) * H + p.abs * 60) % H);
    ctx.fillStyle = `rgba(210,225,230,${.1 + hash2(97, i) * .12})`;
    ctx.beginPath(); ctx.arc(bx, by, 6 + hash2(98, i) * 12, 0, TAU); ctx.fill();
  }
  ctx.restore();
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S40 — 194.54–198.50 · ECU · ten fingers, one drop ===== */
const S40 = (ctx, p) => {
  layer(ctx, p, { zoom: 1.2, px: 10, py: 20 });
  ctx.fillStyle = '#221d18'; ctx.fillRect(-SOX, -SOY, BW, BH);
  ctx.fillStyle = 'rgba(10,9,8,.4)'; ctx.beginPath(); ctx.ellipse(540, 1250, 400, 110, 0, 0, TAU); ctx.fill();
  // the empty seed pod between them
  ctx.save(); ctx.translate(540, 1080);
  paintShape(ctx, blobPath(0, 0, 66, 36, 3, .15, 12), { color: '#8d8579', ink: '#241d1a', inkW: 4, seed: 8 });
  paintShape(ctx, ellipsePath(0, -8, 40, 14), { color: '#2e2a24', ink: null, seed: 9 });
  ctx.restore();
  // two hands, ten fingers interlocked
  ctx.save(); ctx.translate(540, 1180);
  // left palm
  paintShape(ctx, ellipsePath(-60, 30, 74, 58, -.3), { color: '#c79470', ink: '#a06a4e', inkW: 4, seed: 12 });
  // right palm
  paintShape(ctx, ellipsePath(60, 30, 74, 58, .3), { color: '#c79470', ink: '#a06a4e', inkW: 4, seed: 13 });
  // interlocking fingers: alternating capsules
  for (let i = 0; i < 5; i++) {
    const fx = -84 + i * 42;
    const over = i % 2 === 0;
    ctx.save();
    if (over) { // left fingers over
      paintShape(ctx, capsulePath(fx, -10, fx + 26, 66 + i * 6, 13, 12, 8), { color: '#c79470', ink: '#a06a4e', inkW: 3, seed: 20 + i });
      paintShape(ctx, capsulePath(fx + 30, 100, fx + 4, 20, 12, 11, 8), { color: '#b07c59', ink: '#85563e', inkW: 3, seed: 40 + i });
    } else { // right fingers over
      paintShape(ctx, capsulePath(fx + 40, -10, fx + 14, 66 + i * 6, 13, 12, 8), { color: '#b07c59', ink: '#85563e', inkW: 3, seed: 30 + i });
      paintShape(ctx, capsulePath(fx + 10, 100, fx + 36, 20, 12, 11, 8), { color: '#c79470', ink: '#a06a4e', inkW: 3, seed: 50 + i });
    }
    ctx.restore();
  }
  ctx.restore();
  glow(ctx, 540, 1080, 200, '#f0e6b8', .18);
  // one drop of rain falls between them
  const dp = smoothstep(.45, .92, p.t01);
  if (dp < 1) {
    const dy = lerp(300, 1180, easeInCubic(dp));
    ctx.fillStyle = 'rgba(220,240,238,.9)';
    ctx.beginPath(); ctx.ellipse(540, dy, 7, 11 + dp * 4, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.globalAlpha = .5;
    ctx.strokeStyle = 'rgba(220,240,238,.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(540, 300); ctx.lineTo(540, dy - 20); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  // whiteout
  tFlash(ctx, smoothstep(.9, 1, p.t01) * .9, '#f5f2e8');
  tFade(ctx, p.t01, .2, '#0a0908');
};

/* ===== S41 — 198.50–204.50 · EWS · what their choice changed ===== */
const S41 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.0, 1.08, easeInOutCubic(t)), py: t => lerp(30, -30, easeInOutCubic(t)) });
  bgDraw(ctx, getSet('valley_tree', () => setValley('tree')));
  // the tree towers; people walk toward the green
  ctx.save(); ctx.translate(540, BH * .80 - SOY);
  drawTree(ctx, 0, 0, 1.0, p.abs, { h: 660, blossom: .5 });
  ctx.restore();
  drawCrowd(ctx, 540, FL_INT + 260, .8, 14, p.abs * .25, '#2a2e28');
  glow(ctx, 540, FL_INT + 100, 420, '#ffe9b0', .12);
  ctx.restore();
  drawRain(ctx, rainDrops(60, 23), p.abs, { alpha: .22, slant: .18 });
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S42 — 204.50–211.00 · MS · the reunion with his people ===== */
const S42 = (ctx, p) => {
  const b = breath(p.abs, 93);
  layer(ctx, p, { zoom: t => lerp(1.05, 1.12, easeInOutCubic(t)), px: t => lerp(40, 80, t) + b.x, py: b.y, shake: 2 });
  bgDraw(ctx, getSet('valley_green', () => setValley('green')));
  // the landed ark with a ramp; his people come down
  ctx.save(); ctx.translate(800, FL_INT + 40); ctx.scale(.7, .7);
  paintShape(ctx, blobPath(0, -60, 300, 60, 4, .1, 20), { color: '#39424a', ink: '#232a30', inkW: 5, seed: 12 });
  paintShape(ctx, polyPath([[-40, -30], [40, -30], [120, 120], [-120, 120]]), { color: '#4a545c', ink: '#2a333a', inkW: 4, seed: 13 });
  for (let i = 0; i < 6; i++) glow(ctx, -200 + i * 80, -66, 30, '#f0c477', .5);
  ctx.restore();
  const walk = p.abs * .4;
  drawCrowd(ctx, 540, FL_INT + 300, .9, 12, walk, '#333a35');
  // he meets them, then turns back and reaches for Mu
  const reach = smoothstep(.4, .7, p.t01);
  person(ctx, 'chen', 540, FL_INT + 120, 560, {
    expression: 'soft', turn: lerp(-.4, .6, reach),
    pose: {
      lean: 0, headTilt: lerp(-.05, .08, reach),
      handR: [lerp(620, 660, reach), lerp(FL_INT - 260, FL_INT - 240, reach)],
      handRPose: { curl: .3, spread: .9, rot: lerp(-.3, -.8, reach) },
      handL: [480, FL_INT - 250], footL: [500, FL_INT + 120], footR: [590, FL_INT + 120], pelvisY: -.5 + Math.abs(Math.sin(walk * 6)) * .01
    }
  });
  person(ctx, 'mu', 760, FL_INT + 130, 540, {
    expression: 'soft', turn: -.7,
    pose: { lean: -.04, headTilt: .06, handL: [700, FL_INT - 250], handLPose: { curl: .3, spread: .9 }, handR: [820, FL_INT - 220], footL: [720, FL_INT + 130], footR: [810, FL_INT + 130], pelvisY: -.51 }
  });
  ctx.restore();
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S43 — 211.00–218.00 · WS time-lapse · the coda earns the ending ===== */
const S43 = (ctx, p) => {
  layer(ctx, p, { zoom: 1.04, px: 20 });
  bgDraw(ctx, getSet('valley_grove', () => setValley('grove')));
  // time-lapse light: warm cycles
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const tl = .5 + .5 * Math.sin(p.abs * .8);
  const lg = ctx.createLinearGradient(0, 0, 0, H);
  lg.addColorStop(0, `rgba(255,200,130,${.1 + tl * .12})`); lg.addColorStop(1, 'rgba(255,180,110,0)');
  ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); ctx.restore();
  // growth pops: blossoms and fruit blink in
  for (let i = 0; i < 30; i++) {
    const ph = (p.abs * .35 + hash2(31, i)) % 1;
    const tx = hash2(32, i) * W, ty = FL_INT - 60 - hash2(33, i) * 200;
    if (ph < .5) {
      ctx.fillStyle = ph < .25 ? `rgba(238,190,200,${.6 + ph})` : `rgba(220,140,90,${.5 + hash2(34, i) * .4})`;
      ctx.beginPath(); ctx.arc(tx, ty, 4 + hash2(35, i) * 6, 0, TAU); ctx.fill();
    }
  }
  // the couple plant rows
  const plant = p.abs * 1.2;
  person(ctx, 'mu', 420, FL_INT + 180, 460, {
    expression: 'soft', turn: .5,
    pose: { crouch: .5 + .2 * Math.sin(plant * 2), lean: .1, headTilt: .1, handR: [480, FL_INT - 100], handRPose: { curl: .5 }, handL: [380, FL_INT - 120], footL: [380, FL_INT + 180], footR: [470, FL_INT + 180], pelvisY: -.53 }
  });
  person(ctx, 'chen', 660, FL_INT + 180, 480, {
    expression: 'soft', turn: -.5,
    pose: { crouch: .5 + .2 * Math.sin(plant * 2 + 1), lean: -.1, headTilt: -.1, handL: [600, FL_INT - 100], handLPose: { curl: .5 }, handR: [720, FL_INT - 120], footL: [610, FL_INT + 180], footR: [700, FL_INT + 180], pelvisY: -.53 }
  });
  ctx.restore();
  drawRain(ctx, rainDrops(30, 29), p.abs, { alpha: .15, slant: .18 });
  tFade(ctx, p.t01, .3, '#0a0908');
};

/* ===== S44 — 218.00–226.58 · MS · years later, under the tree ===== */
const S44 = (ctx, p) => {
  const wind = Math.sin(p.abs * .9) * .02;
  layer(ctx, p, { zoom: t => lerp(1.06, 1.1, easeInOutCubic(t)), px: 30, py: 10 });
  bgDraw(ctx, getSet('valley_years', () => setValley('years')));
  // the old tree
  ctx.save(); ctx.translate(700, FL_INT + 60);
  drawTree(ctx, 0, 0, .95, p.abs, { h: 700, blossom: 1 });
  ctx.restore();
  glow(ctx, 700, FL_INT - 120, 300, '#ffe0b0', .1);
  // older Mu and Chen, sitting, she leans on him
  const old = { hair: '#9a948a', hairLight: '#b5afa3' };
  person(ctx, 'mu', 470, FL_INT + 150, 520, {
    expression: 'soft', turn: .5, look: old,
    pose: {
      crouch: .9, lean: .1, headTilt: .16 + wind,
      handR: [560, FL_INT - 120], handRPose: { curl: .5 },
      handL: [420, FL_INT - 110],
      footL: [400, FL_INT + 150], footR: [520, FL_INT + 150], pelvisY: -.56
    }
  });
  person(ctx, 'chen', 640, FL_INT + 150, 540, {
    expression: 'soft', turn: -.5, look: old,
    pose: {
      crouch: .9, lean: -.06, headTilt: -.1,
      handL: [560, FL_INT - 130], handLPose: { curl: .5 },
      handR: [720, FL_INT - 110],
      footL: [580, FL_INT + 150], footR: [690, FL_INT + 150], pelvisY: -.56
    }
  });
  // two paper cranes turn slowly above
  drawPaperCrane(ctx, 500 + Math.sin(p.abs * .5) * 30, 240, .8, p.abs * .5, '#e8dcc6', 11);
  drawPaperCrane(ctx, 820 + Math.cos(p.abs * .4) * 26, 300, .8, -p.abs * .5, '#e8dcc6', 12);
  // a child runs past, out of focus
  const child = (p.abs * .55) % 1;
  if (child > .1 && child < .8) {
    const chx = lerp(-100, W + 100, (child - .1) / .7);
    ctx.save(); ctx.globalAlpha = .38;
    ctx.filter = 'blur(3px)';
    paintShape(ctx, capsulePath(chx, FL_INT + 40, chx + 20, FL_INT - 130, 22, 26, 8), { color: '#8a7a5c', ink: null, seed: 2 });
    ctx.fillStyle = '#8a7a5c'; ctx.beginPath(); ctx.arc(chx + 26, FL_INT - 160, 24, 0, TAU); ctx.fill();
    ctx.filter = 'none'; ctx.restore();
  }
  ctx.restore();
  // gentle breeze: pollen
  drawSpores(ctx, sporeBits(24, 31), p.abs);
  tFade(ctx, p.t01, .35, '#efe7d4');
};

/* ===== S45 — 226.58–232.62 · ECU→EWS · the leaf, the pool, the title ===== */
const S45 = (ctx, p) => {
  const pull = smoothstep(.55, .95, p.t01);
  layer(ctx, p, { zoom: t => lerp(1.25, 1.08, easeInOutCubic(t)), py: t => lerp(60, 20, t) });
  bgDraw(ctx, getSet('pool', setPool));
  // the reflection: the tree, the two figures, the ark in the sky
  ctx.save();
  ctx.globalAlpha = .22;
  ctx.translate(540, BH * .52 - SOY + 30); ctx.scale(1, -1);
  drawTree(ctx, 0, 0, .5, p.abs + 40, { h: 600, blossom: .6 });
  person(ctx, 'mu', 470, FL_INT + 130, 470, { expression: 'soft', turn: .5, look: { hair: '#9a948a', hairLight: '#b5afa3' }, pose: { crouch: .9, lean: .1, headTilt: .14, handR: [560, FL_INT - 120], footL: [400, FL_INT + 130], footR: [520, FL_INT + 130], pelvisY: -.56 } });
  person(ctx, 'chen', 640, FL_INT + 130, 490, { expression: 'soft', turn: -.5, look: { hair: '#9a948a', hairLight: '#b5afa3' }, pose: { crouch: .9, lean: -.06, headTilt: -.1, handL: [560, FL_INT - 130], footL: [580, FL_INT + 130], footR: [690, FL_INT + 130], pelvisY: -.56 } });
  drawArk(ctx, 830, 240, .4, p.abs + 20, { color: '#1a2129' });
  ctx.restore();
  drawRipples(ctx, 540, BH * .52 - SOY + 30, p.abs, 4);
  // a single leaf falls into the pool
  const lf = smoothstep(0, .8, p.t01);
  const ly = lerp(200, BH * .52 - SOY + 20, easeInCubic(lf)) + Math.sin(lf * 8) * 30 * (1 - lf);
  ctx.save(); ctx.translate(540 + Math.sin(lf * 5) * 26, ly); ctx.rotate(lf * 4);
  paintShape(ctx, ellipsePath(0, 0, 16, 8), { color: '#7fa05a', ink: '#41502f', inkW: 2, seed: 9 });
  ctx.restore();
  // the ripple from the leaf
  if (lf > .75) {
    const rp = (lf - .75) / .25;
    ctx.save(); ctx.globalAlpha = .6 * (1 - rp);
    ctx.strokeStyle = '#dfeae4'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(540, BH * .52 - SOY + 24, 20 + rp * 120, 8 + rp * 46, 0, 0, TAU); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  // the image settles; the title
  const settle = smoothstep(.88, 1, p.t01);
  if (settle > 0) {
    ctx.save(); ctx.globalAlpha = settle * .92; ctx.fillStyle = '#e8dcc6'; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save(); ctx.globalAlpha = settle;
    ctx.fillStyle = '#241d1a'; ctx.textAlign = 'center';
    ctx.font = '700 96px "Songti SC", "STSong", serif';
    ctx.fillText('愿与愁', 540, 900);
    ctx.font = '300 34px "PingFang SC", sans-serif';
    ctx.fillText('Dust and Ashes', 540, 968);
    ctx.font = '300 26px "PingFang SC", sans-serif';
    ctx.fillStyle = '#6b5f4e';
    ctx.fillText('一部代码绘制的动画短片', 540, 1040);
    ctx.restore();
  }
  tFade(ctx, 0, .01); // no fade
};

/* ---------- registry ---------- */














/* ===== S06 — 22.21–27.04 · MCU · the photo in the frame ===== */
const S06 = (ctx, p) => {
  const b = breath(p.abs, 13);
  layer(ctx, p, { zoom: t => lerp(1.12, 1.24, easeInOutCubic(t)), px: t => lerp(-10, 55, easeInOutCubic(t)) + b.x, py: b.y });
  bgDraw(ctx, getSet('int_day', () => setOrchardInt('day')));
  // Mu mid-climb on the ladder (left)
  const climb = Math.sin(p.abs * 1.6) * 14;
  person(ctx, 'mu', 168, FL_INT - 330 + climb * .3, 720, {
    expression: 'neutral', turn: .3, face: facePreset('neutral', { gazeY: .12 }),
    pose: {
      lean: .08, headTilt: -.06 - climb * .001,
      handL: [150, 690 + climb], handR: [226, 780 - climb * .5],
      handLPose: { curl: .75 }, handRPose: { curl: .75 },
      footL: [150, FL_INT - 330 + climb * .3], footR: [196, FL_INT - 330 + climb * .3 + 30],
      pelvisY: -.52
    }, wind: .04
  });
  // the photo, sharp in the rack focus
  const phx = BW * .135 - SOX + 52, phy = BH * .24 - SOY + 40;
  ctx.save(); ctx.translate(phx, phy); ctx.rotate(-.05);
  paintShape(ctx, roundRectPath(-52, -40, 104, 80, 3), { color: '#5a4632', ink: '#2e2418', inkW: 3, seed: 44 });
  paintShape(ctx, roundRectPath(-46, -34, 92, 68, 2), { color: '#d6c9af', ink: null, seed: 45 });
  paintShape(ctx, ellipsePath(-18, 6, 12, 12), { color: '#8a7a5c', ink: null, seed: 46 });
  paintShape(ctx, ellipsePath(20, 6, 12, 12), { color: '#8a7a5c', ink: null, seed: 47 });
  ctx.fillStyle = '#8a7a5c'; ctx.fillRect(-30, 16, 24, 18); ctx.fillRect(8, 16, 24, 18);
  drawPaperCrane(ctx, 0, -14, .8, .1, '#e8dcc6', 6);
  ctx.restore();
  dofDim(ctx, phx, phy, 340, 300, .42);
  // the ark's shadow sweeps past the window
  const sh = smoothstep(.55, .95, p.t01);
  if (sh > 0 && sh < 1) {
    ctx.save(); ctx.globalAlpha = .34 * Math.sin(sh * Math.PI);
    ctx.fillStyle = '#0c0f13';
    ctx.beginPath(); ctx.moveTo(W * .06 + sh * 500, BH * .10 - SOY); ctx.lineTo(W * .94, BH * .10 - SOY);
    ctx.lineTo(W * .94, BH * .68 - SOY); ctx.lineTo(W * .06 + sh * 500 - 260, BH * .68 - SOY); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S07 — 27.04–32.92 · WS · the ark passes, a leaf lands ===== */
const S07 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.04, 1.14, easeInOutCubic(t)), py: t => lerp(46, -26, easeInOutCubic(t)), rot: t => lerp(-.006, .004, t) });
  bgDraw(ctx, getSet('int_day', () => setOrchardInt('day')));
  // the ark crossing the window sky
  const ax = lerp(1500, -200, easeInOutCubic(clamp(p.t01 * 1.15)));
  ctx.save(); ctx.translate(ax, BH * .26 - SOY); ctx.scale(.62, .62);
  drawArk(ctx, 0, 0, 1, p.abs, { color: '#1c232b' });
  ctx.restore();
  // shadow sweeping the plants
  ctx.save(); ctx.globalAlpha = .3 * Math.sin(clamp(p.t01 * 1.2) * Math.PI);
  ctx.fillStyle = '#0c0f13';
  ctx.beginPath(); ctx.moveTo(W * .06, BH * .10 - SOY); ctx.lineTo(W * .94, BH * .10 - SOY); ctx.lineTo(W * .94, BH * .68 - SOY); ctx.lineTo(W * .06, BH * .68 - SOY); ctx.closePath(); ctx.fill();
  ctx.restore();
  // Mu, looking up
  person(ctx, 'mu', 330, FL_INT, 560, {
    expression: 'wonder', turn: .85, face: facePreset('wonder', { gazeY: -.35, gazeX: .3 }),
    pose: { lean: -.06, headTilt: -.22, handL: [270, FL_INT - 320], handR: [390, FL_INT - 300], handLPose: { curl: .4 }, handRPose: { curl: .4 } }, wind: .12
  });
  // seedling leaves lean toward the light
  ctx.save(); ctx.translate(SEED_X, SEED_Y);
  paintShape(ctx, polyPath([[-64, 0], [58, 0], [46, -78], [-52, -78]]), { color: '#6b563f', ink: '#2e2418', inkW: 4, seed: 2 });
  drawSeedling(ctx, 4, -80, 1.05, .26, p.abs + 40, { wind: .5 });
  ctx.restore();
  // the leaf that detaches and lands on her shoulder
  const lf = smoothstep(.42, .95, p.t01);
  if (lf > 0) {
    const lx = lerp(SEED_X - 10, 392, easeInOutCubic(lf)), ly = lerp(FL_INT - 300, FL_INT - 706, easeInCubic(lf)) + Math.sin(lf * 9) * 26 * (1 - lf);
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(lf * 5 + .6);
    paintShape(ctx, ellipsePath(0, 0, 17, 8), { color: '#7fa05a', ink: '#41502f', inkW: 2, seed: 9 });
    ctx.restore();
  }
  // lens flare streak
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .18;
  const fg = ctx.createLinearGradient(0, BH * .2 - SOY, W, BH * .3 - SOY);
  fg.addColorStop(0, 'rgba(255,220,160,0)'); fg.addColorStop(.5, 'rgba(255,220,160,.5)'); fg.addColorStop(1, 'rgba(255,220,160,0)');
  ctx.fillStyle = fg; ctx.fillRect(0, BH * .2 - SOY, W, 26); ctx.restore();
  ctx.restore();
  tFade(ctx, p.t01, .25, '#0a0908');
};

/* ===== S08 — 32.92–39.17 · MCU→CU · tying the paper wish ===== */
const S08 = (ctx, p) => {
  layer(ctx, p, { zoom: t => lerp(1.06, 1.36, easeInOutCubic(t)), px: t => lerp(250, 300, t), py: t => lerp(520, 560, t) });
  bgDraw(ctx, getSet('int_dusk0', () => setOrchardInt('dusk')));
  // pot + sapling
  ctx.save(); ctx.translate(SEED_X, SEED_Y);
  paintShape(ctx, polyPath([[-64, 0], [58, 0], [46, -78], [-52, -78]]), { color: '#6b563f', ink: '#2e2418', inkW: 4, texA: .2, seed: 2 });
  drawSeedling(ctx, 4, -80, 1.05, .3, p.abs, { wind: .06 });
  ctx.restore();
  // Mu kneeling, tying the wish
  person(ctx, 'mu', SEED_X - 240, FL_INT - 40, 620, {
    expression: 'soft', turn: .9, face: facePreset('soft', { lid: .34 }),
    pose: {
      crouch: .9, lean: -.02, headTilt: .1 + Math.sin(p.abs * 1.2) * .02,
      handL: [SEED_X - 96, FL_INT - 330], handR: [SEED_X - 30, FL_INT - 356],
      handLPose: { curl: .6 }, handRPose: { curl: .6 },
      footL: [SEED_X - 300, FL_INT - 6], footR: [SEED_X - 190, FL_INT - 2],
      pelvisY: -.5
    }
  });
  // the paper wish tag, tied and trembling
  drawWishTag(ctx, SEED_X - 58, FL_INT - 400, 1.05, Math.sin(p.abs * 2.4) * .12 + .2, p.abs);
  ctx.save(); ctx.strokeStyle = '#4a3527'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(SEED_X - 62, FL_INT - 340); ctx.quadraticCurveTo(SEED_X - 66, FL_INT - 380, SEED_X - 58, FL_INT - 420); ctx.stroke(); ctx.restore();
  ctx.restore();
  tFade(ctx, p.t01, .25, '#0a0908');
};



const SHOTS = {
  S01, S02, S03, S04, S05, S06, S07, S08, S09, S10,
  S11, S12, S13, S14, S15, S16, S17, S18, S19, S20,
  S21, S22, S23, S24, S25, S26, S27, S28, S29, S30,
  S31, S32, S33, S34, S35, S36, S37, S38, S39, S40,
  S41, S42, S43, S44, S45
};
