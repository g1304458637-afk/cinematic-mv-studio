/* render.mjs — deterministic frame renderer for the cinematic MV studio.
 * Usage:
 *   node render.mjs --section intro            render one section to renders/segments/<id>.mp4
 *   node render.mjs --all                      render all sections (skips completed)
 *   node render.mjs --still 12.5,30.0,...      dump PNG stills to previews/
 *   node render.mjs --frames 100:130           render a frame range (for tests)
 * Sections come from the project timeline; each renders independently so a
 * failure only costs one section. Resume: sections with a .done marker are skipped.
 */
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PROJ = path.join(ROOT, 'projects', 'jjlin-wish-and-sorrow');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FPS = 24, W = 1080, H = 1920;

const args = process.argv.slice(2);
const opt = {};
for (let i = 0; i < args.length; i += 2) opt[args[i].replace(/^--/, '')] = args[i + 1];

const tl = JSON.parse(fs.readFileSync(path.join(PROJ, 'storyboard', 'timeline.json'), 'utf8'));
const SECTIONS = tl.sections;

function segPath(id) { return path.join(PROJ, 'renders', 'segments', id + '.mp4'); }
function donePath(id) { return segPath(id) + '.done'; }
function log(...a) { console.log('[render]', ...a); }

async function launch() {
  const browser = await puppeteer.launch({
    executablePath: CHROME, headless: true, protocolTimeout: 0,
    args: ['--no-sandbox', '--disable-lcd-text', '--force-color-profile=srgb', '--hide-scrollbars',
      '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--use-gl=angle', '--allow-file-access-from-files',
      '--disable-dev-shm-usage']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  page.on('pageerror', e => log('PAGE ERROR:', e.message));
  page.on('console', m => { if (m.type() === 'error') log('CONSOLE ERROR:', m.text()); });
  await page.goto('file://' + path.join(PROJ, 'src', 'shots', 'studio.html'), { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', { timeout: 120000 });
  await page.evaluate('window.warm()');
  return { browser, page };
}

function startFfmpeg(out, crf, preset) {
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(FPS), '-i', 'pipe:0',
    '-c:v', 'libx264', '-preset', preset, '-crf', String(crf), '-pix_fmt', 'yuv420p',
    '-x264-params', 'keyint=48:min-keyint=24', '-movflags', '+faststart', out], { stdio: ['pipe', 'ignore', 'pipe'] });
  let err = '';
  ff.stderr.on('data', d => { err += d; });
  ff.on('error', e => log('ffmpeg spawn error', e));
  return { ff, err: () => err };
}

async function renderSection(page, sec, crf = 16, preset = 'medium') {
  const id = sec.id;
  fs.mkdirSync(path.dirname(segPath(id)), { recursive: true });
  const startF = Math.round(sec.start * FPS), endF = Math.round(sec.end * FPS);
  const n = endF - startF;
  const { ff } = startFfmpeg(segPath(id), crf, preset);
  let broken = false;
  ff.stdin.on('error', () => { broken = true; });
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    const t = (startF + i) / FPS;
    try {
      await page.evaluate(f => renderFrame(document.getElementById('c'), f), t);
      const buf = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: W, height: H }, optimize: false });
      if (broken || !ff.stdin.writable) throw new Error('ffmpeg pipe closed');
      ff.stdin.write(buf);
    } catch (e) {
      log(`ERROR at frame ${startF + i} (t=${t.toFixed(3)}):`, e.message);
      try { ff.stdin.end(); } catch {}
      ff.kill('SIGKILL');
      throw e;
    }
    if (i % 120 === 0) process.stdout.write(`  ${id} ${((i / n) * 100) | 0}%\r`);
  }
  ff.stdin.end();
  const code = await new Promise(res => ff.on('close', res));
  if (code !== 0) throw new Error('ffmpeg exited ' + code);
  fs.writeFileSync(donePath(id), `frames=${n} crf=${crf} at=${new Date().toISOString()}\n`);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  log(`done ${id}: ${n} frames, ${secs}s (${(n / secs).toFixed(1)} fps)`);
}

async function main() {
  const { browser, page } = await launch();
  try {
    if (opt.still) {
      const ts = opt.still.split(',').map(Number);
      const out = path.join(PROJ, 'previews');
      fs.mkdirSync(out, { recursive: true });
      for (const t of ts) {
        await page.evaluate(f => renderFrame(document.getElementById('c'), f), t);
        const p = path.join(out, `still_${t.toFixed(2).replace('.', '_')}.png`);
        await page.screenshot({ path: p, clip: { x: 0, y: 0, width: W, height: H } });
        log('still ->', p);
      }
    } else if (opt.frames) {
      const [a, b] = opt.frames.split(':').map(Number);
      const sec = { id: `frames_${a}_${b}`, start: a / FPS, end: b / FPS };
      await renderSection(page, sec, Number(opt.crf || 18), opt.preset || 'medium');
    } else {
      const list = opt.section ? SECTIONS.filter(s => s.id === opt.section) : SECTIONS;
      if (!list.length) throw new Error('no such section: ' + opt.section);
      for (const sec of list) {
        if (fs.existsSync(donePath(sec.id))) { log(`skip ${sec.id} (done)`); continue; }
        await renderSection(page, sec, Number(opt.crf || 16), opt.preset || 'medium');
      }
    }
  } finally { await browser.close(); }
}
main().catch(e => { console.error(e); process.exit(1); });
