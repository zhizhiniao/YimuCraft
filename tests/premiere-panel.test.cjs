const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync(path.resolve('src/premiere-panel/panel.js'),'utf8');
test('Premiere startup loads a single invisible request consumer without opening a panel',()=>{
 const manifest=fs.readFileSync('src/premiere-panel/CSXS/manifest.xml','utf8');
 assert.match(manifest,/<Type>Custom<\/Type>/);
 assert.match(manifest,/<AutoVisible>false<\/AutoVisible>/);
 assert.match(manifest,/<StartOn>\s*<Event>com\.adobe\.csxs\.events\.ApplicationActivate<\/Event>\s*<\/StartOn>/);
 assert.equal((manifest.match(/<DispatchInfo>/g)||[]).length,1);
 assert.doesNotMatch(manifest,/<Menu>/);
});
test('CEP-only Node context without APPDATA uses Adobe Documents path and handles an actual request file',()=>{
 const root=fs.mkdtempSync(path.resolve('work/cep-panel-')),status={textContent:''};let tick,dispatches=0;
 const context={clearInterval:()=>{},document:{getElementById:()=>status},setInterval:f=>{tick=f;},window:{addEventListener:()=>{},cep_node:{require,process:{env:{}}},__adobe_cep__:{getSystemPath:()=>root,evalScript:(_script,callback)=>{dispatches++;callback(JSON.stringify({ok:true,result:{project:'fixture.prproj'}}));}}}};
 vm.runInNewContext(source,context);assert.ok(tick);tick();const directory=path.join(root,'YimuCraft','premiere-bridge');assert.equal(JSON.parse(fs.readFileSync(path.join(directory,'heartbeat.json'))).directory,directory);
 const id=crypto.randomUUID(),request=path.join(directory,id+'.request.json');fs.writeFileSync(request,JSON.stringify({id,time:Date.now(),operation:'inspect'}));tick();assert.equal(dispatches,1);assert.equal(fs.existsSync(request+'.executing'),false);const result=JSON.parse(fs.readFileSync(path.join(directory,id+'.response.json')));assert.equal(result.id,id);assert.equal(result.result.project,'fixture.prproj');
 fs.writeFileSync(request,JSON.stringify({id,time:Date.now()-180000,operation:'import'}));tick();assert.equal(dispatches,1);assert.equal(JSON.parse(fs.readFileSync(path.join(directory,id+'.response.json'))).ok,false);
});
test('CEP bootstrap reports missing Node and transient heartbeat failure recovers on next tick',()=>{
 const status={textContent:''};vm.runInNewContext(source,{window:{},document:{getElementById:()=>status}});assert.match(status.textContent,/面板启动失败/);
 const root=fs.mkdtempSync(path.resolve('work/cep-recovery-'));let tick,fail=true;const proxy={...fs,renameSync:(...args)=>{if(fail){fail=false;throw Error('transient lock');}return fs.renameSync(...args);}};
 vm.runInNewContext(source,{clearInterval:()=>{},window:{addEventListener:()=>{},cep_node:{require:n=>n==='fs'?proxy:require(n),process:{env:{APPDATA:root}}},__adobe_cep__:{getSystemPath:()=>root}},document:{getElementById:()=>status},setInterval:f=>{tick=f;}});tick();assert.match(status.textContent,/连接失败/);tick();assert.match(status.textContent,/已连接/);assert.ok(fs.existsSync(path.join(root,'YimuCraft','premiere-bridge','heartbeat.json')));
});

test('unloading or replacing the CEP page stops its Node polling timer',()=>{
 const root=fs.mkdtempSync(path.resolve('work/cep-unload-')),status={textContent:''};let tick,unload,cleared=0;const timer={};const window={addEventListener:(event,fn)=>{if(event==='beforeunload')unload=fn;},cep_node:{require,process:{env:{}}},__adobe_cep__:{getSystemPath:()=>root}};
 vm.runInNewContext(source,{window,document:{getElementById:()=>status},setInterval:fn=>{tick=fn;return timer;},clearInterval:handle=>{assert.equal(handle,timer);cleared++;}});assert.ok(unload);unload();tick();assert.equal(cleared,1);assert.equal(fs.existsSync(path.join(root,'YimuCraft','premiere-bridge','heartbeat.json')),false);
});

test('background installation repairs partial files and leaves matching files untouched',async()=>{
 const {installPremiereBridge}=require('../src/premiere-install.cjs');
 const root=fs.mkdtempSync(path.resolve('work/cep-install-'));
 const destination=path.join(root,'Adobe/CEP/extensions/com.yimucraft.bridge');
 assert.equal((await installPremiereBridge(root)).changed,true);
 for(const file of ['host.jsx','panel.js','index.html','CSXS/manifest.xml'])
  assert.deepEqual(fs.readFileSync(path.join(destination,file)),fs.readFileSync(path.join('src/premiere-panel',file)));
 const manifest=path.join(destination,'CSXS/manifest.xml'),modified=fs.statSync(manifest).mtimeMs;
 assert.equal((await installPremiereBridge(root)).changed,false);
 assert.equal(fs.statSync(manifest).mtimeMs,modified);
 fs.writeFileSync(path.join(destination,'panel.js'),'incomplete update');
 assert.equal((await installPremiereBridge(root)).changed,true);
 assert.deepEqual(fs.readFileSync(path.join(destination,'panel.js')),fs.readFileSync('src/premiere-panel/panel.js'));
 assert.equal(fs.readdirSync(destination).some(name=>name.endsWith('.tmp')),false);
});
