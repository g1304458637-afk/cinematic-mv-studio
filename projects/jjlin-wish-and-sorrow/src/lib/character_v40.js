/* character.js — original painterly 2D character rig.
 * Local space: feet y=0, top of head y≈-1. One unit = full body height.
 * Deterministic line boil at 12 fps. No random().
 */
const CHARS = {
  mu: {
    headW: .043, headH: .067, shoulder: .098, waist: .062, hip: .068,
    l1: .158, l2: .148, thigh: .245, shin: .238,
    skin: '#c79470', skinShade: '#a06a4e', skinLight: '#e2b48e',
    hair: '#221a18', hairLight: '#3a2b26',
    coat: '#66634f', coatDark: '#454436', coatLight: '#878066',
    shirt: '#d6c9af', trouser: '#494237', boot: '#2c2721',
    scarf: '#a86137', scarfDark: '#6f3d24', accent: '#7f915f', age: 0
  },
  chen: {
    headW: .047, headH: .072, shoulder: .108, waist: .066, hip: .070,
    l1: .168, l2: .158, thigh: .252, shin: .245,
    skin: '#b07c59', skinShade: '#85563e', skinLight: '#cfa079',
    hair: '#191514', hairLight: '#2c2421',
    coat: '#474b4d', coatDark: '#2d3133', coatLight: '#62686a',
    shirt: '#3d4b55', trouser: '#30373d', boot: '#231f1d',
    scarf: '#6f352a', scarfDark: '#4a211b', accent: '#8e3a2a', age: 0
  }
};

function capsulePts(x1, y1, x2, y2, r1, r2, n = 12) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1e-6;
  const a = Math.atan2(dy, dx), pts = [];
  // end cap: left normal -> outward -> right normal
  for (let i = 0; i <= n; i++) { const t = a + Math.PI / 2 - (i / n) * Math.PI; pts.push([x2 + Math.cos(t) * r2, y2 + Math.sin(t) * r2]); }
  // start cap: right normal -> outward -> left normal
  for (let i = 0; i <= n; i++) { const t = a - Math.PI / 2 - (i / n) * Math.PI; pts.push([x1 + Math.cos(t) * r1, y1 + Math.sin(t) * r1]); }
  return pts;
}
function capsulePath(x1, y1, x2, y2, r1, r2, n = 12) { return polyPath(capsulePts(x1, y1, x2, y2, r1, r2, n)); }
function ik2(sx, sy, tx, ty, l1, l2, bend = 1) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4);
  const a = Math.atan2(dy, dx);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const A = Math.acos(cosA) * bend;
  return { x: sx + Math.cos(a + A) * l1, y: sy + Math.sin(a + A) * l1, tx: sx + Math.cos(a) * d, ty: sy + Math.sin(a) * d };
}

const FACES = {
  neutral: { brow: 0, browTilt: 0, lid: .18, gazeX: 0, gazeY: 0, mouth: .06, mouthW: .0135, smile: .03, tear: 0, blush: .12, jaw: 0 },
  soft:    { brow: -.06, browTilt: .04, lid: .28, gazeX: 0, gazeY: .04, mouth: .05, mouthW: .013, smile: .28, tear: 0, blush: .18, jaw: 0 },
  sad:     { brow: .16, browTilt: -.18, lid: .38, gazeX: 0, gazeY: .2, mouth: -.12, mouthW: .012, smile: -.08, tear: .18, blush: .08, jaw: 0 },
  grief:   { brow: .26, browTilt: -.26, lid: .5, gazeX: 0, gazeY: .3, mouth: -.24, mouthW: .013, smile: -.2, tear: .7, blush: .06, jaw: .08 },
  fear:    { brow: -.12, browTilt: .18, lid: -.06, gazeX: .08, gazeY: -.04, mouth: -.12, mouthW: .016, smile: 0, tear: 0, blush: .03, jaw: .2 },
  anger:   { brow: -.24, browTilt: -.2, lid: .06, gazeX: 0, gazeY: 0, mouth: -.08, mouthW: .016, smile: -.04, tear: 0, blush: .07, jaw: .14 },
  wonder:  { brow: -.2, browTilt: .05, lid: -.1, gazeX: 0, gazeY: -.14, mouth: .16, mouthW: .014, smile: .16, tear: 0, blush: .14, jaw: .22 },
  laugh:   { brow: -.12, browTilt: .04, lid: -.02, gazeX: 0, gazeY: -.03, mouth: .42, mouthW: .018, smile: .6, tear: .1, blush: .28, jaw: .28 },
  resolve: { brow: -.14, browTilt: -.1, lid: .04, gazeX: 0, gazeY: 0, mouth: 0, mouthW: .014, smile: .04, tear: 0, blush: .05, jaw: .04 },
  sleep:   { brow: .04, browTilt: 0, lid: 1, gazeX: 0, gazeY: .4, mouth: .02, mouthW: .011, smile: .04, tear: 0, blush: .08, jaw: 0 },
  pain:    { brow: .22, browTilt: -.3, lid: .44, gazeX: 0, gazeY: .16, mouth: -.18, mouthW: .013, smile: -.16, tear: .16, blush: .06, jaw: .16 }
};
function facePreset(name, extra = {}) { return Object.assign({}, FACES[name] || FACES.neutral, extra); }

