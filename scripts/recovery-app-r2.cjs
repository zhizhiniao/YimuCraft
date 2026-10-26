const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{DatabaseSync}=require('node:sqlite');
const {electron}=require('./test-app.cjs'),close=require('./close-test-app.cjs');
const out=path.resolve('evidence/recovery-20261023-r2'),root=fs.mkdtempSync(path.resolve('work/recovery-app-')),profile=path.join(process.env.APPDATA,'YimuCraft');
function fingerprint(file){const db=new DatabaseSync(file,{readOnly:true});try{return {version:db.prepare('pragma user_version').get().user_version,count:db.prepare('select count(*) n from assets').get().n,assets:crypto.createHash('sha256').update(JSON.stringify(db.prepare('select * from assets order by id').all())).digest('hex'),integrity:db.prepare('pragma integrity_check').get().integrity_check};}finally{db.close();}}
const backup=path.join(out,'user-before.sqlite');
if(!fs.existsSync(backup)){const db=new DatabaseSync(path.join(profile,'library/library.sqlite'),{readOnly:true});db.prepare('VACUUM INTO ?').run(backup);db.close();fs.copyFileSync(path.join(profile,'preferences.json'),path.join(out,'preferences-before.json'));fs.writeFileSync(path.join(out,'user-before.json'),JSON.stringify(fingerprint(backup),null,2));}
const mode=process.env.RECOVERY_MODE||'built',report={mode,root,checks:[],sandbox:'Playwright helper uses --no-sandbox; not production sandbox validation'};
(async()=>{let app;try{const dbdir=path.join(root,'db');fs.mkdirSync(dbdir);fs.copyFileSync(backup,path.join(dbdir,'library.sqlite'));
 const env={...process.env,YIMU_DATA_DIR:dbdir,YIMU_AE_CONNECTION_FILE:path.join(root,'ae.json'),YIMU_PR_BRIDGE_DIR:path.join(root,'pr')};delete env.ELECTRON_RUN_AS_NODE;
 const exe=mode==='installed'?path.join(process.env.LOCALAPPDATA,'Programs/YimuCraft/YimuCraft.exe'):path.resolve('release/0.7.40/win-unpacked/YimuCraft.exe');
 app=await electron.launch({executablePath:exe,args:[],env});const page=await app.firstWindow();await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('就绪'),{},{timeout:60000});
 const before=fingerprint(backup),after=fingerprint(path.join(dbdir,'library.sqlite'));assert.equal(after.version,1);assert.equal(after.assets,before.assets);assert.equal(after.integrity,'ok');
 const snapshots=fs.readdirSync(path.join(dbdir,'schema-backups'));assert.equal(snapshots.length,1);const snapshot=path.join(dbdir,'schema-backups',snapshots[0]);assert.equal(fingerprint(snapshot).assets,before.assets);report.checks.push('real user index clone migrated; all asset columns identical; valid pre-upgrade snapshot');
 const pr=path.join(root,'pr'),id=crypto.randomUUID();fs.mkdirSync(pr,{recursive:true});const pending=path.join(pr,'pending-operation.json');fs.writeFileSync(pending,JSON.stringify({id,operation:'import'}));
 fs.copyFileSync(path.join(require('os').homedir(),'Documents/YimuCraft/premiere-bridge/heartbeat.json'),path.join(pr,'heartbeat.json'));
 await app.evaluate(({dialog})=>{dialog.showMessageBox=async()=>({response:0});});
 const failure=await page.evaluate(async()=>{try{return JSON.stringify(await window.yimu.command('prRecover'));}catch(e){return e.message;}});assert.match(failure,/保存并关闭 PR/);
 fs.writeFileSync(path.join(pr,id+'.response.json'),JSON.stringify({id,ok:true}));await app.evaluate(({dialog})=>{dialog.showMessageBox=async()=>({response:0});});await page.evaluate(()=>window.yimu.command('prRecover'));assert.ok(fs.existsSync(pending));
 await app.evaluate(({dialog})=>{dialog.showMessageBox=async()=>({response:1});});await page.evaluate(()=>window.yimu.command('prRecover'));assert.ok(!fs.existsSync(pending));report.checks.push('real renderer IPC: unknown result refuses unlock while PR running; cancel retains; acknowledge resolves');
 const restored=path.join(root,'restored');fs.mkdirSync(restored);await app.evaluate(({dialog},paths)=>{let i=0;dialog.showOpenDialog=async()=>({canceled:false,filePaths:[paths[i++]]});},[snapshot,restored]);await page.evaluate(()=>window.yimu.command('restoreLibrary'));
 assert.equal(fingerprint(path.join(restored,'library.sqlite')).assets,before.assets);assert.equal((await page.evaluate(()=>window.yimu.command('query',{}))).total,before.count);report.checks.push('product restoreLibrary dialog flow restores snapshot into empty folder and queries full index');
 report.count=before.count;report.passed=true;
 }catch(e){report.error=e.stack;report.passed=false;process.exitCode=1;}finally{await close(app);fs.writeFileSync(path.join(out,mode+'-app.json'),JSON.stringify(report,null,2));console.log(report);}})();
