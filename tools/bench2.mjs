import puppeteer from 'puppeteer-core'; import path from 'node:path'; import fs from 'node:fs';
const browser=await puppeteer.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox','--ignore-gpu-blocklist','--enable-gpu-rasterization','--use-gl=angle','--allow-file-access-from-files'],protocolTimeout:0});
const page=await browser.newPage(); await page.setViewport({width:1080,height:1920,deviceScaleFactor:1});
await page.goto('file://'+path.resolve('tools/bench.html'),{waitUntil:'load'}); await page.waitForFunction('window.ready===true',{timeout:60000});
for(const [name,fn] of [['brush','window.renderAt(2)'],['canvas','window.renderCanvas2D(2)']]){
 const d=await page.evaluate(fn); fs.writeFileSync(`tools/bench_${name}.jpg`, Buffer.from(d.split(',')[1],'base64'));
}
await browser.close();
