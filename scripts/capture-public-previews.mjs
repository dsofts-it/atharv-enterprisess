import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
await mkdir('docs/previews',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try {
  const page=await browser.newPage({reducedMotion:'reduce'});
  for(const width of [1440,390]) {
    await page.setViewportSize({width,height:width===390?844:1000});
    for(const [name,route] of [['home','/'],['portal','/portal']]) {
      await page.goto(`http://127.0.0.1:5173${route}`);
      await page.waitForSelector('h1');
      await page.evaluate(async()=>{
        await document.fonts.ready;
        await Promise.all(Array.from(document.images).map(image=>{
          image.loading='eager';
          return image.decode().catch(()=>{});
        }));
      });
      await page.screenshot({path:`docs/previews/${name}-${width}.png`,fullPage:true,animations:'disabled',timeout:60000});
      console.log(`Captured ${name} at ${width}px`);
    }
  }
} finally {
  await browser.close();
}
