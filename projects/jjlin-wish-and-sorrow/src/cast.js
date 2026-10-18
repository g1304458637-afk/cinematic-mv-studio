/* cast.js — original two-person graphic rig.
   Local space: feet at y=0, head near y=910, one unit ≈ body height / 1000.
   y grows upward inside the rig. Screen space stays y-down. */

const WHO = {
  mu: {
    skin: '#d7a784', skinShade: '#b78462', skinDeep: '#8d5e45',
    hair: '#1a1412', hairRim: '#4a3a34',
    coat: '#6a6750', coatDark: '#454335', coatLight: '#8c8870',
    shirt: '#eadcc4', pants: '#3c3832', boot: '#241f1c', sole: '#3a342e',
    scarf: '#c46234', scarfDark: '#8a3e22',
    lip: '#b26a62', eye: '#2c241e', blush: 'rgba(196,100,90,0.35)',
    shoulder: 1, hairLong: 1, headW: 72, headH: 84
  },
  chen: {
    skin: '#c48b64', skinShade: '#a06c4c', skinDeep: '#7a4e38',
    hair: '#12100e', hairRim: '#3a322c',
    coat: '#3c4550', coatDark: '#262c33', coatLight: '#5a6570',
    shirt: '#243038', pants: '#2a3036', boot: '#1a1816', sole: '#332e2a',
    scarf: '#7c3030', scarfDark: '#4c1c1c',
    lip: '#a15c54', eye: '#241c18', blush: 'rgba(180,90,80,0.28)',
    shoulder: 1.08, hairLong: 0, headW: 76, headH: 86
  }
};

const FACE = {
  calm:    { lid: 0.14, brow: 0.00, tilt: 0.00, mouth: 0.10, gazeX: 0, gazeY: 0.02, jaw: 0.00, tear: 0, blush: 0.25 },
  sad:     { lid: 0.46, brow: 0.85, tilt: -0.35, mouth: -0.50, gazeX: 0, gazeY: 0.40, jaw: 0.04, tear: 0.85, blush: 0.12 },
  soft:    { lid: 0.24, brow: -0.15, tilt: 0.25, mouth: 0.62, gazeX: 0.05, gazeY: 0.06, jaw: 0.05, tear: 0, blush: 0.7 },
  wonder:  { lid: 0.02, brow: -0.65, tilt: 0.15, mouth: 0.38, gazeX: 0, gazeY: -0.28, jaw: 0.28, tear: 0, blush: 0.35 },
  fear:    { lid: 0.04, brow: 0.15, tilt: 0.7, mouth: -0.18, gazeX: 0.25, gazeY: -0.06, jaw: 0.32, tear: 0, blush: 0.1 },
  anger:   { lid: 0.20, brow: -0.95, tilt: -0.75, mouth: -0.28, gazeX: 0, gazeY: 0.02, jaw: 0.10, tear: 0, blush: 0.15 },
  pain:    { lid: 0.58, brow: 0.95, tilt: -0.45, mouth: -0.62, gazeX: 0, gazeY: 0.22, jaw: 0.16, tear: 0.45, blush: 0.08 },
  resolve: { lid: 0.10, brow: -0.40, tilt: -0.15, mouth: 0.02, gazeX: 0, gazeY: 0, jaw: 0, tear: 0, blush: 0.12 },
  sleep:   { lid: 0.94, brow: 0.10, tilt: 0, mouth: 0.14, gazeX: 0, gazeY: 0.4, jaw: 0, tear: 0, blush: 0.2 },
  joy:     { lid: 0.30, brow: -0.25, tilt: 0.2, mouth: 0.85, gazeX: 0, gazeY: -0.04, jaw: 0.22, tear: 0.35, blush: 0.85 }
};

function faceOf(name, extra) {
  return Object.assign({}, FACE[name] || FACE.calm, extra || {});
}

