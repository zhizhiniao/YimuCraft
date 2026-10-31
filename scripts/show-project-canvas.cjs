const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.connectOverCDP('http://127.0.0.1:9349');
 const page=browser.contexts()[0].pages().find(p=>p.url().includes('/src/index.html'));
 if(!page)throw Error('Installed application page missing');
 await page.locator('#canvasTab').click();
 await page.waitForFunction(()=>document.querySelectorAll('.canvas-card').length>100,null,{timeout:60000});
 await page.locator('#canvasShot').selectOption('K01');
 await page.waitForFunction(()=>[...document.querySelectorAll('.canvas-card img')].filter(i=>i.complete&&i.naturalWidth>0).length>=30,null,{timeout:60000});
 await page.screenshot({path:'work/canvas-live-1793236489163/reopened-canvas.png'});
 console.log(JSON.stringify({url:page.url(),version:await page.locator('#appVersion').innerText(),path:await page.locator('#canvasPath').inputValue(),count:await page.locator('#canvasCount').innerText(),canvasVisible:await page.locator('#projectCanvas').isVisible()}));
 // The app was launched separately. Disconnect this diagnostic client only.
 process.exit(0);
})().catch(e=>{console.error(e.message);process.exit(1);});
