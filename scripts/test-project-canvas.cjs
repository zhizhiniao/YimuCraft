const {electron}=require('./test-app.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const close=require('./close-test-app.cjs');
const run=path.resolve('work/canvas-ui-'+Date.now());fs.mkdirSync(run,{recursive:true});
const source=path.join(run,'项目 source'),library=path.join(run,'isolated-library');
const image='E:/20261025未知君AI动画/Data/定稿资产/C01_抽象女性角色/C01_柔光半聚合_单正面_v08.png';
const yoga='E:/20261025未知君AI动画/Data/定稿资产/瑜伽开篇/01_客户定稿_人物与场景主参考.png';
for(const shot of ['K01_微观','K02_实验室'])fs.mkdirSync(path.join(source,shot),{recursive:true});
fs.copyFileSync(image,path.join(source,'K01_微观','参考 v01.png'));fs.copyFileSync(yoga,path.join(source,'K02_实验室','参考 v02.png'));
const env={...process.env,YIMU_DATA_DIR:library,YIMU_AE_CONNECTION_FILE:path.join(run,'ae-connection.json'),YIMU_PR_BRIDGE_DIR:path.join(run,'pr')};delete env.ELECTRON_RUN_AS_NODE;
let app,page;const report={run,checks:[],errors:[]};
async function launch(){app=await electron.launch({...(process.env.YIMU_TEST_EXE?{executablePath:process.env.YIMU_TEST_EXE,args:[]}:{args:['.']}),env});page=await app.firstWindow();page.on('pageerror',e=>report.errors.push(e.message));await page.locator('#canvasTab').waitFor();await page.locator('#canvasTab').click();}
const snapshot=()=>page.evaluate(async()=>{const list=await window.yimuCanvas.command('list');return window.yimuCanvas.command('refresh',list.active);});
(async()=>{try{
 await launch();await page.locator('#canvasPath').fill(source);await page.locator('#canvasLink').click();await page.waitForFunction(()=>document.querySelectorAll('.canvas-card').length===2);
 let state=await snapshot(),item=Object.values(state.items).find(i=>i.name==='参考 v01.png');report.checks.push('path association; 2 real image cards; no library import');
 await page.locator('#canvasShot').selectOption('K01');await page.waitForTimeout(400);
 let card=page.locator(`.canvas-card[data-id="${item.id}"]`);await card.click();await page.locator('#canvasSelection button').filter({hasText:'标为已确认'}).click();
 const before=(await snapshot()).items[item.id];const b=await card.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+100,b.y+b.height/2+65,{steps:12});await page.mouse.up();
 await page.waitForTimeout(550);const after=(await snapshot()).items[item.id];assert.ok(after.x>before.x+20,'card must move at zoom scale');assert.equal(after.status,'confirmed');report.checks.push('real pointer drag at zoom; confirmed state');
 const resize=await card.locator('.canvas-resize').boundingBox();await page.mouse.move(resize.x+resize.width/2,resize.y+resize.height/2);await page.mouse.down();await page.mouse.move(resize.x+resize.width/2+55,resize.y+resize.height/2+30,{steps:10});await page.mouse.up();await page.waitForTimeout(500);assert.ok((await snapshot()).items[item.id].width>after.width+10);report.checks.push('real pointer resize');
 await page.keyboard.press('Delete');await page.waitForFunction(()=>document.querySelectorAll('.canvas-card').length===0);assert.ok(fs.existsSync(path.join(source,'K01_微观','参考 v01.png')));
 await page.locator('#canvasRefresh').click();await page.waitForTimeout(300);assert.equal(await page.locator('.canvas-card').count(),0);report.checks.push('delete hides only; rescan does not resurrect');
 await page.locator('#canvasHistory').click();await page.getByRole('button',{name:'恢复',exact:true}).click();await page.getByRole('button',{name:'关闭',exact:true}).click();await card.waitFor();assert.equal((await snapshot()).items[item.id].status,'confirmed');report.checks.push('history restores state and position');
 fs.copyFileSync(yoga,path.join(source,'K01_微观','自动新图 v03.png'));await page.waitForFunction(()=>document.querySelectorAll('.canvas-card').length===2,{},{timeout:12000});report.checks.push('watcher adds new file without refresh');
 await card.dblclick();await page.locator('.canvas-preview-dialog img').waitFor();assert.ok(await page.locator('.canvas-preview-dialog img').evaluate(img=>img.complete&&img.naturalWidth>0));await page.getByRole('button',{name:'关闭',exact:true}).click();
 await page.screenshot({path:path.join(run,'fixture-canvas.png')});const saved=(await snapshot()).items[item.id];await close(app);app=null;
 await launch();await page.waitForSelector('.canvas-card');state=await snapshot();assert.equal(state.items[item.id].x,saved.x);assert.equal(state.items[item.id].width,saved.width);assert.equal(state.items[item.id].status,'confirmed');report.checks.push('process restart preserves layout and confirmation');
 // Real project read-only integration, in the isolated profile.
 await page.locator('#canvasPath').fill('E:\\20261025未知君AI动画');await page.locator('#canvasLink').click();await page.waitForFunction(()=>document.querySelector('#canvasCount').textContent.includes('项可见')&&document.querySelectorAll('.canvas-card').length>10,{},{timeout:30000});
 await page.locator('#canvasShot').selectOption('K01');await page.waitForFunction(()=>[...document.querySelectorAll('.canvas-card img')].filter(i=>i.complete&&i.naturalWidth>0).length>=30,{},{timeout:30000});await page.screenshot({path:path.join(run,'unknownjun-canvas.png')});const current=await snapshot();report.realProject={count:Object.keys(current.items).length,groups:Object.keys(current.groups),root:current.root};report.checks.push('actual Unknownjun project linked; at least 30 decoded thumbnails; no library import');
 assert.equal(report.errors.length,0);report.ok=true;
}catch(e){report.error=e.stack;process.exitCode=1;if(page)await page.screenshot({path:path.join(run,'failure.png')}).catch(()=>{});}
finally{if(app)await close(app).catch(()=>{});fs.writeFileSync(path.join(run,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}})();