/* Shared pose keys. y is up. */
const POSE = {
  stand: {
    lean: 0.02,
    lHip: [-56, 478], rHip: [56, 478],
    lKnee: [-64, 246], rKnee: [70, 242],
    lFoot: [-60, 6], rFoot: [74, 6],
    lSh: [-104, 768], rSh: [104, 768],
    lEl: [-136, 590], rEl: [132, 598],
    lHand: [-124, 418], rHand: [120, 424],
    neck: [0, 830], head: [2, 916], chest: [0, 690],
    hemL: [-86, 300], hemR: [88, 296]
  },
  walkL: {
    lean: 0.06,
    lHip: [-50, 486], rHip: [52, 470],
    lKnee: [-78, 268], rKnee: [36, 250],
    lFoot: [-128, 8], rFoot: [78, 28],
    lSh: [-100, 770], rSh: [108, 766],
    lEl: [-78, 610], rEl: [150, 575],
    lHand: [-70, 470], rHand: [156, 400],
    neck: [6, 832], head: [10, 916], chest: [6, 694],
    hemL: [-80, 310], hemR: [84, 300]
  },
  walkR: {
    lean: -0.02,
    lHip: [-52, 470], rHip: [50, 486],
    lKnee: [-30, 248], rKnee: [82, 270],
    lFoot: [-70, 30], rFoot: [132, 8],
    lSh: [-108, 766], rSh: [100, 770],
    lEl: [-150, 572], rEl: [78, 612],
    lHand: [-158, 398], rHand: [70, 472],
    neck: [-4, 832], head: [-2, 916], chest: [-2, 694],
    hemL: [-84, 300], hemR: [80, 312]
  },
  reach: {
    lean: -0.06,
    lHip: [-56, 476], rHip: [56, 476],
    lKnee: [-62, 244], rKnee: [68, 240],
    lFoot: [-58, 6], rFoot: [72, 6],
    lSh: [-100, 770], rSh: [96, 790],
    lEl: [-130, 600], rEl: [138, 930],
    lHand: [-118, 440], rHand: [108, 1060],
    neck: [-4, 834], head: [-8, 920], chest: [-2, 698],
    hemL: [-84, 302], hemR: [86, 298]
  },
  guard: {
    lean: 0.04,
    lHip: [-58, 474], rHip: [54, 474],
    lKnee: [-70, 240], rKnee: [62, 236],
    lFoot: [-66, 6], rFoot: [64, 6],
    lSh: [-108, 764], rSh: [106, 764],
    lEl: [-46, 690], rEl: [50, 700],
    lHand: [-18, 760], rHand: [28, 790],
    neck: [0, 826], head: [0, 912], chest: [2, 688],
    hemL: [-88, 298], hemR: [84, 294]
  },
  sit: {
    lean: 0.08,
    lHip: [-48, 268], rHip: [50, 268],
    lKnee: [-118, 150], rKnee: [122, 146],
    lFoot: [-86, 8], rFoot: [96, 8],
    lSh: [-96, 520], rSh: [100, 524],
    lEl: [-120, 390], rEl: [70, 430],
    lHand: [-80, 300], rHand: [36, 340],
    neck: [8, 600], head: [14, 688], chest: [8, 470],
    hemL: [-78, 210], hemR: [80, 206]
  },
  kneel: {
    lean: 0.22,
    lHip: [-24, 250], rHip: [30, 246],
    lKnee: [-58, 10], rKnee: [62, 12],
    lFoot: [-10, 8], rFoot: [108, 10],
    lSh: [-90, 500], rSh: [96, 496],
    lEl: [-40, 390], rEl: [48, 386],
    lHand: [-16, 300], rHand: [24, 296],
    neck: [18, 575], head: [26, 662], chest: [16, 450],
    hemL: [-70, 200], hemR: [74, 196]
  },
  offer: {
    lean: 0.1,
    lHip: [-56, 476], rHip: [56, 476],
    lKnee: [-64, 244], rKnee: [66, 240],
    lFoot: [-60, 6], rFoot: [70, 6],
    lSh: [-102, 766], rSh: [102, 770],
    lEl: [-40, 640], rEl: [46, 648],
    lHand: [-16, 560], rHand: [22, 566],
    neck: [4, 828], head: [6, 914], chest: [4, 692],
    hemL: [-86, 300], hemR: [86, 298]
  },
  clasp: {
    lean: 0.12,
    lHip: [-54, 470], rHip: [52, 470],
    lKnee: [-40, 230], rKnee: [48, 228],
    lFoot: [-36, 6], rFoot: [54, 6],
    lSh: [-100, 760], rSh: [98, 762],
    lEl: [10, 620], rEl: [36, 630],
    lHand: [46, 540], rHand: [62, 548],
    neck: [6, 824], head: [8, 910], chest: [4, 686],
    hemL: [-82, 296], hemR: [80, 292]
  },
  run: {
    lean: 0.28,
    lHip: [-40, 490], rHip: [36, 470],
    lKnee: [-90, 300], rKnee: [20, 240],
    lFoot: [-150, 20], rFoot: [70, 8],
    lSh: [-90, 780], rSh: [100, 770],
    lEl: [-40, 640], rEl: [150, 600],
    lHand: [-20, 520], rHand: [160, 460],
    neck: [28, 840], head: [40, 920], chest: [24, 710],
    hemL: [-70, 330], hemR: [70, 310]
  },
  shelter: {
    lean: 0.42,
    lHip: [-30, 300], rHip: [34, 296],
    lKnee: [-70, 12], rKnee: [78, 14],
    lFoot: [-20, 8], rFoot: [120, 10],
    lSh: [-100, 540], rSh: [104, 530],
    lEl: [-20, 430], rEl: [30, 420],
    lHand: [8, 330], rHand: [40, 324],
    neck: [36, 590], head: [48, 670], chest: [30, 470],
    hemL: [-78, 230], hemR: [82, 220]
  },
  lookUp: {
    lean: -0.12,
    lHip: [-56, 478], rHip: [56, 478],
    lKnee: [-62, 246], rKnee: [68, 242],
    lFoot: [-58, 6], rFoot: [72, 6],
    lSh: [-100, 780], rSh: [100, 784],
    lEl: [-70, 900], rEl: [80, 910],
    lHand: [-40, 1000], rHand: [50, 1010],
    neck: [-6, 840], head: [-10, 930], chest: [-4, 700],
    hemL: [-84, 304], hemR: [86, 300]
  }
};

