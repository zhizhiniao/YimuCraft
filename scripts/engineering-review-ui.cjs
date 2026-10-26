const {electron}=require('./test-app.cjs'),close=require('./close-test-app.cjs');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=fs.mkdtempSync(path.resolve('work/review-ui-')),out=path.resolve('evidence/engineering-review-20261023-r1');
const mode=process.env.YIMU_TEST_EXE?'packaged':'source';
const report={root,mode,checks:[],sandbox:'test-app helper uses --no-sandbox on this host; production sandbox not validated'};
(async()=>{let app;try{
 const env={...process.env,YIMU_DATA_DIR:path.join(root,'db'),YIMU_AE_CONNECTION_FILE:path.join(root,'ae','connection.json'),YIMU_PR_BRIDGE_DIR:path.join(root,'pr'),YIMU_MODEL_DIR:path.join(process.env.APPDATA,'YimuCraft','models')};delete env.ELECTRON_RUN_AS_NODE;
 app=await electron.launch({...(process.env.YIMU_TEST_EXE?{executablePath:process.env.YIMU_TEST_EXE,args:[]}:{args:['.']}),cwd:process.cwd(),env});const page=await app.firstWindow();page.setDefaultTimeout(20000);
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('就绪'));
 const file=path.join(root,'harmless.hta');fs.writeFileSync(file,'inert fixture, never executed');
 const imported=await page.evaluate(file=>window.yimu.command('import',[file]),file);assert.equal(imported.count,1);
 const row=(await page.evaluate(()=>window.yimu.command('query',{}))).items[0];
 await app.evaluate(({shell,dialog})=>{global.reviewOpened=[];shell.openPath=async file=>{global.reviewOpened.push(file);return '';};global.reviewErrors=[];dialog.showErrorBox=(title,message)=>global.reviewErrors.push({title,message});});
 const rejected=await page.evaluate(async id=>{try{await window.yimu.command('open',id);return null;}catch(e){return e.message;}},row.id);
 assert.match(rejected,/不支持直接打开/);assert.deepEqual(await app.evaluate(()=>global.reviewOpened),[]);report.checks.push('real renderer IPC rejects HTA without calling OS shell');
 if(mode==='packaged'){
  const canvas=require('@napi-rs/canvas').createCanvas(32,32),ctx=canvas.getContext('2d');ctx.fillStyle='red';ctx.fillRect(0,0,32,32);const png=path.join(root,'red.png');fs.writeFileSync(png,canvas.toBuffer('image/png'));
  await page.evaluate(file=>window.yimu.command('import',[file]),png);
  const indexed=await page.evaluate(()=>window.yimu.command('aiIndex'));assert.equal(indexed.errors.length,0);
  const found=await page.evaluate(()=>window.yimu.command('aiSearch',{text:'红色'}));assert.equal(found.ids.length,1);report.checks.push('packaged native sharp and local Chinese-CLIP inference/search work through real IPC');
 }
 await app.evaluate(()=>{const {Worker}=process.getBuiltinModule('node:worker_threads'),old=Worker.prototype.postMessage;Worker.prototype.postMessage=function(...args){Worker.prototype.postMessage=old;this.terminate();};});
 const failure=await page.evaluate(async()=>{try{await window.yimu.command('query',{});return null;}catch(e){return e.message;}});
 assert.match(failure,/后台已停止/);
 const again=await page.evaluate(async()=>{try{await window.yimu.command('query',{});return null;}catch(e){return e.message;}});assert.match(again,/后台已停止/);
 report.checks.push('terminated real library worker rejects in-flight and subsequent renderer requests');report.errors=await app.evaluate(()=>global.reviewErrors);assert.equal(report.errors.length,1);
 report.passed=true;
 }catch(e){report.passed=false;report.error=e.stack;process.exitCode=1;}finally{await close(app);fs.writeFileSync(path.join(out,mode+'-ui.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
})().catch(e=>{console.error(e);process.exitCode=1;});
