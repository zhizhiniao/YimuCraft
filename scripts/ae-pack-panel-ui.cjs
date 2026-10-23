const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto'),{spawn,execFileSync}=require('child_process'),{electron}=require('./test-app.cjs'),close=require('./close-test-app.cjs'),{discoverAE,adobeEnvironment}=require('../src/adobe-bridge.cjs');
(async()=>{
 const root=path.resolve('work/ae-pack-panel-'+Date.now()),data=path.join(root,'library'),source=path.join(root,'source');fs.mkdirSync(source,{recursive:true});const report={root,executable:process.env.YIMU_TEST_EXE||'development',checks:[]};let app,child;
 const q=s=>JSON.stringify(s.replaceAll('\\','/')),hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
 try{
  const running=execFileSync('powershell.exe',['-NoProfile','-Command',"@(Get-Process AfterFX -ErrorAction SilentlyContinue).Count"],{encoding:'utf8',windowsHide:true}).trim();assert.equal(Number(running),0,'Close only owned test AE before running; never replace a user project');
  const env={...process.env,YIMU_DATA_DIR:data,...(process.env.YIMU_TEST_EXE?{}:{YIMU_AE_CONNECTION_FILE:path.join(root,'connection.json')})};delete env.ELECTRON_RUN_AS_NODE;app=await electron.launch({...(process.env.YIMU_TEST_EXE?{executablePath:process.env.YIMU_TEST_EXE,args:[]}:{args:['.']}),env});const page=await app.firstWindow();await page.waitForFunction(()=>document.querySelector('#status').textContent.startsWith('就绪'));
  const installed=process.env.YIMU_AE_PANEL_INSTALLED?{path:process.env.YIMU_AE_PANEL_INSTALLED,preinstalled:true}:await page.evaluate(()=>window.yimu.command('aeInstall'));report.install=installed;const panel=path.join(installed.path,'一幕工程打包.jsx'),host=path.join(installed.path,'YimuCraft/host.jsx');
  const png=path.join(source,'图像.png'),wav=path.join(source,'声音.wav');for(const [file,input]of [[png,'color=c=red:s=640x360'],[wav,'sine=frequency=330:duration=2']])execFileSync(require('ffmpeg-static'),['-hide_banner','-loglevel','error','-f','lavfi','-i',input,...(file===png?['-frames:v','1']:[]),file],{windowsHide:true});
  const fixture=path.join(root,'original'),original=path.join(fixture,'Migration_Test.aep'),before=path.join(root,'original-before.aep'),done=path.join(root,'done.json'),script=path.join(root,'run.jsx');
  const request=(id,op,payload,receipt,isolated=false)=>'$.global.YIMU_REQUEST='+JSON.stringify({id,operation:op,payload,receipt,isolated})+';$.evalFile(new File('+q(host)+'));';
  fs.writeFileSync(script,`try {
    ${request('fixture','fixture',{output:fixture,media:[png,wav],extraComp:true},path.join(root,'fixture.json'),true)}
    app.exitAfterLaunchAndEval=false;app.open(new File(${q(original)}));
    for(var k=1;k<=app.project.numItems;k++)app.project.item(k).selected=false;for(var k=1;k<=app.project.numItems;k++)if(app.project.item(k) instanceof CompItem&&app.project.item(k).numLayers===3){app.project.item(k).selected=true;app.project.item(k).openInViewer();break;}app.project.save();app.project.file.copy(${q(before)});
    ${process.env.YIMU_TEST_EXE?'delete $.global.YimuPackConnectionFile;':'$.global.YimuPackConnectionFile='+q(path.join(root,'connection.json'))+';'}$.evalFile(new File(${q(panel)}));
    var all=$.global.YimuPack.pack(false);
    ${request('restored-all','inspect',{},path.join(root,'restored-all.json'))}
    var selected=$.global.YimuPack.pack(true);
    ${request('restored-selected','inspect',{},path.join(root,'restored-selected.json'))}
    var folder=new Folder(${q(source)});if(!folder.rename('source-offline'))throw Error('Cannot make sources offline');
    try{
      var projects=[all.result.project,selected.result.project];
      for(var i=0;i<projects.length;i++){
        app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);app.open(new File(projects[i]));
        $.global.YIMU_REQUEST={id:'verify-'+i,operation:'inspect',isolated:false,payload:{},receipt:${q(root)}+'/verify-'+i+'.json'};$.evalFile(new File(${q(host)}));
        for(var j=1;j<=app.project.numItems;j++)if(app.project.item(j) instanceof CompItem){app.project.item(j).saveFrameToPng(0,new File(${q(root)}+'/frame-'+i+'.png'));break;}
      }
    }finally{new Folder(${q(source+'-offline')}).rename('source');}
    app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);app.open(new File(${q(original)}));
    ${request('done','inspect',{},done)}
    app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);app.quit();
  }catch(error){var f=new File(${q(path.join(root,'error.txt'))});f.open('w');f.write(String(error)+' line '+error.line);f.close();app.exitAfterLaunchAndEval=false;}`,'utf8');
  const exe=discoverAE()[0].path;child=spawn(exe,['-m','-r',script],{cwd:path.dirname(exe),env:adobeEnvironment(),windowsHide:true,stdio:'ignore'});report.pid=child.pid;
  const start=Date.now();while(!fs.existsSync(done)&&!fs.existsSync(path.join(root,'error.txt'))&&Date.now()-start<150000)await new Promise(r=>setTimeout(r,500));
  if(fs.existsSync(path.join(root,'error.txt')))throw Error(fs.readFileSync(path.join(root,'error.txt'),'utf8'));assert.ok(fs.existsSync(done),'AE did not finish; inspect owned process/dialog');
  const read=n=>JSON.parse(fs.readFileSync(path.join(root,n),'utf8').replace(/^\uFEFF/,''));
  for(const name of ['restored-all.json','restored-selected.json']){const r=read(name).result;assert.equal(path.resolve(r.project),original);assert.equal(r.dirty,false);assert.equal(r.items,read('fixture.json').result.items);}
  assert.equal(hash(original),hash(before));report.checks.push('Full and selected packaging restore the original saved project; original bytes unchanged');
  for(let i=0;i<2;i++){const r=read('verify-'+i+'.json').result;assert.equal(r.missing.length,0);assert.ok(r.files.length>=2);for(const f of r.files)assert.ok(f.path.startsWith(path.join(data,'managed','ae')));assert.ok(fs.statSync(path.join(root,'frame-'+i+'.png')).size>100);}
  assert.ok(read('verify-1.json').result.comps.length<read('verify-0.json').result.comps.length);report.checks.push('Both real AEPs reopen with source offline, local dependencies, native rendered PNG; selected package excludes unused comp');
  const deadline=Date.now()+20000;let assets=[];while(Date.now()<deadline){assets=(await page.evaluate(()=>window.yimu.command('query',{ext:'aep'}))).items;if(assets.length===2&&assets.every(a=>a.bundle_folder))break;await new Promise(r=>setTimeout(r,500));}report.assets=assets.map(a=>({path:a.path,bundle:a.bundle_folder}));assert.equal(report.assets.length,2);assert.ok(report.assets.every(a=>a.bundle));report.checks.push('Desktop receives both completed packages automatically');await page.screenshot({path:path.join(root,'desktop.png')});report.passed=true;
 }catch(e){report.passed=false;report.error=e.stack;process.exitCode=1;}finally{await close(app);fs.writeFileSync(path.join(root,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