function walkPose(phase) {
  const p = ((phase % 1) + 1) % 1;
  if (p < 0.5) return mixPt(POSE.walkL, POSE.walkR, p / 0.5);
  return mixPt(POSE.walkR, POSE.walkL, (p - 0.5) / 0.5);
}

function resolvePose(o) {
  let pose;
  if (o.walk != null) pose = walkPose(o.walk);
  else if (Array.isArray(o.pose)) pose = mixPt(POSE[o.pose[0]], POSE[o.pose[1]], o.pose[2]);
  else if (typeof o.pose === 'string') pose = POSE[o.pose];
  else pose = o.pose || POSE.stand;
  const br = Math.sin((o.t || 0) * 1.8 + (o.who === 'chen' ? 1.2 : 0)) * 5;
  const out = mixPt(pose, pose, 0);
  out.head = [out.head[0], out.head[1] + br * 0.45];
  out.chest = [out.chest[0], out.chest[1] + br];
  out.neck = [out.neck[0], out.neck[1] + br * 0.6];
  out.lSh = [out.lSh[0], out.lSh[1] + br * 0.7];
  out.rSh = [out.rSh[0], out.rSh[1] + br * 0.7];
  return out;
}

function blinkAmt(t, seed) {
  const period = 3.6 + (seed % 5) * 0.17;
  const p = (t * 1 + seed * 0.37) % period;
  if (p < 0.14) return Math.sin((p / 0.14) * Math.PI);
  return 0;
}

function sx(pt, sh) { return [pt[0] * sh, pt[1]]; }