function inkL(ctx, pts, w, color, seed, alpha = .9) {
  inkStroke(ctx, pts, { w, color, seed, taper: .45, alpha, jitter: .28, bristle: true });
}

function drawEye(ctx, x, y, rx, ry, fx, side, turn, seed) {
  const open = clamp(1 - (fx.lid || 0), 0, 1);
  const oh = ry * (0.04 + 0.96 * open);
  if (open < .07) {
    inkL(ctx, [[x - rx, y], [x - rx * .2, y + ry * .12], [x + rx * .75, y - ry * .02]], .0032, '#2a1c17', seed, .9);
    return;
  }
  const shape = new Path2D();
  const inner = side > 0 ? 1 : -1;
  shape.moveTo(x - rx, y + ry * .05);
  shape.quadraticCurveTo(x - rx * .45, y - oh * .9, x + rx * .1, y - oh * .92);
  shape.quadraticCurveTo(x + rx * .75, y - oh * .8, x + rx, y - ry * .05);
  shape.quadraticCurveTo(x + rx * .5, y + oh * .72, x - rx * .1, y + oh * .74);
  shape.quadraticCurveTo(x - rx * .7, y + oh * .65, x - rx, y + ry * .05);
  ctx.save(); ctx.clip(shape); ctx.fillStyle = '#eadbc6'; ctx.fill(shape);
  const gx = (fx.gazeX || 0) * rx * .32, gy = (fx.gazeY || 0) * ry * .3;
  const ir = ry * .62;
  const ig = ctx.createRadialGradient(x + gx, y + gy, ir * .1, x + gx, y + gy, ir);
  ig.addColorStop(0, '#6b4a2c'); ig.addColorStop(.6, '#3d2a1b'); ig.addColorStop(1, '#1b1210');
  ctx.fillStyle = ig; ctx.beginPath(); ctx.arc(x + gx, y + gy + ry * .16, ir, 0, TAU); ctx.fill();
  ctx.fillStyle = '#0d0a09'; ctx.beginPath(); ctx.arc(x + gx, y + gy + ry * .16, ir * .5, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,245,220,.85)'; ctx.beginPath(); ctx.arc(x + gx - ir * .3, y + gy - ir * .15, ir * .18, 0, TAU); ctx.fill();
  // upper lid shadow
  ctx.fillStyle = 'rgba(60,35,28,.22)'; ctx.beginPath(); ctx.ellipse(x, y - oh * .55, rx * .95, oh * .4, 0, 0, TAU); ctx.fill();
  ctx.restore();
  inkL(ctx, [[x - rx, y], [x - rx * .3, y - oh * .98], [x + rx * .4, y - oh * .88], [x + rx, y - ry * .05]], .0042, '#2a1c17', seed + 2, .95);
  ctx.save(); ctx.globalAlpha = .32; ctx.strokeStyle = '#4a3024'; ctx.lineWidth = .0018;
  ctx.beginPath(); ctx.moveTo(x - rx * .7, y + oh * .55); ctx.quadraticCurveTo(x, y + oh * .95, x + rx * .8, y + ry * .05); ctx.stroke(); ctx.restore();
}

function drawBrow(ctx, x, y, w, fx, side, seed) {
  const by = y + (fx.brow || 0) * .011;
  const tilt = (fx.browTilt || 0) * .011;
  const inner = [x + (side > 0 ? -w * .45 : w * .45), by + tilt * .8];
  const outer = [x + (side > 0 ? w * .85 : -w * .85), by - tilt * .15 - .001];
  const mid = [(inner[0] + outer[0]) / 2, (inner[1] + outer[1]) / 2 - .0035];
  inkStroke(ctx, [inner, mid, outer], { w: .0032, color: '#2e201b', seed, taper: .5, alpha: .82, bristle: false, jitter: .22 });
}

