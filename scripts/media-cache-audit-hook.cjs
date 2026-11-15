// Test-only observer loaded with Electron -r; never shipped in src/.
const fs=require('node:fs'),cp=require('node:child_process'),{ipcMain}=require('electron');
const audit=global.__mediaCacheAudit={events:[],reset(){this.events=[];}};
const emit=(type,data={})=>audit.events.push({type,time:Date.now(),...data});
const spawn=cp.spawn;cp.spawn=function(file,args,options){const child=spawn.apply(this,arguments);emit('spawn',{pid:child.pid,file,args});child.once('close',code=>emit('exit',{pid:child.pid,code}));return child;};
const createReadStream=fs.createReadStream;fs.createReadStream=function(file,options){const stream=createReadStream.apply(this,arguments),original=stream.emit;let bytes=0;emit('read',{file:String(file),start:options?.start,end:options?.end});stream.emit=function(event,...args){if(event==='data')bytes+=args[0].length;if(event==='end'||event==='close')emit(event==='end'?'readEnd':'readClose',{file:String(file),bytes});return original.call(this,event,...args);};return stream;};
const wrap=(channel,fn)=>async(event,...args)=>{const start=Date.now(),name=args[0];emit('request',{channel,name});try{return await fn(event,...args);}finally{emit('response',{channel,name,ms:Date.now()-start});}};
for(const [channel,fn] of ipcMain._invokeHandlers||[])ipcMain._invokeHandlers.set(channel,wrap(channel,fn));
const handle=ipcMain.handle;ipcMain.handle=function(channel,fn){return handle.call(this,channel,wrap(channel,fn));};
