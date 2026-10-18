import puppeteer from 'puppeteer-core';
import path from 'node:path';
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser=await puppeteer.launch({executablePath:chrome,headless:true,args:['--no-sandbox','--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-gl=angle','--allow-file-access-from-files'],protocolTimeout:0});
const page=await browser.newPage();
await page.setViewport({width:1080,height:1920,deviceScaleFactor:1});
page.on('console',m=>console.log('PAGE:',m.text()));
await page.goto('file://'+path.resolve('tools/bench.html'),{waitUntil:'load'});
await page.waitForFunction('window.ready===true',{timeout:60000});
console.log('gpu:',await page.evaluate('window.gpuInfo()'));
// warmup
await page.evaluate('window.renderAt(0)');
for (const [name,fn,n] of [['brush', 'window.renderAt', 5],['canvas2d','window.renderCanvas2D',10]]){
  const t0=Date.now(); let bytes=0;
  for(let i=0;i<n;i++){const d=await page.evaluate(`${fn}(${i})`); bytes+=d.length;}
  const ms=(Date.now()-t0)/n; console.log(name, 'ms/frame', ms.toFixed(1), 'dataKB', (bytes/n/1024).toFixed(1));
}
await page.evaluate('window.renderAt(0)');
await page.screenshot({path:'tools/bench_brush.jpg',type:'jpeg',quality:90});
await browser.close();
