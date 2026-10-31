// Associate a user-authorized project through the installed application's UI.
// No isolated library override: this intentionally saves only the new canvas.
const {electron}=require('./test-app.cjs');
const fs=require('fs'),path=require('path');
const close=require('./close-test-app.cjs');
const run=path.resolve('work/canvas-live-'+Date.now());fs.mkdirSync(run,{recursive:true});
const env={...process.env};for(const key of ['ELECTRON_RUN_AS_NODE','YIMU_DATA_DIR','YIMU_AE_CONNECTION_FILE','YIMU_PR_BRIDGE_DIR'])delete env[key];
let app;const report={run};
(async()=>{try{
 app=await electron.launch({executablePath:path.join(process.env.LOCALAPPDATA,'Programs/YimuCraft/YimuCraft.exe'),args:[],env});
 const page=await app.firstWindow();report.errors=[];page.on('pageerror',e=>report.errors.push(e.message));
 await page.locator('#canvasTab').click();
 await page.locator('#canvasPath').fill('E:\\20261025未知君AI动画');await page.locator('#canvasLink').click();
 await page.waitForFunction(()=>document.querySelectorAll('.canvas-card').length>100,null,{timeout:60000});
 await page.locator('#canvasShot').selectOption('K01');
 await page.waitForFunction(()=>[...document.querySelectorAll('.canvas-card img')].filter(i=>i.complete&&i.naturalWidth>0).length>=30,null,{timeout:60000});
 await page.screenshot({path:path.join(run,'project-canvas.png')});
 report.canvas=await page.evaluate(async()=>{const list=await window.yimuCanvas.command('list'),b=await window.yimuCanvas.command('refresh',list.active);return{id:b.id,root:b.root,count:Object.keys(b.items).length,groups:Object.keys(b.groups),confirmed:Object.values(b.items).filter(i=>i.status==='confirmed').length};});
 report.userData=await app.evaluate(({app})=>app.getPath('userData'));
 report.version=await app.evaluate(({app})=>app.getVersion());report.ok=report.errors.length===0;
}catch(e){report.error=e.stack;process.exitCode=1;}
finally{if(app)await close(app).catch(()=>{});fs.writeFileSync(path.join(run,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}})();
