import puppeteer from 'puppeteer-core'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os';
const ROOT=path.resolve('projects/jjlin-wish-and-sorrow');
const DIR=path.join(ROOT,'renders/frames'); const FPS=24; const TOTAL=5583;
const have=new Set(fs.readdirSync(DIR).filter(f=>/^f_\d{6}\.jpg$/.test(f)).map(f=>parseInt(f.slice(2,8))));
const missing=[]; for(let i=0;i<TOTAL;i++) if(!have.has(i)) missing.push(i);
console.log('missing',missing.length,missing.slice(0,12));
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'mvfill-'));
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,userDataDir:profile,args:['--no-sandbox','--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-gl=angle','--allow-file-access-from-files','--disk-cache-size=1','--disable-application-cache'],protocolTimeout:0});
const page=await browser.newPage(); await page.setViewport({width:1080,height:1920});
page.on('pageerror',e=>console.log('ERR',e.message));
await page.goto('file://'+path.join(ROOT,'studio.html')+'?render=1&v='+Date.now(),{waitUntil:'load'});
await page.waitForFunction('window.ready===true',{timeout:120000});
let done=0, t0=Date.now();
for(const f of missing){
  const file=path.join(DIR,`f_${String(f).padStart(6,'0')}.jpg`);
  for(let attempt=0;attempt<2;attempt++){
    try{
      const d=await page.evaluate(t=>window.renderAt(t),f/FPS);
      const buf=Buffer.from(d.split(',')[1],'base64');
      if(buf.length<5000) throw new Error('tiny '+buf.length);
      fs.writeFileSync(file+'.tmp',buf); fs.renameSync(file+'.tmp',file); break;
    }catch(e){ if(attempt===1) console.log('FAIL',f,e.message); else console.log('retry',f,e.message); }
  }
  done++; if(done%20===0){const el=(Date.now()-t0)/1000; console.log('done',done,'/',missing.length,'fps',(done/el).toFixed(1));}
}
await browser.close(); console.log('filled',done);