function drawHuman(ctx, o) {
  const pal = WHO[o.who || 'mu'];
  const S = (o.h || 640) / 1000;
  const flip = o.flip || 1;
  const pose = resolvePose(o);
  const face = faceOf(o.face || 'calm', o.faceExtra);
  face.lid = clamp(face.lid + (o.blink === false ? 0 : blinkAmt(o.t || 0, o.who === 'chen' ? 2.2 : 0.4)), 0, 1);
  const sh = pal.shoulder;
  const wind = Math.sin((o.t || 0) * 1.6) * (o.wind == null ? 18 : o.wind);

  ctx.save();
  ctx.translate(o.x, o.y);
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  ctx.fillStyle = 'rgba(20,16,12,0.28)';
  ctx.beginPath();
  ctx.ellipse(0, 4, (o.h || 640) * 0.16, (o.h || 640) * 0.026, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.scale(flip * S, -S);

  const lSh = sx(pose.lSh, sh), rSh = sx(pose.rSh, sh);
  const lEl = sx(pose.lEl, sh), rEl = sx(pose.rEl, sh);
  const lHand = sx(pose.lHand, sh), rHand = sx(pose.rHand, sh);
  const hx = pose.head[0], hy = pose.head[1];

  if (pal.hairLong) {
    fillPoly(ctx, [
      [hx - 50, hy + 10], [hx + 54, hy],
      [hx + 42, pose.chest[1] - 30], [hx + 58 + wind * 0.15, pose.hemR[1] + 30],
      [hx + 20, pose.hemR[1] + 10], [hx - 36, pose.chest[1] - 10]
    ], pal.hair);
  }

  strokeLimb(ctx, pose.lHip, pose.lKnee, 34, pal.pants);
  strokeLimb(ctx, pose.lKnee, pose.lFoot, 28, pal.pants);
  strokeLimb(ctx, pose.rHip, pose.rKnee, 34, pal.pants);
  strokeLimb(ctx, pose.rKnee, pose.rFoot, 28, pal.pants);
  boot(ctx, pose.lFoot, pal);
  boot(ctx, pose.rFoot, pal);

  ctx.fillStyle = pal.coat;
  ctx.beginPath();
  ctx.moveTo(lSh[0], lSh[1]);
  ctx.lineTo(rSh[0], rSh[1]);
  ctx.lineTo(pose.hemR[0], pose.hemR[1]);
  ctx.lineTo(pose.hemL[0], pose.hemL[1]);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = pal.coatDark;
  ctx.beginPath();
  ctx.moveTo(pose.chest[0] + 4, lSh[1] - 4);
  ctx.lineTo(rSh[0] - 4, rSh[1] - 2);
  ctx.lineTo(pose.hemR[0] - 8, pose.hemR[1]);
  ctx.lineTo(pose.chest[0] + 4, pose.hemL[1]);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = pal.shirt;
  ctx.beginPath();
  ctx.moveTo(pose.neck[0] - 18, pose.neck[1] - 6);
  ctx.lineTo(pose.neck[0] + 18, pose.neck[1] - 4);
  ctx.lineTo(pose.chest[0], pose.chest[1] + 10);
  ctx.closePath();
  ctx.fill();

  scarf(ctx, pose, pal, wind);

  strokeLimb(ctx, lSh, lEl, 30, pal.coat);
  strokeLimb(ctx, lEl, lHand, 24, pal.coatLight);
  strokeLimb(ctx, rSh, rEl, 30, pal.coatDark);
  strokeLimb(ctx, rEl, rHand, 24, pal.coat);
  hand(ctx, lHand, pal, 16);
  hand(ctx, rHand, pal, 16);

  strokeLimb(ctx, [pose.neck[0], pose.neck[1] - 16], [hx, hy - pal.headH * 0.45], 26, pal.skinShade);

  ctx.fillStyle = pal.skinShade;
  ctx.beginPath();
  ctx.ellipse(hx + pal.headW * 0.78, hy - 4, 11, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.ellipse(hx, hy, pal.headW, pal.headH, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.skinShade;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.ellipse(hx + 16, hy - 24, pal.headW * 0.55, pal.headH * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  drawFace(ctx, hx, hy, pal, face);
  hairCap(ctx, hx, hy, pal, wind);
  ctx.restore();
}

function strokeLimb(ctx, a, b, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
}

function scarf(ctx, pose, pal, wind) {
  const x = pose.neck[0], y = pose.neck[1];
  ctx.fillStyle = pal.scarfDark;
  ctx.beginPath();
  ctx.ellipse(x, y - 8, 34, 16, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.scarf;
  ctx.beginPath();
  ctx.moveTo(x - 14, y - 16);
  ctx.quadraticCurveTo(x - 36 + wind * 0.25, y - 120, x - 8 + wind, y - 250);
  ctx.lineTo(x + 18 + wind, y - 242);
  ctx.quadraticCurveTo(x + 8, y - 110, x + 16, y - 12);
  ctx.closePath();
  ctx.fill();
}

function boot(ctx, foot, pal) {
  ctx.fillStyle = pal.boot;
  ctx.beginPath();
  ctx.ellipse(foot[0] + 6, foot[1] + 6, 28, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.sole;
  ctx.fillRect(foot[0] - 22, foot[1] - 2, 46, 6);
}

function hand(ctx, pt, pal, r) {
  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.ellipse(pt[0], pt[1], r, r * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = pal.skinShade;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.ellipse(pt[0] + 4, pt[1] - 3, r * 0.55, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawFace(ctx, hx, hy, pal, face) {
  ctx.save();
  ctx.translate(hx, hy);
  const eyeY = 6;
  const eyeDX = 27;
  eye(ctx, -eyeDX, eyeY, face, pal);
  eye(ctx, eyeDX, eyeY, face, pal);
  ctx.strokeStyle = pal.hair;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  brow(ctx, -eyeDX, eyeY + 24, face, 1);
  brow(ctx, eyeDX, eyeY + 24, face, -1);
  ctx.fillStyle = pal.skinDeep;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.ellipse(1, eyeY - 22, 5, 7, 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  const my = -34 - face.jaw * 6;
  const smile = face.mouth;
  if (smile > 0.4) {
    ctx.fillStyle = '#6d3834';
    ctx.beginPath();
    ctx.ellipse(0, my - 2, 12, 5 + smile * 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = pal.lip;
  ctx.lineWidth = 3.6;
  ctx.beginPath();
  ctx.moveTo(-16, my);
  ctx.quadraticCurveTo(0, my - smile * 18, 16, my);
  ctx.stroke();
  if (face.blush > 0.05) {
    ctx.fillStyle = pal.blush;
    ctx.globalAlpha = Math.min(0.55, 0.28 * face.blush);
    ctx.beginPath();
    ctx.ellipse(-36, -6, 13, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(36, -6, 13, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  if (face.tear > 0.2) {
    ctx.fillStyle = 'rgba(198,216,222,0.9)';
    ctx.beginPath();
    ctx.ellipse(eyeDX + 4, eyeY - 16 - face.tear * 8, 3, 7, 0.15, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function eye(ctx, x, y, face, pal) {
  const open = clamp(1 - face.lid, 0.08, 1);
  if (open < 0.18) {
    ctx.strokeStyle = pal.eye;
    ctx.lineWidth = 3.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.quadraticCurveTo(x, y - 4, x + 14, y + 1);
    ctx.stroke();
    return;
  }
  const ry = 11 * open;
  ctx.fillStyle = '#f6eee4';
  ctx.beginPath();
  ctx.ellipse(x, y, 15, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  const gx = x + face.gazeX * 4;
  const gy = y - face.gazeY * 3;
  ctx.fillStyle = pal.eye;
  ctx.beginPath();
  ctx.arc(gx, gy, 6.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#120e0c';
  ctx.beginPath();
  ctx.arc(gx, gy, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(gx + 2.6, gy + 2.4, 1.7, 0, Math.PI * 2);
  ctx.fill();
}

function brow(ctx, x, y, face, side) {
  const lift = -face.brow * 10;
  const tilt = face.tilt * 8 * side;
  ctx.beginPath();
  ctx.moveTo(x - 15, y + lift + tilt);
  ctx.quadraticCurveTo(x, y + lift + 3, x + 15, y + lift - tilt);
  ctx.stroke();
}

function hairCap(ctx, hx, hy, pal, wind) {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(hx, hy, pal.headW + 2, pal.headH + 2, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = pal.hair;
  ctx.fillRect(hx - pal.headW - 8, hy + 20, pal.headW * 2 + 16, pal.headH + 10);
  ctx.restore();
  if (pal.hairLong) {
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.moveTo(hx - pal.headW + 4, hy + 16);
    ctx.quadraticCurveTo(hx - pal.headW - 18, hy - 30, hx - 46 + wind * 0.15, hy - 150);
    ctx.quadraticCurveTo(hx - 24, hy - 40, hx - pal.headW + 24, hy + 18);
    ctx.fill();
  }
}

/* A readable origami crane in y-down screen space. */
function drawCrane(ctx, x, y, s, rot, color, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot + Math.sin((t || 0) * 1.3) * 0.08);
  ctx.scale(s, s);
  ctx.fillStyle = color || '#e6d7c4';
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(34, 6);
  ctx.lineTo(6, 8);
  ctx.lineTo(10, 36);
  ctx.lineTo(0, 16);
  ctx.lineTo(-8, 34);
  ctx.lineTo(-6, 8);
  ctx.lineTo(-36, 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(90,70,55,0.28)';
  ctx.beginPath();
  ctx.moveTo(0, -28);
  ctx.lineTo(6, 8);
  ctx.lineTo(0, 16);
  ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
