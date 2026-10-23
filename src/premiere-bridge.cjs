const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
class PremiereBridge{
 constructor(directory=process.env.YIMU_PR_BRIDGE_DIR||path.join(require('node:os').homedir(),'Documents','YimuCraft','premiere-bridge')){this.directory=directory;fs.mkdirSync(directory,{recursive:true});this.busy=false;}
 async run(operation,payload={}){
  if(this.busy)throw Error('PR 操作正在执行');if(!['inspect','import','mogrt','lut','lutAdjustment','collectCurrent','openProject','fixture'].includes(operation))throw Error('不支持的 PR 操作');
  let heartbeat;try{heartbeat=JSON.parse(fs.readFileSync(path.join(this.directory,'heartbeat.json'),'utf8'));}catch{}
  if(!heartbeat||Date.now()-heartbeat.time>5000)throw Error('请在 PR 的“窗口→扩展”中打开“一幕 YimuCraft”面板');
  this.busy=true;const id=crypto.randomUUID(),request=path.join(this.directory,id+'.request.json'),response=path.join(this.directory,id+'.response.json');
  try{fs.writeFileSync(request+'.tmp',JSON.stringify({id,time:Date.now(),operation,payload}));fs.renameSync(request+'.tmp',request);const start=Date.now();while(Date.now()-start<90000){if(fs.existsSync(response)){const r=JSON.parse(fs.readFileSync(response,'utf8'));if(r.id&&r.id!==id)throw Error('PR 回执 ID 不匹配');if(!r.ok)throw Error('PR：'+r.error);return {...r,receipt:response};}await new Promise(r=>setTimeout(r,200));}if(fs.existsSync(request))fs.renameSync(request,request+'.expired');throw Error('PR 未返回回执；请求可能仍在执行，请查看 PR 面板');}finally{this.busy=false;}
 }
}
module.exports={PremiereBridge};
