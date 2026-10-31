const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),{EventEmitter}=require('node:events'),{PassThrough}=require('node:stream');
const root=path.resolve(__dirname,'..');

test('AE startup is dormant: no project reads, filesystem polling or repeating tasks',()=>{
  let reads=0,timers=0,legacyReads=0;
  const globals={yimuCraftTick(){legacyReads++;}};
  const app={scheduleTask(){timers++;return 1;},cancelTask(){}};
  Object.defineProperty(app,'project',{get(){reads++;throw Error('Startup must not inspect a project');}});
  const context={app,$:{global:globals},File(){throw Error('No startup file polling');},Folder:{}};
  const code=fs.readFileSync(path.join(root,'src/ae-panel/ae-state.jsx'),'utf8');
  vm.runInNewContext(code,context);vm.runInNewContext(code,context);
  globals.yimuCraftTick(); // A legacy task without a saved ID must become harmless.
  assert.equal(reads,0);assert.equal(timers,0);assert.equal(legacyReads,0);
});

function fixture(reply=true){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'yimu-demand-'));
  const exe=path.join(dir,'AfterFX.exe'),com=path.join(dir,'AfterFX.com');fs.writeFileSync(exe,'');fs.writeFileSync(com,'');
  const calls=[];let seq=0;
  const fakeSpawn=(file,args)=>{
    const child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.unref=()=>{};
    const script=fs.readFileSync(args.at(-1),'utf8');
    const request=JSON.parse(script.slice('var YIMU_REQUEST = '.length,script.indexOf(';\n')));
    calls.push({file,args,request});
    setImmediate(()=>{child.emit('exit',0,null);if(reply)fs.writeFileSync(request.receipt,JSON.stringify({id:request.id,ok:true,version:'test',result:{project:'live-'+(++seq),items:seq}}));});
    return child;
  };
  const mod={exports:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'src/adobe-bridge.cjs'),'utf8'),{module:mod,exports:mod.exports,__dirname:path.join(root,'src'),process:{env:{...process.env,USERPROFILE:dir}},require:name=>name==='node:child_process'?{spawn:fakeSpawn}:require(name),setTimeout,clearTimeout});
  const bridge=new mod.exports.AdobeBridge(path.join(dir,'requests'),{executable:exe,timeout:80,poll:5});
  return {dir,bridge,calls,com,cleanup:()=>fs.rmSync(dir,{recursive:true,force:true})};
}

test('each explicit AE refresh executes once; a fresh legacy snapshot never answers it',async()=>{
  const f=fixture();try{
    const folder=path.join(f.dir,'Documents/YimuCraft');fs.mkdirSync(folder,{recursive:true});
    fs.writeFileSync(path.join(folder,'ae-state.json'),JSON.stringify({ts:Date.now(),project:'stale-other-project',version:'old'}));
    const a=await f.bridge.run('inspect');const b=await f.bridge.run('inspect');
    assert.equal(a.result.project,'live-1');assert.equal(b.result.project,'live-2');
    assert.equal(f.calls.length,2);assert.ok(f.calls.every(c=>c.file===f.com));
    assert.equal(fs.existsSync(path.join(folder,'ae-panel.json')),false);
    await new Promise(r=>setTimeout(r,30));assert.equal(f.calls.length,2);
  }finally{f.cleanup();}
});

test('an exited live launcher without receipt does not authorize a duplicate request',async()=>{
  const f=fixture(false);try{
    await assert.rejects(f.bridge.run('inspect'),/未返回|超时/);
    await assert.rejects(f.bridge.run('inspect'),/尚未结束|待确认/);
    assert.equal(f.calls.length,1);
  }finally{f.cleanup();}
});

test('media import returns a light summary without traversing existing layers',()=>{
  let receipt,walks=0;
  const project={file:{fsName:'C:/user/project.aep'},dirty:true,numItems:200,importFile(){return {id:201,name:'image.png'};},item(){walks++;throw Error('Import must not scan the whole project');}};
  function File(name){this.fsName=name;this.name=path.basename(name);this.exists=true;this.open=()=>true;this.write=s=>{receipt=JSON.parse(s);};this.close=()=>{};this.rename=()=>true;}
  vm.runInNewContext(fs.readFileSync(path.join(root,'src/adobe-host.jsx'),'utf8'),{YIMU_REQUEST:{id:'import',operation:'import',isolated:false,payload:{paths:['C:/image.png']},receipt:'receipt.json'},File,ImportOptions:function(){},app:{project,version:'test',beginUndoGroup(){},endUndoGroup(){}},$:{writeln(){}}});
  assert.equal(receipt.ok,true);assert.equal(walks,0);assert.equal(receipt.result.added.length,1);
});
