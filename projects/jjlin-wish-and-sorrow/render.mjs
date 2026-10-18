#!/usr/bin/env node
/* render.mjs — deterministic headless frame renderer with per-frame resume.
 * Usage:
 *   node render.mjs --start=0 --end=18 --out=pilot/frames --q=94
 *   node render.mjs --all --out=renders/frames
 *   node render.mjs --encode --frames=renders/frames --audio=assets/song.m4a --out=output/final.mp4
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import os from 'node:os';

const args = Object.fromEntries(process.argv.slice(2).filter(a=>a.startsWith('--')).map(a=>{
  const [k,...v]=a.replace(/^--/,'').split('='); return [k, v.length?v.join('='):true];
}));
const ROOT = process.cwd();
const CHROME = args.chrome || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FPS = Number(args.fps || 24);
const TOTAL = Math.ceil(232.595 * FPS);

function encode(){
  const frames = path.resolve(ROOT, args.frames || 'renders/frames');
  const audio = path.resolve(ROOT, args.audio || 'assets/song.m4a');
  const out = path.resolve(ROOT, args.out || 'output/final.mp4');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const ff = spawnSync('ffmpeg', ['-y','-hide_banner','-loglevel','error',
    '-framerate', String(FPS), '-i', path.join(frames,'f_%06d.jpg'),
    '-i', audio,
    '-c:v','libx264','-preset','slow','-crf', String(args.crf || 16),
    '-pix_fmt','yuv420p','-profile:v','high','-level','4.2',
    '-c:a','aac','-b:a','256k','-ar','44100',
    '-shortest','-movflags','+faststart', out], { stdio: 'inherit' });
  if (ff.status !== 0) process.exit(ff.status || 1);
  console.log('encoded', out);
}

async function main(){
  if (args.encode) { encode(); return; }
  const start = Number(args.start ?? 0);
  const end = Number(args.end ?? (args.all ? TOTAL / FPS : 18));
  const f0 = Math.round(start * FPS), f1 = Math.min(TOTAL, Math.round(end * FPS));
  const outDir = path.resolve(ROOT, args.out || 'renders/pilot');
  fs.mkdirSync(outDir, { recursive: true });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mvchrome-'));
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true, userDataDir: profile,
    args: ['--no-sandbox','--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-gl=angle','--allow-file-access-from-files','--disk-cache-size=1','--disable-application-cache'],
    protocolTimeout: 0
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('PAGEERROR', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('PAGE', m.text()); });
  await page.setCacheEnabled(false);
  await page.goto('file://' + path.resolve(ROOT, 'studio.html') + '?render=1&v=' + Date.now(), { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', { timeout: 120000 });
  console.log('page ready; rendering frames', f0, '..', f1 - 1);
  const t0 = Date.now();
  for (let f = f0; f < f1; f++) {
    const file = path.join(outDir, `f_${String(f).padStart(6,'0')}.jpg`);
    if (fs.existsSync(file) && fs.statSync(file).size > 12000) continue;
    const t = f / FPS;
    const data = await page.evaluate((tt) => window.renderAt(tt), t);
    const buf = Buffer.from(data.split(',')[1], 'base64');
    fs.writeFileSync(file + '.tmp', buf);
    fs.renameSync(file + '.tmp', file);
    if ((f - f0) % 50 === 0) {
      const el = (Date.now() - t0) / 1000;
      const done = f - f0 + 1, rate = done / Math.max(el, .001);
      console.log(`frame ${f}/${f1-1}  ${(el).toFixed(1)}s  ${rate.toFixed(1)} fps  eta ${((f1-f)/rate).toFixed(0)}s`);
    }
  }
  await browser.close();
  console.log('done', outDir);
}
main().catch(e => { console.error(e); process.exit(1); });
