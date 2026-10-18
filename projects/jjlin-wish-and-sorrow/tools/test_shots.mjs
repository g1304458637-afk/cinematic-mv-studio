import puppeteer from 'puppeteer-core'; import path from 'node:path'; import fs from 'node:fs'; import os from 'node:os';
const ROOT=process.env.PROJECT_ROOT||process.cwd();
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,userDataDir:fs.mkdtempSync(path.join(os.tmpdir(),'mvtest-')),args:['--no-sandbox','--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-gl=angle','--allow-file-access-from-files'],protocolTimeout:0});
const page=await browser.newPage(); await page.setViewport({width:1080,height:1920});
page.on('pageerror',e=>console.log('ERR',e.message)); page.on('console',m=>{if(m.type()==='error')console.log('CERR',m.text())});
await page.goto('file://'+path.resolve(ROOT,'studio.html')+'?render=1&v='+Date.now(),{waitUntil:'load'});
await page.waitForFunction('window.ready===true',{timeout:120000});
const specs=await page.evaluate(()=>SHOT_SPECS.map(s=>({id:s.id,a:s.a,b:s.b})));
fs.mkdirSync(path.join(ROOT,'previews/shot_tests'),{recursive:true});
for(const s of specs){
  const t=(s.a+s.b)/2;
  try{ const d=await page.evaluate(tt=>window.renderAt(tt),t); fs.writeFileSync(path.join(ROOT,'previews/shot_tests',`${s.id}.jpg`),Buffer.from(d.split(',')[1],'base64')); console.log('ok',s.id); }
  catch(e){ console.log('FAIL',s.id,e.message); }
}
await browser.close();
