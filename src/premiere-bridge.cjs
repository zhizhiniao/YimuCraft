const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
class PremiereBridge{
 constructor(directory=process.env.YIMU_PR_BRIDGE_DIR||path.join(require('node:os').homedir(),'Documents','YimuCraft','premiere-bridge'),options={}){this.directory=directory;fs.mkdirSync(directory,{recursive:true});this.busy=false;this.timeout=options.timeout??90000;this.poll=options.poll??200;this.journal=path.join(directory,'pending-operation.json');}
 pending(){
  if(!fs.existsSync(this.journal))return null;
  const p=JSON.parse(fs.readFileSync(this.journal,'utf8'));if(!/^[a-f0-9-]{36}$/.test(p.id))throw Error('PR 未决记录损坏，请保留目录并联系支持');
  const response=path.join(this.directory,p.id+'.response.json');let receipt=null;
  if(fs.existsSync(response)){try{const r=JSON.parse(fs.readFileSync(response,'utf8'));if(r.id===p.id&&typeof r.ok==='boolean'&&!r.uncertain)receipt=r;}catch{}}
  return {...p,receipt};
 }
 resolvePending({hostClosed=false}={}){
  if(this.busy)throw Error('PR 操作正在等待回执');const p=this.pending();if(!p)return {message:'没有 PR 未决操作'};
  if(!p.receipt&&!hostClosed)throw Error('PR 结果仍未知。请先关闭 PR，再从 Adobe 菜单处理未决操作');
  // Called only after an explicit user acknowledgement; never replay the request.
  for(const suffix of ['.request.json','.request.json.executing']){const file=path.join(this.directory,p.id+suffix);if(fs.existsSync(file))fs.renameSync(file,file+'.abandoned-'+crypto.randomUUID());}
  fs.renameSync(this.journal,path.join(this.directory,p.id+'.resolved-'+crypto.randomUUID()+'.json'));
  return {id:p.id,receipt:p.receipt,message:p.receipt?'已确认 PR 回执；未重复执行':'已解除未决锁；请核对工程结果，未重复执行'};
 }
 async run(operation,payload={}){
  if(this.busy)throw Error('PR 操作正在执行');if(this.pending())throw Error('PR 上次操作结果待确认；请在 Adobe 菜单处理 PR 未决操作，勿重复提交');if(!['inspect','import','mogrt','lut','lutAdjustment','collectCurrent','openProject','fixture'].includes(operation))throw Error('不支持的 PR 操作');
  let heartbeat;try{heartbeat=JSON.parse(fs.readFileSync(path.join(this.directory,'heartbeat.json'),'utf8'));}catch{}
  if(!heartbeat||Date.now()-heartbeat.time>5000)throw Error('请在 PR 的“窗口→扩展”中打开“一幕 YimuCraft”面板');
  this.busy=true;const id=crypto.randomUUID(),request=path.join(this.directory,id+'.request.json'),response=path.join(this.directory,id+'.response.json');
  try{
   // Persist before publishing. wx excludes another application/client process.
   fs.writeFileSync(this.journal,JSON.stringify({id,time:Date.now(),operation}),{flag:'wx'});
   fs.writeFileSync(request+'.tmp',JSON.stringify({id,time:Date.now(),operation,payload}));fs.renameSync(request+'.tmp',request);
   const start=Date.now();while(Date.now()-start<this.timeout){if(fs.existsSync(response)){
    const r=JSON.parse(fs.readFileSync(response,'utf8'));if(r.id!==id||typeof r.ok!=='boolean'||r.uncertain)throw Error('PR 回执无法确认执行结果，请处理未决操作');
    fs.renameSync(this.journal,path.join(this.directory,id+'.completed.json'));
    if(!r.ok)throw Error('PR：'+r.error);return {...r,receipt:response};
   }await new Promise(r=>setTimeout(r,this.poll));}
   // A queued request can be cancelled, but an executing one remains unknown.
   try{fs.renameSync(request,request+'.expired');}catch(e){if(e.code!=='ENOENT')throw e;}
   throw Error('PR 未返回回执，已锁定后续操作；请在 Adobe 菜单处理 PR 未决操作');
  }finally{this.busy=false;}
 }
}
module.exports={PremiereBridge};
