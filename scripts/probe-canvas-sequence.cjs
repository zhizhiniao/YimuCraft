const {electron}=require('./test-app.cjs'),close=require('./close-test-app.cjs'),fs=require('fs'),path=require('path');
const run=path.resolve('work/canvas-sequence-probe-'+Date.now());fs.mkdirSync(run,{recursive:true});
const profile=path.join(run,'profile');fs.mkdirSync(path.join(profile,'app-profile/project-canvases'),{recursive:true});
fs.copyFileSync(path.join(process.env.APPDATA,'YimuCraft/project-canvases/projects.json'),path.join(profile,'app-profile/project-canvases/projects.json'));
const env={...process.env,YIMU_DATA_DIR:profile,YIMU_AE_CONNECTION_FILE:path.join(run,'ae.json'),YIMU_PR_BRIDGE_DIR:path.join(run,'pr')};delete env.ELECTRON_RUN_AS_NODE;
(async()=>{let app;const report={run};try{app=await electron.launch({executablePath:process.env.YIMU_TEST_EXE,args:[],env});const page=await app.firstWindow();await page.waitForSelector('#projectCanvas[data-ready=true]',{timeout:60000});
report.result=await page.evaluate(async()=>{const l=await yimuCanvas.command('list'),b=await yimuCanvas.command('refresh',l.active),s=Object.values(b.items).find(i=>i.kind==='sequence'&&i.group==='K01');const r={name:s.name,frames:s.frameIds.length,requests:[]};for(const [id,type] of [[s.id,'thumb'],[s.frameIds[0],'thumb'],[s.id,'file']]){const q=await fetch(`yimu://canvas/${b.id}/${id}/${type}`);r.requests.push({type,status:q.status,size:(await q.blob()).size});}return r;});
report.ok=report.result.requests.every(r=>r.status===200&&r.size>100);if(!report.ok)process.exitCode=1;
}catch(e){report.error=e.message;process.exitCode=1;}finally{if(app)await close(app).catch(()=>{});fs.writeFileSync(path.join(run,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}})();