function drawNose(ctx, x, y, turn) {
  ctx.save(); ctx.globalAlpha = .55; ctx.strokeStyle = '#8b5a40'; ctx.lineWidth = .0022;
  ctx.beginPath(); ctx.moveTo(x - .001 + turn * .003, y - .012); ctx.quadraticCurveTo(x + turn * .006, y - .002, x + .004 + turn * .004, y + .005); ctx.stroke();
  ctx.globalAlpha = .28; ctx.fillStyle = '#5c3426'; ctx.beginPath(); ctx.ellipse(x + .005 + turn * .004, y + .006, .0024, .0014, .2, 0, TAU); ctx.fill();
  ctx.restore();
}

function drawMouth(ctx, x, y, fx, seed) {
  const m = fx.mouth || 0, smile = fx.smile || 0, mw = fx.mouthW || .013;
  const y0 = y + m * .006;
  if (m > .15) {
    ctx.save(); ctx.fillStyle = '#5a2a23';
    ctx.beginPath(); ctx.moveTo(x - mw, y0); ctx.quadraticCurveTo(x, y0 + m * .026, x + mw, y0); ctx.quadraticCurveTo(x, y0 + m * .008, x - mw, y0); ctx.fill();
    ctx.globalAlpha = .4; ctx.fillStyle = '#c06b58'; ctx.beginPath(); ctx.ellipse(x, y0 + m * .014, mw * .5, m * .008, 0, 0, TAU); ctx.fill(); ctx.restore();
    inkL(ctx, [[x - mw, y0], [x, y0 - .001], [x + mw, y0]], .0032, '#3a241d', seed, .85);
  } else {
    const lift = smile * .005;
    inkL(ctx, [[x - mw, y0 + lift * .3], [x - mw * .25, y0 + .002 + lift], [x + mw * .25, y0 + .002 + lift], [x + mw, y0 + lift * .3]], .0034, '#3a241d', seed, .9);
    if (smile > .25) {
      ctx.save(); ctx.globalAlpha = .25; ctx.fillStyle = '#b56b58'; ctx.beginPath(); ctx.ellipse(x, y0 + .007 + lift, mw * .45, .0022, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
  }
  inkL(ctx, [[x - mw * .35, y0 + .011], [x, y0 + .0125], [x + mw * .35, y0 + .011]], .0018, '#a06a4e', seed + 1, .35);
}

function drawHead(ctx, t, opt, C, fx, S, boil) {
  const turn = opt.turn || 0, headTilt = opt.pose?.headTilt || 0;
  const hw = C.headW * (1 - Math.abs(turn) * .06), hh = C.headH;
  ctx.save(); ctx.translate(0, -.861); ctx.rotate(headTilt * .55 + (opt.headRot || 0));
  drawHair(ctx, opt.who, hw, hh, turn, boil, S, C, 'back');
  // skull / jaw silhouette
  const shape = new Path2D();
  shape.moveTo(-hw * 1.02, -hh * .2);
  shape.bezierCurveTo(-hw * 1.06, -hh * .78, -hw * .55, -hh * 1.04, 0, -hh * 1.03);
  shape.bezierCurveTo(hw * .6, -hh * 1.02, hw * 1.05, -hh * .72, hw * 1.02, -hh * .12);
  shape.bezierCurveTo(hw * .98, hh * .32, hw * .62, hh * .78, hw * .18, hh * .94);
  shape.bezierCurveTo(-hw * .2, hh * 1.02, -hw * .66, hh * .72, -hw * .88, hh * .38);
  shape.bezierCurveTo(-hw * 1.02, hh * .18, -hw * 1.04, -hh * .02, -hw * 1.02, -hh * .2);
  paintShape(ctx, shape, { color: C.skin, gy0: -hh, gy1: hh, texA: .08, ink: null, seed: S + 1 });
  // face shading
  ctx.save(); ctx.clip(shape);
  const sh = ctx.createLinearGradient(hw * .5, -hh * .4, hw * .2, hh);
  sh.addColorStop(0, 'rgba(70,35,25,0)'); sh.addColorStop(1, 'rgba(70,35,25,.28)');
  ctx.fillStyle = sh; ctx.fillRect(-hw * 1.2, -hh * 1.1, hw * 2.4, hh * 2.2);
  // forehead light
  const lg = ctx.createRadialGradient(-hw * .3, -hh * .5, 0, -hw * .3, -hh * .5, hh * .8);
  lg.addColorStop(0, 'rgba(255,230,195,.28)'); lg.addColorStop(1, 'rgba(255,230,195,0)');
  ctx.fillStyle = lg; ctx.fillRect(-hw * 1.2, -hh * 1.1, hw * 2.4, hh * 2.2);
  ctx.restore();
  // ear (far side)
  const earX = (turn >= 0 ? -hw * .98 : hw * .98);
  paintShape(ctx, ellipsePath(earX, hh * .05, hw * .17, hh * .25), { color: C.skinShade, ink: null, seed: S + 2 });
  inkL(ctx, [[earX - hw * .05, hh * -.05], [earX + hw * .02, hh * .06], [earX - hw * .02, hh * .16]], .0022, '#7a4a34', S + 3, .5);
  // features
  const fxo = turn * hw * .2, eyeY = -hh * .045, eyeRX = hw * .27, eyeRY = hh * .10;
  const ex1 = -hw * .38 + fxo, ex2 = hw * .34 + fxo;
  drawEye(ctx, ex1, eyeY, eyeRX * (1 - Math.max(0, turn) * .25), eyeRY, fx, -1, turn, S + 10);
  drawEye(ctx, ex2, eyeY, eyeRX * (1 - Math.max(0, -turn) * .25), eyeRY, fx, 1, turn, S + 12);
  drawNose(ctx, fxo * 1.1, hh * .2, turn);
  drawMouth(ctx, fxo * 1.05, hh * .5, fx, S + 20);
  drawBrow(ctx, ex1, eyeY - eyeRY * 1.5, eyeRX * 1.15, fx, -1, S + 30);
  drawBrow(ctx, ex2, eyeY - eyeRY * 1.5, eyeRX * 1.15, fx, 1, S + 31);
  if ((fx.blush || 0) > .04) {
    ctx.save(); ctx.globalAlpha = .1 + fx.blush * .3; ctx.fillStyle = '#a84e3a';
    ctx.beginPath(); ctx.ellipse(-hw * .5, hh * .3, hw * .18, hh * .08, -.2, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hw * .5, hh * .3, hw * .16, hh * .07, .2, 0, TAU); ctx.fill(); ctx.restore();
  }
  if ((fx.tear || 0) > .06) {
    ctx.save(); ctx.globalAlpha = clamp(fx.tear, 0, 1) * .75;
    const tx = ex1 + eyeRX * .1, ty = eyeY + eyeRY * 1.1;
    const tg = ctx.createLinearGradient(tx, ty, tx, ty + hh * .9); tg.addColorStop(0, 'rgba(220,240,238,.75)'); tg.addColorStop(1, 'rgba(160,210,215,0)');
    ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(tx, ty + hh * .4, .003, hh * .42, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  // scar (Chen)
  if (opt.who === 'chen') inkL(ctx, [[hw * .42, -hh * .88], [hw * .55, -hh * .55], [hw * .48, -hh * .3]], .0026, '#8b5444', S + 40, .65);
  // hair (front)
  drawHair(ctx, opt.who, hw, hh, turn, boil, S, C, 'front');
  // rim light
  if ((opt.light?.rim || 0) > .01) {
    ctx.save(); ctx.globalAlpha = opt.light.rim * .38; ctx.strokeStyle = opt.light.color || '#ffe2b0'; ctx.lineWidth = .005; ctx.filter = 'blur(1.2px)';
    ctx.beginPath(); ctx.moveTo(-hw * .95, hh * .25); ctx.quadraticCurveTo(-hw * 1.05, -hh * .5, -hw * .4, -hh * 1.0); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}

function drawHair(ctx, who, hw, hh, turn, boil, S, C, layer = 'front') {
  const sway = Math.sin(boil * .5) * .0018 + (turn * .002);
  if (who === 'mu') {
    if (layer === 'back') {
    // back mass
    const back = new Path2D();
    back.moveTo(-hw * 1.08, -hh * .55);
    back.bezierCurveTo(-hw * 1.2, -hh * 1.15, hw * .2, -hh * 1.3, hw * 1.05, -hh * .62);
    back.bezierCurveTo(hw * 1.18, -hh * .1, hw * 1.1, hh * .7, hw * .95, hh * 1.12);
    back.bezierCurveTo(hw * .75, hh * 1.3, hw * .4, hh * 1.1, hw * .25, hh * .95);
    back.lineTo(-hw * .8, hh * .95);
    back.bezierCurveTo(-hw * 1.05, hh * .65, -hw * 1.1, hh * .05, -hw * 1.08, -hh * .55);
    paintShape(ctx, back, { color: C.hair, gy0: -hh * 1.2, gy1: hh * 1.2, texA: .22, ink: '#171110', inkW: .0032, seed: S + 50 });
    // loose side locks behind the face
    inkStroke(ctx, [[-hw * 1.04, -hh * .38], [-hw * 1.14 + sway, hh * .22], [-hw * 1.02, hh * .72]], { w: .005, color: C.hair, seed: S + 56, taper: .5, alpha: .9 });
    inkStroke(ctx, [[hw * 1.04, -hh * .34], [hw * 1.10 + sway, hh * .24], [hw * 1.0, hh * .7]], { w: .004, color: C.hair, seed: S + 57, taper: .5, alpha: .85 });
    return;
    }
    // fringe: three separate locks, leaving forehead visible
    const locks = [
      [[-hw * 1.02, -hh * .52], [-hw * .9, -hh * 1.05], [-hw * .2, -hh * 1.18], [hw * .1, -hh * 1.02], [-hw * .12, -hh * .40], [-hw * .55, -hh * .46]],
      [[-hw * .35, -hh * 1.08], [hw * .35, -hh * 1.16], [hw * .8, -hh * .92], [hw * .52, -hh * .42], [hw * .08, -hh * .58]],
      [[hw * .38, -hh * 1.06], [hw * .95, -hh * .85], [hw * 1.02, -hh * .38], [hw * .78, -hh * .46], [hw * .66, -hh * .85]]
    ];
    locks.forEach((pts, i) => {
      const P = pts.map((q, j) => [q[0] + (j % 2 ? sway : 0), q[1]]);
      paintShape(ctx, smoothPath(P, true), { color: i === 1 ? C.hairLight : C.hair, gy0: -hh * 1.2, gy1: -hh * .5, texA: .25, ink: '#171110', inkW: .0028, seed: S + 52 + i });
    });
  } else {
    if (layer === 'back') {
      paintShape(ctx, ellipsePath(0, -hh * .35, hw * .92, hh * .55), { color: shadeColor(C.hair, -8), gy0: -hh * 1.1, gy1: -hh * .1, ink: null, seed: S + 59 });
      return;
    }
    const crop = new Path2D();
    crop.moveTo(-hw * 1.02, -hh * .4);
    crop.bezierCurveTo(-hw * 1.05, -hh * 1.0, -hw * .4, -hh * 1.16, hw * .1, -hh * 1.12);
    crop.bezierCurveTo(hw * .7, -hh * 1.08, hw * 1.04, -hh * .72, hw * 1.0, -hh * .25);
    crop.bezierCurveTo(hw * .75, -hh * .45, hw * .5, -hh * .55, hw * .1, -hh * .62);
    crop.bezierCurveTo(-hw * .35, -hh * .66, -hw * .75, -hh * .55, -hw * 1.02, -hh * .4);
    paintShape(ctx, crop, { color: C.hair, gy0: -hh * 1.2, gy1: -hh * .2, texA: .2, ink: '#12100f', inkW: .0032, seed: S + 60 });
    // a few upright strands
    for (let i = 0; i < 3; i++) inkStroke(ctx, [[-hw * .6 + i * hw * .45, -hh * 1.0], [-hw * .55 + i * hw * .45 + sway, -hh * 1.12]], { w: .0035, color: C.hair, seed: S + 62 + i, taper: .6, alpha: .8 });
    // stubble
    ctx.save(); ctx.globalAlpha = .18; ctx.strokeStyle = C.hair; ctx.lineWidth = .0012;
    for (let i = 0; i < 14; i++) { const a = -hh * .35 + i * hh * .045; ctx.beginPath(); ctx.moveTo(-hw * .95, a); ctx.lineTo(-hw * .78, a + .002); ctx.stroke(); }
    ctx.restore();
  }
}

function drawHand(ctx, x, y, r, side, pose = {}, seed, boil) {
  const curl = pose.curl == null ? .3 : pose.curl;
  const spread = pose.spread == null ? .9 : pose.spread;
  ctx.save(); ctx.translate(x, y); ctx.rotate(pose.rot || 0);
  // palm
  paintShape(ctx, ellipsePath(0, 0, r * .65, r * .5, side * .2), { color: PAL.skin, gy0: -r, gy1: r, texA: .05, ink: '#3a241c', inkW: .0024, seed: seed + 1 });
  for (let i = 0; i < 3; i++) {
    const a = (-.7 + i * .5) * spread;
    const len = r * (1.0 - Math.abs(i - 1) * .1);
    const bx = Math.cos(a) * r * .55 * side, by = Math.sin(a) * r * .22 - r * .1;
    const ex = bx + Math.cos(a) * len * .6 * side, ey = by + Math.sin(a + curl * 1.1) * len * .55;
    inkStroke(ctx, [[bx, by], [ex, ey]], { w: r * .2, color: PAL.skinShade, seed: seed + 10 + i, taper: .35, alpha: .85, bristle: false, jitter: .1 });
  }
  inkStroke(ctx, [[-side * r * .05, r * .08], [side * r * .5, r * .28], [side * r * .65, r * .52]], { w: r * .2, color: PAL.skinShade, seed: seed + 20, taper: .35, alpha: .8, bristle: false, jitter: .1 });
  ctx.restore();
}

function drawPerson(ctx, t, opt = {}) {
  const who = opt.who || 'mu';
  const C = Object.assign({}, CHARS[who], opt.look || {});
  const h = opt.h || 700, px = opt.x || 0, py = opt.y || 0;
  const flip = opt.flip || 1, rot = opt.rot || 0, turn = opt.turn || 0;
  const pose = opt.pose || {};
  const fx = opt.face || facePreset(opt.expression || 'neutral', opt.faceExtra || {});
  const seed = (opt.seed || 1) | 0;
  const boil = Math.floor(t * 12), S = seed * 997 + boil * 131;
  const wind = opt.wind || 0;

  ctx.save(); ctx.translate(px, py); ctx.scale(flip * h, h); ctx.rotate(rot);

  const pelvis = { x: 0, y: -.497 + (pose.crouch || 0) * .07 };
  const lean = pose.lean || 0;
  const chest = { x: Math.sin(lean) * -.205, y: pelvis.y - Math.cos(lean) * .205 };
  const neckB = { x: chest.x + Math.sin(lean * .65) * -.062, y: chest.y - .062 };
  const headC = { x: neckB.x + Math.sin((lean + (pose.headTilt || 0)) * .5) * -.045, y: neckB.y - .045 };
  const shL = { x: chest.x - C.shoulder * Math.cos(lean), y: chest.y - C.shoulder * Math.sin(lean) };
  const shR = { x: chest.x + C.shoulder * Math.cos(lean), y: chest.y + C.shoulder * Math.sin(lean) };
  const hipL = { x: pelvis.x - C.hip, y: pelvis.y + .012 }, hipR = { x: pelvis.x + C.hip, y: pelvis.y + .012 };
  const hL = pose.handL || [shL.x - .025, shL.y + .33], hR = pose.handR || [shR.x + .025, shR.y + .33];
  const fL = pose.footL || [pelvis.x - .062, 0], fR = pose.footR || [pelvis.x + .062, 0];
  const armL = ik2(shL.x, shL.y + .01, hL[0], hL[1], C.l1, C.l2, -1);
  const armR = ik2(shR.x, shR.y + .01, hR[0], hR[1], C.l1, C.l2, 1);
  const legL = ik2(hipL.x, hipL.y, fL[0], fL[1], C.thigh, C.shin, -1);
  const legR = ik2(hipR.x, hipR.y, fR[0], fR[1], C.thigh, C.shin, 1);
  const inkC = '#2a1e19';

  // back hair
  ctx.save(); ctx.translate(headC.x, headC.y - .861 + .861); // headC already includes vertical offset
  // head is drawn later at local (0,-.861); back hair mass is part of head function, so skip here
  ctx.restore();

  const drawLeg = (hp, leg, ft, near, side) => {
    const col = near ? C.trouser : shadeColor(C.trouser, -18);
    paintShape(ctx, capsulePath(hp.x, hp.y, leg.x, leg.y, .044, .035, 10), { color: col, gy0: leg.y, gy1: hp.y, texA: .16, ink: null, seed: S + 70 + side });
    paintShape(ctx, capsulePath(leg.x, leg.y, leg.tx, leg.ty, .034, .026, 10), { color: col, gy0: leg.ty, gy1: leg.y, texA: .16, ink: null, seed: S + 72 + side });
    // boot
    const bx = leg.tx, by = leg.ty, bw = .036, bh = .055;
    const boot = new Path2D();
    boot.moveTo(bx - bw, by - .005); boot.lineTo(bx + bw * .85, by - .005); boot.quadraticCurveTo(bx + bw * 1.25, by + .01, bx + bw * 1.05, by + bh * .8);
    boot.lineTo(bx - bw * .95, by + bh * .85); boot.quadraticCurveTo(bx - bw * 1.2, by + .02, bx - bw, by - .005);
    paintShape(ctx, boot, { color: C.boot, gy0: by + bh, gy1: by, ink: inkC, inkW: .0032, seed: S + 74 + side });
    inkL(ctx, [[hp.x, hp.y], [leg.x, leg.y], [leg.tx, leg.ty - .005]], .0045, inkC, S + 76 + side, .7);
  };
  drawLeg(hipL, legL, fL, false, -1);

  const drawArm = (sh, arm, hp, near, side) => {
    const col = near ? C.coat : C.coatDark;
    paintShape(ctx, capsulePath(sh.x, sh.y + .012, arm.x, arm.y, .040, .030, 10), { color: col, gy0: arm.y, gy1: sh.y, texA: .2, ink: null, seed: S + 80 + side });
    paintShape(ctx, capsulePath(arm.x, arm.y, arm.tx, arm.ty, .030, .022, 10), { color: near ? C.coat : C.coatDark, gy0: arm.ty, gy1: arm.y, texA: .2, ink: null, seed: S + 82 + side });
    // cuff
    inkL(ctx, [[arm.tx - .022, arm.ty - .001], [arm.tx + .022, arm.ty - .004]], .003, inkC, S + 84 + side, .55);
    drawHand(ctx, arm.tx, arm.ty, .031, side, pose['hand' + (side < 0 ? 'L' : 'R') + 'Pose'] || {}, S + 90 + side, boil);
    inkL(ctx, [[sh.x, sh.y + .01], [arm.x, arm.y], [arm.tx, arm.ty]], .0048, inkC, S + 86 + side, .75);
  };
  drawArm(shL, armL, hL, false, -1);

  // coat / torso silhouette
  const hem = who === 'mu' ? -.255 : -.335;
  const sway = Math.sin(t * 1.6 + seed) * .008 + wind * .035;
  const body = new Path2D();
  body.moveTo(shL.x - .012, shL.y - .008);
  body.quadraticCurveTo(chest.x - .082, chest.y + .03, chest.x - .064, chest.y + .095);
  body.quadraticCurveTo(pelvis.x - .058, pelvis.y - .07, pelvis.x - .076 + sway, hem);
  body.quadraticCurveTo(pelvis.x - .02, hem + .035, pelvis.x + .02, hem + .02);
  body.quadraticCurveTo(pelvis.x + .066, hem + .005, pelvis.x + .080 + sway, hem - .01);
  body.quadraticCurveTo(pelvis.x + .072, pelvis.y - .08, chest.x + .070, chest.y + .095);
  body.quadraticCurveTo(chest.x + .088, chest.y + .03, shR.x + .010, shR.y - .008);
  body.quadraticCurveTo(chest.x + .04, chest.y - .03, chest.x, chest.y - .035);
  body.quadraticCurveTo(chest.x - .04, chest.y - .03, shL.x - .012, shL.y - .008);
  paintShape(ctx, body, { color: C.coat, gy0: hem, gy1: chest.y - .02, texA: .24, ink: inkC, inkW: .0036, seed: S + 100 });
  // shirt opening
  const shirt = new Path2D();
  shirt.moveTo(chest.x - .030, chest.y - .02);
  shirt.quadraticCurveTo(chest.x, chest.y + .035, chest.x + .032, chest.y - .015);
  shirt.lineTo(pelvis.x + .022, pelvis.y + .02);
  shirt.quadraticCurveTo(pelvis.x, pelvis.y + .035, pelvis.x - .025, pelvis.y + .018);
  shirt.closePath();
  paintShape(ctx, shirt, { color: C.shirt, gy0: pelvis.y, gy1: chest.y, texA: .1, ink: null, seed: S + 102 });
  // lapels
  const lapelL = [[shL.x + .004, shL.y + .008], [chest.x - .045, chest.y + .05], [chest.x - .026, chest.y + .062], [chest.x - .014, chest.y + .018]];
  const lapelR = [[shR.x - .004, shR.y + .008], [chest.x + .047, chest.y + .05], [chest.x + .028, chest.y + .062], [chest.x + .016, chest.y + .018]];
  paintShape(ctx, polyPath(lapelL), { color: C.coatLight, gy0: chest.y, gy1: shL.y, ink: inkC, inkW: .0028, seed: S + 104 });
  paintShape(ctx, polyPath(lapelR), { color: C.coatLight, gy0: chest.y, gy1: shR.y, ink: inkC, inkW: .0028, seed: S + 105 });
  // folds
  for (let i = 0; i < 4; i++) {
    const fx0 = pelvis.x - .07 + i * .045;
    inkL(ctx, [[fx0, chest.y + .11], [fx0 + .005, chest.y + .2], [fx0 - .003 + sway, hem + .02]], .0022, shadeColor(C.coatDark, -10), S + 110 + i, .45);
  }
  // belt / harness
  if (who === 'chen') {
    inkL(ctx, [[pelvis.x - .085, pelvis.y - .05], [pelvis.x, pelvis.y - .035], [pelvis.x + .085, pelvis.y - .05]], .005, '#2a2420', S + 120, .7);
    paintShape(ctx, roundRectPath(chest.x - .02, chest.y + .105, .04, .032, .007), { color: '#2b2520', ink: '#17120f', inkW: .0018, seed: S + 121 });
    glow(ctx, chest.x, chest.y + .121, .025, '#d34a2e', .8);
    // shoulder strap
    inkL(ctx, [[shL.x + .01, shL.y + .015], [chest.x - .03, chest.y + .11], [pelvis.x - .045, pelvis.y - .03]], .006, '#332821', S + 122, .55);
  } else {
    // apron ties
    inkL(ctx, [[pelvis.x - .065, pelvis.y - .06], [pelvis.x, pelvis.y - .045], [pelvis.x + .065, pelvis.y - .06]], .004, C.scarfDark, S + 124, .6);
  }

  drawLeg(hipR, legR, fR, true, 1);
  drawArm(shR, armR, hR, true, 1);

  // neck
  paintShape(ctx, capsulePath(neckB.x, neckB.y + .015, headC.x, headC.y + .045, .023, .027, 8), { color: C.skinShade, gy0: headC.y, gy1: neckB.y + .02, texA: .06, ink: null, seed: S + 130 });
  inkL(ctx, [[neckB.x - .022, neckB.y + .01], [neckB.x, neckB.y + .03], [neckB.x + .022, neckB.y + .008]], .0022, '#7a4a34', S + 131, .4);

  // head: translate to head center; drawHead uses local (0,-.861) inside
  // scarf
  const sy = neckB.y - .020;
  if (who === 'mu') {
    const scarf = new Path2D();
    scarf.moveTo(neckB.x - .050, sy - .006); scarf.quadraticCurveTo(neckB.x, sy - .020, neckB.x + .050, sy - .010);
    scarf.quadraticCurveTo(neckB.x + .043, sy + .022, neckB.x + .010, sy + .026);
    scarf.quadraticCurveTo(neckB.x - .038, sy + .024, neckB.x - .050, sy - .006);
    paintShape(ctx, scarf, { color: C.scarf, gy0: sy, gy1: sy + .06, ink: inkC, inkW: .003, seed: S + 140 });
    for (let k = 0; k < 2; k++) {
      const bx = neckB.x - .010 + k * .020, by = sy + .018;
      const ex = bx - .022 - k * .012 + wind * .045, ey = by + .095 + Math.sin(t * 1.5 + k * 2) * .009;
      const pts = [[bx, by], [bx - .018, by + .05], [ex - .014, ey - .02], [ex, ey], [ex + .014, ey - .024], [bx + .014, by + .048]];
      paintShape(ctx, smoothPath(pts, true), { color: k ? C.scarfDark : C.scarf, gy0: ey, gy1: by, ink: inkC, inkW: .0022, seed: S + 142 + k });
    }
  } else {
    const collar = new Path2D();
    collar.moveTo(neckB.x - .07, sy - .005); collar.quadraticCurveTo(neckB.x, sy + .028, neckB.x + .07, sy - .01);
    collar.quadraticCurveTo(neckB.x + .055, sy + .035, neckB.x + .01, sy + .05); collar.quadraticCurveTo(neckB.x - .05, sy + .045, neckB.x - .07, sy - .005);
    paintShape(ctx, collar, { color: C.shirt, gy0: sy, gy1: sy + .055, ink: inkC, inkW: .0032, seed: S + 144 });
  }


  ctx.save(); ctx.translate(headC.x, headC.y + .861); drawHead(ctx, t, { ...opt, who, turn }, C, fx, S, boil); ctx.restore();


  // rim light along silhouette
  if ((opt.light?.rim || 0) > .01) {
    ctx.save(); ctx.globalAlpha = opt.light.rim * .32; ctx.strokeStyle = opt.light.color || '#ffe2b0'; ctx.lineWidth = .006; ctx.filter = 'blur(1.4px)';
    ctx.beginPath(); ctx.moveTo(shL.x - .012, shL.y - .005); ctx.quadraticCurveTo(chest.x - .1, chest.y + .04, pelvis.x - .11 + sway, hem); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
