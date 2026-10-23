const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync(path.resolve('src/premiere-panel/panel.js'),'utf8');
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
