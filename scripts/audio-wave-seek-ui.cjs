const {electron}=require('./test-app.cjs'),fs=require('fs'),path=require('path'),assert=require('assert/strict'),{execFileSync}=require('child_process'),close=require('./close-test-app.cjs');
(async()=>{
 const root=path.resolve('work/audio-wave-seek-'+Date.now()),source=path.join(root,'source'),data=path.join(root,'library');fs.mkdirSync(source,{recursive:true});
 const report={root,executable:process.env.YIMU_TEST_EXE||'development',checks:[]};let app,page;
 const file=path.join(source,'点击波形.wav');execFileSync(require('ffmpeg-static'),['-hide_banner','-loglevel','error','-f','lavfi','-i','sine=frequency=330:duration=20',file],{windowsHide:true});
 try{
  const env={...process.env,YIMU_DATA_DIR:data};delete env.ELECTRON_RUN_AS_NODE;app=await electron.launch({...(process.env.YIMU_TEST_EXE?{executablePath:process.env.YIMU_TEST_EXE,args:[]}:{args:['.']}),env});page=await app.firstWindow();
  await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('就绪'));
  await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});},file);await page.locator('#importFiles').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('完成：'));
  const wave=page.locator('.audio-card canvas');await page.waitForFunction(()=>document.querySelector('.audio-card canvas')?.dataset.decoded==='true');await wave.hover();await page.waitForFunction(()=>document.querySelector('.audio-card audio').currentTime>.1);
  await page.locator('.audio-card audio').evaluate(a=>{a.dataset.identity='original';window.__seekEvents=[];a.addEventListener('seeked',()=>window.__seekEvents.push({time:a.currentTime,at:performance.now()}));});
  const box=await wave.boundingBox();
  for(const fraction of [.7,.2,.85]){
   const started=await page.evaluate(()=>performance.now());await wave.click({position:{x:box.width*fraction,y:box.height/2}});
   await page.waitForFunction(target=>{const a=document.querySelector('.audio-card audio');return a&&!a.paused&&!a.seeking&&a.readyState>=2&&Math.abs(a.currentTime-target)<.7;},20*fraction,{timeout:2000});
   const current=await page.locator('.audio-card audio').evaluate(a=>({time:a.currentTime,identity:a.dataset.identity,paused:a.paused}));assert.equal(current.identity,'original');
   report.checks.push({fraction,...current,latencyMs:await page.evaluate(start=>performance.now()-start,started)});
  }
  assert.equal(await page.locator('#preview audio').count(),0,'Wave click must not replace playback with detail audio');
  await page.screenshot({path:path.join(root,'wave-seek.png')});report.passed=true;
 }catch(e){report.passed=false;report.error=e.stack;process.exitCode=1;}finally{await close(app);fs.writeFileSync(path.join(root,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
