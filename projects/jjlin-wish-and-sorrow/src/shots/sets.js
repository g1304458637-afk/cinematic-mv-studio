/* sets.js — cached painterly background sets. Built once, reused per frame. */
'use strict';
const OV = 1.15; // overscan factor for camera moves
const BW = Math.round(W * OV), BH = Math.round(H * OV);
const SETCACHE = {};
function getSet(key, fn) { if (!SETCACHE[key]) SETCACHE[key] = fn(); return SETCACHE[key]; }

function skyGrad(x, stops) {
  const g = x.createLinearGradient(0, 0, 0, BH);
  for (const [p, c] of stops) g.addColorStop(p, c);
  return g;
}
function cloudBands(x, t_seed, col = '210,200,185', a = .16, rows = 90) {
  for (let i = 0; i < rows; i++) {
    const y = (i / rows) * BH, f = fbm(i * .12, t_seed, 3, 4);
    const alpha = Math.max(0, f - .42) * a * 3.2;
    if (alpha < .01) continue;
    x.fillStyle = `rgba(${col},${alpha})`;
    x.beginPath();
    for (let px = 0; px <= BW; px += 24) {
      const n = fbm(px * .0016, i * .1 + t_seed * .7, 3, 4);
      const yy = y + (n - .5) * 46;
      px ? x.lineTo(px, yy) : x.moveTo(px, yy);
    }
    x.lineTo(BW, y + 60); x.lineTo(0, y + 60); x.closePath(); x.fill();
  }
}
function starField(x, n = 130, seed = 5) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const sx = r() * BW, sy = r() * BH * .55, s = r() * 2.2 + .4;
    x.fillStyle = `rgba(235,238,240,${.15 + r() * .5})`;
    x.beginPath(); x.arc(sx, sy, s, 0, TAU); x.fill();
  }
}
function ridgeLine(x, baseY, amp, seed, col, y2 = BH) {
  x.fillStyle = col;
  x.beginPath(); x.moveTo(0, y2);
  for (let px = 0; px <= BW; px += 14) {
    const n = fbm(px * .0011, seed, 4, 5);
    x.lineTo(px, baseY - n * amp);
  }
  x.lineTo(BW, y2); x.closePath(); x.fill();
}
function ashDunes(x, baseY, amp, seed, col) {
  x.fillStyle = col; x.beginPath(); x.moveTo(0, BH);
  for (let px = 0; px <= BW; px += 10) {
    const n = fbm(px * .0016 + 40, seed, 3, 4) + .3 * Math.sin(px * .004 + seed);
    x.lineTo(px, baseY + n * amp);
  }
  x.lineTo(BW, BH); x.closePath(); x.fill();
}
function deadPylon(x, bx, by, s, seed) {
  x.save();
  x.save(); x.translate(bx, by); x.scale(s, s);
  x.strokeStyle = '#2e2a26'; x.lineWidth = 16; x.lineCap = 'butt';
  x.beginPath(); x.moveTo(-30, 0); x.lineTo(-8, -220); x.lineTo(6, -236); x.stroke();
  x.lineWidth = 10; x.beginPath(); x.moveTo(-6, -150); x.lineTo(60, -190); x.stroke();
  x.lineWidth = 7; x.beginPath(); x.moveTo(50, -186); x.lineTo(96, -150); x.stroke();
  x.restore();
}
function glassDome(x, cx, cy, rx, ry, tod) {
  const pal = { dusk: ['rgba(200,140,90,.16)', 'rgba(240,190,120,.30)'], night: ['rgba(120,150,160,.10)', 'rgba(150,190,200,.20)'], storm: ['rgba(90,100,110,.14)', 'rgba(140,160,170,.22)'], day: ['rgba(200,210,190,.12)', 'rgba(230,235,215,.24)'] }[tod] || ['rgba(200,200,200,.12)', 'rgba(230,230,220,.24)'];
  x.save();
  const g = x.createRadialGradient(cx, cy - ry * .3, 10, cx, cy, ry * 1.2);
  g.addColorStop(0, pal[1]); g.addColorStop(1, pal[0]);
  x.fillStyle = g;
  x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); x.lineTo(cx + rx, cy + ry * .3); x.lineTo(cx - rx, cy + ry * .3); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(40,45,50,.5)'; x.lineWidth = 5;
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI + (i / 10) * Math.PI;
    x.beginPath(); x.moveTo(cx, cy + ry * .3);
    x.quadraticCurveTo(cx + Math.cos(a) * rx * .5, cy + Math.sin(a) * ry * .5 - ry * .1, cx + Math.cos(a) * rx, cy + Math.sin(a) * ry * .4); x.stroke();
  }
  for (let i = 1; i <= 3; i++) {
    x.beginPath(); x.ellipse(cx, cy + ry * .3, rx * (i / 3.4), ry * (i / 3.4) * .72, 0, Math.PI, 0); x.stroke();
  }
  x.restore();
}
/* ---------- set builders ---------- */
// S01/S31/S33: the ash sea, cliff and the far dome
function setAshSea() {
  const { c, x } = mkCanvas(BW, BH);
  x.fillStyle = skyGrad(x, [[0, '#333b44'], [.4, '#4c545c'], [.72, '#5d5a52'], [1, '#6b6459']]);
  x.fillRect(0, 0, BW, BH);
  cloudBands(x, 2.2, '190,185,175', .10, 70);
  // distant ridge
  ridgeLine(x, BH * .58, 120, 6, '#4a4a46', BH);
  // ash sea dunes (3 layers)
  ashDunes(x, BH * .66, 90, 1, '#57524b');
  ashDunes(x, BH * .78, 120, 2, '#47433e');
  ashDunes(x, BH * .92, 150, 3, '#36322f');
  // dead pylons
  deadPylon(x, BW * .18, BH * .80, 1.1, 1);
  deadPylon(x, BW * .83, BH * .86, 1.4, 2);
  // the far dome: a tiny green heartbeat
  const dx = BW * .70, dy = BH * .615;
  x.save();
  x.globalAlpha = .8;
  glassDome(x, dx, dy, 54, 34, 'night');
  const gp = .6 + .4 * Math.sin(1.7);
  x.fillStyle = `rgba(140,190,110,${.35 * gp})`;
  x.beginPath(); x.ellipse(dx, dy + 6, 34, 18, 0, Math.PI, 0); x.fill();
  x.restore();
  // foreground ash drift streaks
  for (let i = 0; i < 40; i++) {
    const y = hash2(31, i) * BH, w = 60 + hash2(32, i) * 300;
    x.fillStyle = `rgba(90,86,78,${.05 + hash2(33, i) * .08})`;
    x.fillRect(hash2(34, i) * BW, y, w, 6 + hash2(35, i) * 16);
  }
  return { c, x };
}
// S02/S07/S34/S37/S38: night ark sky (ark drawn per-frame)
function setArkSky() {
  const { c, x } = mkCanvas(BW, BH);
  x.fillStyle = skyGrad(x, [[0, '#141a20'], [.5, '#1d242c'], [.85, '#2a2f33']]);
  x.fillRect(0, 0, BW, BH);
  starField(x, 150, 5);
  cloudBands(x, 7.5, '140,150,160', .13, 60);
  ashDunes(x, BH * .9, 130, 9, '#23262a');
  return { c, x };
}
// S09-S12/S17/S22/S23/S33: the dome on the cliff, from outside
function setDomeExt(tod = 'dusk') {
  const { c, x } = mkCanvas(BW, BH);
  const tops = { dusk: [[0, '#2e2a26'], [.5, '#4a3c30'], [.8, '#6b4f36']], night: [[0, '#101318'], [.6, '#181d24']], storm: [[0, '#12151a'], [.6, '#1c222a'], [1, '#232a31']], day: [[0, '#3d434c'], [.6, '#5a5c58'], [1, '#767164']] }[tod];
  x.fillStyle = skyGrad(x, tops); x.fillRect(0, 0, BW, BH);
  if (tod === 'dusk') { cloudBands(x, 3.3, '220,160,110', .12, 46); starField(x, 40, 8); }
  if (tod === 'storm') cloudBands(x, 1.1, '60,66,74', .22, 70);
  // far ridge
  ridgeLine(x, BH * .52, 100, 12, tod === 'day' ? '#4c5048' : '#2b2b2c', BH);
  // cliff the dome sits on
  x.fillStyle = '#26221f';
  x.beginPath(); x.moveTo(0, BH);
  x.lineTo(0, BH * .72);
  for (let px = 0; px <= BW; px += 16) x.lineTo(px, BH * .72 + fbm(px * .004, 21, 3) * 60);
  x.lineTo(BW, BH); x.closePath(); x.fill();
  // dead trees on the cliff
  for (const [tx, ts] of [[BW * .12, 1.0], [BW * .88, 1.25], [BW * .55, .7]]) {
    x.save(); x.translate(tx, BH * .76); x.scale(ts, ts);
    x.strokeStyle = '#1e1a17'; x.lineWidth = 9; x.lineCap = 'round';
    x.beginPath(); x.moveTo(0, 0); x.lineTo(-6, -90); x.stroke();
    x.lineWidth = 5;
    x.beginPath(); x.moveTo(-5, -50); x.lineTo(-38, -84); x.moveTo(-5, -64); x.lineTo(28, -100); x.moveTo(-6, -30); x.lineTo(34, -56); x.stroke();
    x.restore();
  }
  // the dome
  const cx = BW * .5, cy = BH * .70, rx = BW * .30, ry = BH * .155;
  glassDome(x, cx, cy, rx, ry, tod === 'day' ? 'day' : tod);
  // interior glow + seedling silhouette
  const gp = .5 + .5 * Math.sin(1.7);
  x.save();
  const ig = x.createRadialGradient(cx, cy, 4, cx, cy, ry * .9);
  ig.addColorStop(0, `rgba(150,200,120,${.34 * gp})`); ig.addColorStop(1, 'rgba(150,200,120,0)');
  x.fillStyle = ig; x.beginPath(); x.ellipse(cx, cy, rx * .8, ry * .7, 0, Math.PI, 0); x.fill();
  x.fillStyle = 'rgba(30,40,26,.5)';
  x.beginPath(); x.ellipse(cx, cy + 6, rx * .18, ry * .4, 0, Math.PI, 0); x.fill();
  x.restore();
  return { c, x };
}
// S04-S08/S13-S21/S26-S30: the orchard interior
function setOrchardInt(tod = 'day') {
  const { c, x } = mkCanvas(BW, BH);
  const tops = { day: [[0, '#4a463c'], [.6, '#5c574a'], [1, '#413d35']], dusk: [[0, '#39301f'], [.55, '#4d3a22'], [1, '#2e2719']], night: [[0, '#14181f'], [.6, '#1a1f26']], storm: [[0, '#161a1f'], [.6, '#1e242b']] }[tod];
  x.fillStyle = skyGrad(x, tops); x.fillRect(0, 0, BW, BH);
  // back window wall: the ash world outside
  const wx0 = BW * .06, wy0 = BH * .10, ww = BW * .88, wh = BH * .58;
  x.save();
  x.beginPath(); x.rect(wx0, wy0, ww, wh); x.clip();
  const outTops = { day: [[0, '#6a6a60'], [1, '#8a8272']], dusk: [[0, '#4a3423'], [1, '#7a5230']], night: [[0, '#12161c'], [1, '#20262e']], storm: [[0, '#14181e'], [1, '#242c34']] }[tod];
  x.fillStyle = skyGrad(x, outTops); x.fillRect(wx0, wy0, ww, wh);
  ridgeLine(x, wy0 + wh * .5, 60, 4, tod === 'day' ? '#5c5c52' : '#2c2c2e', wy0 + wh);
  ashDunes(x, wy0 + wh * .78, 50, 8, tod === 'day' ? '#6e675a' : '#26262a');
  // mullions
  x.strokeStyle = 'rgba(25,22,20,.85)'; x.lineWidth = 10;
  for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(wx0 + (ww * i) / 6, wy0); x.lineTo(wx0 + (ww * i) / 6, wy0 + wh); x.stroke(); }
  x.beginPath(); x.moveTo(wx0, wy0 + wh * .45); x.lineTo(wx0 + ww, wy0 + wh * .45); x.stroke();
  x.restore();
  x.strokeStyle = '#241d1a'; x.lineWidth = 12; x.strokeRect(wx0, wy0, ww, wh);
  // dome ribs overhead
  x.save(); x.strokeStyle = 'rgba(30,26,22,.8)'; x.lineWidth = 9;
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    x.beginPath(); x.moveTo(BW * .5, BH * .68);
    x.quadraticCurveTo(BW * .5 + Math.cos(a) * BW * .42, BH * .68 + Math.sin(a) * BH * .2 - BH * .06, BW * .5 + Math.cos(a) * BW * .48, BH * .68 + Math.sin(a) * BH * .14); x.stroke();
  }
  x.restore();
  // floor
  x.fillStyle = '#3a332b'; x.fillRect(0, BH * .70, BW, BH * .3);
  for (let i = 0; i < 26; i++) {
    x.fillStyle = `rgba(20,17,14,${.12 + hash2(41, i) * .12})`;
    x.fillRect(0, BH * .70 + i * 26, BW, 3);
  }
  // shelf with pots (right)
  x.fillStyle = '#2e2822'; x.fillRect(BW * .78, BH * .60, BW * .2, 16);
  for (let i = 0; i < 5; i++) {
    const px = BW * .795 + i * BW * .037;
    x.fillStyle = '#57493c'; x.beginPath();
    x.moveTo(px - 22, BH * .60); x.lineTo(px + 22, BH * .60); x.lineTo(px + 15, BH * .60 - 44); x.lineTo(px - 15, BH * .60 - 44); x.closePath(); x.fill();
    x.fillStyle = '#3a332b'; x.fillRect(px - 24, BH * .60 - 50, 48, 8);
  }
  // chalk tally wall (left-center)
  x.fillStyle = 'rgba(228,220,200,.055)'; x.fillRect(BW * .30, BH * .30, BW * .16, BH * .34);
  x.strokeStyle = 'rgba(235,228,210,.5)'; x.lineWidth = 4;
  for (let r = 0; r < 4; r++) for (let i = 0; i < 30; i++) {
    const gx = BW * .31 + i * (BW * .14 / 30), gy = BH * .33 + r * (BH * .075);
    x.beginPath(); x.moveTo(gx - 5, gy + 6); x.lineTo(gx + 5, gy - 6); x.stroke();
  }
  // photo frame (two children + crane), slightly ajar
  x.save(); x.translate(BW * .135, BH * .24); x.rotate(-.05);
  x.fillStyle = '#5a4632'; x.fillRect(-52, -40, 104, 80);
  x.fillStyle = '#d6c9af'; x.fillRect(-46, -34, 92, 68);
  x.fillStyle = '#8a7a5c';
  x.beginPath(); x.arc(-18, 6, 12, 0, TAU); x.arc(20, 6, 12, 0, TAU); x.fill();
  x.fillRect(-30, 16, 24, 18); x.fillRect(8, 16, 24, 18);
  x.strokeStyle = '#6b5a40'; x.lineWidth = 3;
  x.beginPath(); x.moveTo(-4, -18); x.lineTo(4, -12); x.lineTo(2, -4); x.lineTo(8, 0); x.moveTo(2, -4); x.lineTo(-2, 2); x.stroke();
  x.restore();
  // ladder (far left)
  x.save(); x.translate(BW * .075, BH * .70); x.rotate(.04);
  x.strokeStyle = '#4a3c2c'; x.lineWidth = 10;
  x.beginPath(); x.moveTo(-26, 0); x.lineTo(-40, -BH * .42); x.moveTo(26, 0); x.lineTo(12, -BH * .42); x.stroke();
  x.lineWidth = 8;
  for (let i = 0; i < 8; i++) { const y = -i * BH * .055; x.beginPath(); x.moveTo(-26 + i * 1.75, y); x.lineTo(26 - i * 1.75, y); x.stroke(); }
  x.restore();
  // door frame (right, to outside)
  x.fillStyle = '#1c1815'; x.fillRect(BW * .60, BH * .34, BW * .16, BH * .36);
  x.strokeStyle = '#2e2822'; x.lineWidth = 10; x.strokeRect(BW * .60, BH * .34, BW * .16, BH * .36);
  if (tod === 'night' || tod === 'storm') {
    // red countdown light from console near door
    glow(x, BW * .66, BH * .60, 90, '#d34a2e', .22 + .12 * Math.sin(1.7));
  }
  return { c, x };
}
// S03: macro windowsill
function setMacroSill() {
  const { c, x } = mkCanvas(BW, BH);
  x.fillStyle = skyGrad(x, [[0, '#3a3f45'], [.5, '#4c4a44'], [1, '#37332e']]);
  x.fillRect(0, 0, BW, BH);
  // bokeh world outside (soft blobs)
  const r = rng(17);
  for (let i = 0; i < 26; i++) {
    const bx = r() * BW, by = r() * BH * .7, br = 30 + r() * 120;
    const g = x.createRadialGradient(bx, by, 0, bx, by, br);
    g.addColorStop(0, `rgba(${160 + r() * 60 | 0},${150 + r() * 50 | 0},${130 + r() * 40 | 0},.16)`);
    g.addColorStop(1, 'rgba(160,150,130,0)');
    x.fillStyle = g; x.beginPath(); x.arc(bx, by, br, 0, TAU); x.fill();
  }
  // sill wood
  x.fillStyle = '#4a3826'; x.fillRect(0, BH * .68, BW, BH * .32);
  for (let i = 0; i < 30; i++) {
    x.strokeStyle = `rgba(20,14,8,${.1 + hash2(51, i) * .18})`; x.lineWidth = 2 + hash2(52, i) * 4;
    x.beginPath(); x.moveTo(0, BH * .68 + i * 26);
    x.bezierCurveTo(BW * .3, BH * .68 + i * 26 - 8, BW * .7, BH * .68 + i * 26 + 8, BW, BH * .68 + i * 26 - 4); x.stroke();
  }
  x.fillStyle = 'rgba(20,16,12,.35)'; x.fillRect(0, BH * .68, BW, 12);
  // condensation drops on glass
  const r2 = rng(23);
  for (let i = 0; i < 34; i++) {
    const dx = r2() * BW, dy = r2() * BH * .66, dr = 3 + r2() * 12;
    x.fillStyle = `rgba(210,225,225,${.08 + r2() * .14})`;
    x.beginPath(); x.arc(dx, dy, dr, 0, TAU); x.fill();
  }
  return { c, x };
}
// S32: pod interior
function setPodInt() {
  const { c, x } = mkCanvas(BW, BH);
  x.fillStyle = skyGrad(x, [[0, '#101318'], [.6, '#1a2129'], [1, '#222a31']]);
  x.fillRect(0, 0, BW, BH);
  // curved hull ribs
  x.save(); x.strokeStyle = 'rgba(70,78,86,.55)'; x.lineWidth = 8;
  for (let i = 0; i < 7; i++) {
    x.beginPath(); x.moveTo(-40, BH * (.06 + i * .15));
    x.quadraticCurveTo(BW * .5, BH * (.02 + i * .15) - 40, BW + 40, BH * (.06 + i * .15)); x.stroke();
  }
  x.restore();
  // round window with the storm/orchard below
  const wcx = BW * .5, wcy = BH * .40, wr = BW * .26;
  x.save();
  x.beginPath(); x.arc(wcx, wcy, wr, 0, TAU); x.clip();
  const g = x.createRadialGradient(wcx, wcy - wr * .4, 10, wcx, wcy, wr);
  g.addColorStop(0, '#2c3a42'); g.addColorStop(.6, '#1d262c'); g.addColorStop(1, '#10151a');
  x.fillStyle = g; x.fillRect(wcx - wr, wcy - wr, wr * 2, wr * 2);
  ridgeLine(x, wcy + wr * .2, 40, 3, '#141a1e', wcy + wr);
  glow(x, wcx, wcy + wr * .55, wr * .5, '#7fa05a', .25);
  x.restore();
  x.strokeStyle = '#3a444c'; x.lineWidth = 14; x.beginPath(); x.arc(wcx, wcy, wr, 0, TAU); x.stroke();
  x.strokeStyle = 'rgba(30,36,42,.8)'; x.lineWidth = 6;
  x.beginPath(); x.moveTo(wcx - wr, wcy); x.lineTo(wcx + wr, wcy); x.moveTo(wcx, wcy - wr); x.lineTo(wcx, wcy + wr); x.stroke();
  // console with red light (left)
  x.fillStyle = '#232a31'; x.fillRect(BW * .04, BH * .62, BW * .26, BH * .1);
  glow(x, BW * .17, BH * .665, 70, '#d34a2e', .3 + .15 * Math.sin(1.7));
  // seat (right foreground)
  x.fillStyle = '#2b333b';
  x.beginPath(); x.moveTo(BW * .82, BH); x.quadraticCurveTo(BW * .9, BH * .8, BW * .72, BH * .72); x.lineTo(BW * .98, BH * .66); x.lineTo(BW, BH); x.closePath(); x.fill();
  return { c, x };
}
// finale valley: dead -> tree -> green -> grove -> years
function setValley(stage = 'dead') {
  const { c, x } = mkCanvas(BW, BH);
  const tops = { dead: [[0, '#1a2026'], [.55, '#232a31'], [1, '#2c333a']], tree: [[0, '#141a20'], [.6, '#1d242c']], green: [[0, '#232d2a'], [.5, '#2e3a30'], [1, '#3a4432']], grove: [[0, '#2a3430'], [.55, '#374237'], [1, '#46523a']], years: [[0, '#3a4440'], [.5, '#4a5344'], [1, '#5a5c46']] }[stage];
  x.fillStyle = skyGrad(x, tops); x.fillRect(0, 0, BW, BH);
  if (stage === 'tree' || stage === 'green') cloudBands(x, 2.2, '170,180,185', .10, 46);
  ridgeLine(x, BH * .56, 110, 6, stage === 'dead' ? '#20242a' : '#2a3029', BH);
  if (stage === 'dead') {
    ashDunes(x, BH * .74, 110, 1, '#2a2c2e');
    ashDunes(x, BH * .9, 140, 2, '#1f2123');
    deadPylon(x, BW * .16, BH * .88, 1.2, 1);
  } else {
    const gy = BH * .78;
    x.fillStyle = stage === 'dead' ? '#2a2c2e' : stage === 'green' ? '#4c5c38' : '#55603e';
    x.fillRect(0, gy, BW, BH - gy);
    ashDunes(x, gy + 30, 60, 1, stage === 'green' ? '#5c6c40' : '#60684a');
    if (stage === 'green' || stage === 'grove' || stage === 'years') {
      // green spread wave
      const wg = x.createLinearGradient(0, gy - 40, 0, gy + 160);
      wg.addColorStop(0, 'rgba(127,160,90,0)'); wg.addColorStop(1, 'rgba(127,160,90,.5)');
      x.fillStyle = wg; x.fillRect(0, gy - 40, BW, 200);
    }
    if (stage === 'tree' || stage === 'green') {
      // the big tree (center) + glass ring at roots
      const tx = BW * .5, ty = BH * .80;
      x.save();
      x.fillStyle = 'rgba(190,215,235,.13)';
      x.beginPath(); x.ellipse(tx, ty + 8, BW * .30, BH * .035, 0, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(200,220,230,.35)'; x.lineWidth = 4;
      for (let i = 0; i < 22; i++) {
        const a = i / 22 * TAU;
        x.beginPath(); x.moveTo(tx + Math.cos(a) * BW * .16, ty + Math.sin(a) * BH * .018);
        x.lineTo(tx + Math.cos(a) * BW * .30, ty + Math.sin(a) * BH * .034); x.stroke();
      }
      x.restore();
      // canopy silhouette
      x.save(); x.translate(tx, ty);
      x.fillStyle = 'rgba(24,34,24,.92)';
      x.beginPath(); x.ellipse(0, -BH * .20, BW * .20, BH * .13, 0, 0, TAU); x.fill();
      x.beginPath(); x.ellipse(-BW * .10, -BH * .15, BW * .10, BH * .07, 0, 0, TAU); x.fill();
      x.beginPath(); x.ellipse(BW * .11, -BH * .16, BW * .11, BH * .07, 0, 0, TAU); x.fill();
      // trunk
      x.fillStyle = '#33291f';
      x.beginPath(); x.moveTo(-24, 0); x.quadraticCurveTo(-12, -BH * .12, -8, -BH * .18); x.lineTo(10, -BH * .18); x.quadraticCurveTo(14, -BH * .10, 26, 0); x.closePath(); x.fill();
      x.restore();
    }
    if (stage === 'grove' || stage === 'years') {
      // rows of young trees
      const r = rng(31);
      for (let i = 0; i < 26; i++) {
        const tx = r() * BW, ty = BH * .78 + r() * BH * .14, ts = .3 + r() * .5;
        x.save(); x.translate(tx, ty); x.scale(ts, ts);
        x.fillStyle = 'rgba(24,34,24,.9)';
        x.beginPath(); x.ellipse(0, -60, 40, 34, 0, 0, TAU); x.fill();
        x.fillRect(-4, -50, 8, 54);
        if (stage === 'years') { x.fillStyle = 'rgba(238,190,200,.5)'; x.beginPath(); x.arc(0, -84, 10, 0, TAU); x.fill(); }
        x.restore();
      }
    }
    if (stage === 'years') {
      // the ark has become a hill
      x.save(); x.translate(BW * .78, BH * .74);
      x.fillStyle = '#3a4034';
      x.beginPath(); x.ellipse(0, 0, BW * .17, BH * .05, 0, Math.PI, 0); x.fill();
      x.fillStyle = '#46513e';
      x.beginPath(); x.ellipse(0, -8, BW * .13, BH * .035, 0, Math.PI, 0); x.fill();
      x.restore();
    } else if (stage === 'green' || stage === 'grove') {
      // the landed ark, distant
      x.save(); x.translate(BW * .80, BH * .70); x.scale(.34, .34);
      x.fillStyle = '#39424a';
      x.beginPath(); x.ellipse(0, 0, 260, 46, 0, Math.PI, 0); x.fill();
      x.fillStyle = 'rgba(240,196,119,.5)';
      for (let i = 0; i < 9; i++) x.fillRect(-200 + i * 48, 6, 16, 9);
      x.restore();
    }
  }
  return { c, x };
}
// S45: the pool
function setPool() {
  const { c, x } = mkCanvas(BW, BH);
  x.fillStyle = skyGrad(x, [[0, '#22303a'], [.4, '#2c424e'], [1, '#1d2c33']]);
  x.fillRect(0, 0, BW, BH);
  // water sheen
  const r = rng(41);
  for (let i = 0; i < 60; i++) {
    const y = BH * .05 + r() * BH * .85, w = 40 + r() * 300;
    x.fillStyle = `rgba(200,225,230,${.02 + r() * .05})`;
    x.fillRect(r() * BW - w / 2, y, w, 2 + r() * 4);
  }
  return { c, x };
}
/* SETS_END */
