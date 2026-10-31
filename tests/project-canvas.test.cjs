const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {ProjectCanvases}=require('../src/project-canvas.cjs');
async function fixture(watch=false){const dir=await fs.mkdtemp(path.resolve('work/canvas-core-'));const source=path.join(dir,'项目 source'),settings=path.join(dir,'settings');await fs.mkdir(path.join(source,'Data','K01_镜头'),{recursive:true});const file=path.join(source,'Data','K01_镜头','参考 v01.png');await fs.writeFile(file,'unaltered source fixture');const store=await new ProjectCanvases(settings,{watch,debounce:100}).init();const id=await store.attach(source);await store.activate(id);return {dir,source,settings,file,store,id};}
const waitFor=async(fn,ms=10000)=>{const start=Date.now();while(Date.now()-start<ms){if(await fn())return;await new Promise(r=>setTimeout(r,100));}throw Error('condition timeout');};
test('project canvas preserves source bytes, hidden tombstones, position and status across sync/restart/restore',async()=>{
  const f=await fixture();try{
    const before=await fs.readFile(f.file),item=Object.values(f.store.snapshot().items)[0];assert.equal(item.group,'K01');
    await f.store.patch(f.id,[{id:item.id,x:730,y:460,width:420,status:'confirmed',hidden:true}]);await f.store.refresh();
    assert.ok(f.store.snapshot().items[item.id].hiddenAt);await f.store.close();
    const reopened=await new ProjectCanvases(f.settings,{watch:false}).init();await reopened.activate(f.id);
    assert.equal(reopened.snapshot().items[item.id].x,730);assert.equal(reopened.snapshot().items[item.id].status,'confirmed');assert.ok(reopened.snapshot().items[item.id].hiddenAt);
    await reopened.patch(f.id,[{id:item.id,hidden:false}]);const restored=reopened.snapshot().items[item.id];assert.equal(restored.hiddenAt,null);assert.equal(restored.history.length,2);assert.equal(restored.width,420);
    assert.deepEqual(await fs.readFile(f.file),before);assert.deepEqual(await fs.readdir(f.source),['Data']);await reopened.close();
  }finally{await f.store.close();}
});
test('watcher discovers nested new files and overwrite, does not resurrect hidden entries',async()=>{
  const f=await fixture(true);try{
    const first=Object.values(f.store.snapshot().items)[0];await f.store.patch(f.id,[{id:first.id,hidden:true}]);
    await fs.mkdir(path.join(f.source,'Data','K02_新镜头'));const next=path.join(f.source,'Data','K02_新镜头','新图.png');await fs.writeFile(next,'new generated asset');
    await waitFor(()=>Object.values(f.store.snapshot().items).some(i=>i.name==='新图.png'));
    await fs.writeFile(f.file,'changed generation contents with extra bytes');
    await waitFor(()=>f.store.snapshot().items[first.id].size===44);assert.ok(f.store.snapshot().items[first.id].hiddenAt);
    assert.equal(Object.values(f.store.snapshot().items).find(i=>i.name==='新图.png').status,'pending');
  }finally{await f.store.close();}
});
test('deleted/missing source stays recoverable; rename preserves hidden layout and dependency dirs are excluded',async()=>{
  const f=await fixture();try{
    const item=Object.values(f.store.snapshot().items)[0];await f.store.patch(f.id,[{id:item.id,hidden:true,x:510}]);
    const renamed=path.join(path.dirname(f.file),'renamed.png');await fs.rename(f.file,renamed);await f.store.refresh();const row=f.store.snapshot().items[item.id];assert.equal(row.name,'renamed.png');assert.equal(row.x,510);assert.ok(row.hiddenAt);
    await fs.writeFile(f.file,'new file reusing previous name');await f.store.refresh();assert.equal(Object.keys(f.store.snapshot().items).length,2);assert.equal(f.store.snapshot().items[item.id].name,'renamed.png');
    await fs.unlink(renamed);await f.store.refresh();assert.ok(f.store.snapshot().items[item.id].missing);assert.ok(f.store.snapshot().items[item.id].hiddenAt);
    await fs.mkdir(path.join(f.source,'node_modules'));await fs.writeFile(path.join(f.source,'node_modules','skip.png'),'dependency');await f.store.refresh();assert.equal(Object.values(f.store.snapshot().items).length,2);
    await fs.rename(f.source,f.source+'-offline');await f.store.refresh();assert.ok(f.store.snapshot().offline);assert.equal(Object.keys(f.store.snapshot().items).length,2);
  }finally{await f.store.close();}
});
test('validates mutation and contained real path, and recovers corrupted metadata from backup',async()=>{
  const f=await fixture();try{
    const item=Object.values(f.store.snapshot().items)[0];await assert.rejects(()=>f.store.patch(f.id,[{id:item.id,x:NaN}]),/无效/);await assert.rejects(()=>f.store.patch(f.id,[{id:item.id,group:'__proto__'}]),/无效/);
    const outside=path.join(f.dir,'outside.png');await fs.writeFile(outside,'outside');f.store.board(f.id).items[item.id].relative='../outside.png';await assert.rejects(()=>f.store.resolve(f.id,item.id),/超出/);f.store.board(f.id).items[item.id].relative=path.relative(f.source,f.file);
    await f.store.patch(f.id,[{id:item.id,x:123}]);await f.store.patch(f.id,[{id:item.id,y:234}]);await f.store.close();
    await fs.writeFile(path.join(f.settings,'projects.json'),'{broken');const recovered=await new ProjectCanvases(f.settings,{watch:false}).init();assert.match(recovered.warning,/备份/);assert.equal(recovered.snapshot().items[item.id].x,123);await recovered.refresh();assert.doesNotThrow(()=>JSON.parse(require('fs').readFileSync(path.join(f.settings,'projects.json.bak'),'utf8')));await recovered.close();
  }finally{await f.store.close();}
});
