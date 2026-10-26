const {electron}=require('./test-app.cjs'),close=require('./close-test-app.cjs');
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert/strict');
const profile=path.join(process.env.APPDATA,'YimuCraft'),source='D:/00-aetodo.library';
const root=path.resolve('evidence/library-switch-20261023/run-'+Date.now());fs.mkdirSync(root,{recursive:true});
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const protectedFiles=['model-providers.json','preferences.json','agent/settings.json'];
const report={root,source,before:{sourceDb:hash(source+'/data/aetodo.db'),protected:Object.fromEntries(protectedFiles.map(p=>[p,hash(path.join(profile,p))]))}};
const executablePath=path.join(process.env.LOCALAPPDATA,'Programs/YimuCraft/YimuCraft.exe');
async function launch(){const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.YIMU_DATA_DIR;const app=await electron.launch({executablePath,args:[],env});const page=await app.firstWindow();await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('就绪'),{},{timeout:180000});return {app,page};}
(async()=>{let app;try{
 let session=await launch();app=session.app;let page=session.page;
 report.before.stats=await page.evaluate(()=>window.yimu.command('stats'));
 await app.evaluate(({dialog},source)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[source]});},source);
 await page.evaluate(()=>action('switchLibrary'));
 report.connected=await page.evaluate(()=>window.yimu.command('stats'));
 assert.ok(report.connected.total>60000);assert.ok(report.connected.location.toLowerCase().startsWith(path.join(profile,'linked-libraries').toLowerCase()));
 report.samples={};for(const ext of ['aep','ffx','wav']){const r=await page.evaluate(ext=>window.yimu.command('query',{extensions:[ext],limit:5}),ext);report.samples[ext]=r;assert.ok(r.items.length);for(const a of r.items)assert.ok(path.resolve(a.path).toLowerCase().startsWith(path.resolve(source).toLowerCase()));}
 await page.evaluate(async ids=>{state.duplicateIds=ids;await refresh();},report.samples.wav.items.map(a=>a.id));await page.waitForFunction(()=>document.querySelectorAll('.asset').length>0);await page.screenshot({path:path.join(root,'connected.png')});
 await close(app);app=null;session=await launch();app=session.app;page=session.page;
 report.restarted=await page.evaluate(()=>window.yimu.command('stats'));assert.equal(report.restarted.total,report.connected.total);assert.equal(report.restarted.location,report.connected.location);
 await page.evaluate(async ids=>{state.duplicateIds=ids;await refresh();},report.samples.wav.items.map(a=>a.id));await page.locator('.audio-card canvas[data-decoded=true]').first().waitFor({timeout:30000});report.audioDecoded=true;
 await page.screenshot({path:path.join(root,'restarted.png')});
 report.after={sourceDb:hash(source+'/data/aetodo.db'),protected:Object.fromEntries(protectedFiles.map(p=>[p,hash(path.join(profile,p))]))};
 assert.deepEqual(report.after,report.before&&{sourceDb:report.before.sourceDb,protected:report.before.protected});report.passed=true;
}catch(e){report.error=e.stack;report.passed=false;process.exitCode=1;}finally{await close(app);fs.writeFileSync(path.join(root,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({root,passed:report.passed,error:report.error,total:report.connected?.total,location:report.connected?.location,audioDecoded:report.audioDecoded}));}})();

