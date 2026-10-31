const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),vm=require('node:vm'),{EventEmitter}=require('node:events');
async function fixture(){
 const root=await fs.mkdtemp(path.resolve('work/drag-lifecycle-')),file=path.join(root,'中文 original.png');await fs.writeFile(file,'original bytes');
 const listeners={},commands={},sent=[],calls=[],frame={},sender={mainFrame:frame,startDrag:value=>{calls.push(value);}},win={webContents:sender,isDestroyed:()=>false};sender.send=(name,value)=>sent.push({name,value});
 class Store extends EventEmitter{async init(){return this;}async dragFiles(){return [file];}}
 let now=Date.now();class Clock extends Date{static now(){return now;}}
 const electron={app:{getPath:()=>root},ipcMain:{on:(n,f)=>listeners[n]=f,handle:(n,f)=>commands[n]=f},nativeImage:{createFromPath:()=>({resize:()=>({})})}};
 const source=await fs.readFile(path.resolve('src/project-canvas-ipc.cjs'),'utf8'),module={exports:{}};
 vm.runInNewContext(source,{module,exports:module.exports,__dirname:path.resolve('src'),require:id=>id==='electron'?electron:id==='./project-canvas.cjs'?{ProjectCanvases:Store}:id==='./canvas-transfer.cjs'?{CanvasTransfer:class{}}:require(id),Date:Clock,Response});
 await module.exports.installProjectCanvas(win);const event={sender,senderFrame:frame};
 return {file,sender,calls,sent,event,prepare:()=>commands['canvas-command'](event,'prepareDrag','board',['image']),drag:(token,e=event)=>listeners['canvas-drag'](e,token),advance:ms=>now+=ms};
}
test('native file drag always completes its lifecycle, rejects overlap, and consumes each token once',async()=>{
 const f=await fixture(),first=await f.prepare(),second=await f.prepare();let release;f.sender.startDrag=value=>{f.calls.push(value);return new Promise(r=>release=r);};const dragging=f.drag(first);assert.equal(f.calls.length,1);await f.drag(second);assert.equal(f.calls.length,1);assert.match(f.sent.at(-1).value.error,/已有文件/);release();await dragging;assert.deepEqual(JSON.parse(JSON.stringify(f.sent.at(-1))),{name:'canvas-drag-ended',value:{token:first}});
 await f.drag(first);assert.equal(f.calls.length,1);assert.match(f.sent.at(-1).value.error,/重新拖动/);
 f.sender.startDrag=value=>f.calls.push(value);await f.drag(second);assert.equal(f.calls.length,2);assert.deepEqual(Array.from(f.calls[0].files),[f.file]);
});
test('failed start, missing source and expiry all report completion without leaving the native lock held',async()=>{
 const f=await fixture();f.sender.startDrag=()=>{throw Error('native rejected');};await f.drag(await f.prepare());assert.equal(f.sent.at(-1).value.error,'native rejected');
 f.sender.startDrag=value=>f.calls.push(value);const missing=await f.prepare();await fs.rename(f.file,f.file+'.offline');await f.drag(missing);assert.match(f.sent.at(-1).value.error,/原文件已移走/);assert.equal(f.calls.length,0);await fs.rename(f.file+'.offline',f.file);
 const expired=await f.prepare();f.advance(60001);await f.drag(expired);assert.match(f.sent.at(-1).value.error,/重新拖动/);await f.drag(await f.prepare());assert.equal(f.calls.length,1);
});
test('foreign frames cannot start native drag and warming another selection does not invalidate a ready token',async()=>{
 const f=await fixture(),token=await f.prepare();await f.prepare();await f.drag(token,{sender:f.sender,senderFrame:{}});assert.equal(f.calls.length,0);await f.drag(token);assert.equal(f.calls.length,1);
});
