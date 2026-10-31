const fs=require('node:fs/promises'),path=require('node:path'),{spawn}=require('node:child_process');
const defaults=[
 {id:'codex',name:'Codex',process:'ChatGPT',pathHint:'OpenAI.Codex',title:'',format:'image'},
 {id:'claude',name:'Claude',process:'claude',pathHint:'',title:'',format:'image'},
 {id:'workbuddy',name:'WorkBuddy',process:'WorkBuddy',pathHint:'',title:'',format:'image'},
 {id:'jimeng',name:'即梦',process:'chrome',pathHint:'',title:'即梦',format:'image'}
];
function validateTargets(value){
 if(!Array.isArray(value)||value.length>20)throw Error('最多设置 20 个目标');
 const ids=new Set();return value.map(t=>{const r={};for(const key of ['id','name','process','pathHint','title']){if(typeof t?.[key]!=='string'||t[key].length>(key==='pathHint'?512:160)||/[\r\n\0]/.test(t[key]))throw Error('发送目标设置无效');r[key]=t[key].trim();}
 if(!r.id||ids.has(r.id)||!r.name||!r.process||!/^[-\w. ]+$/.test(r.process))throw Error('发送目标名称或程序无效');ids.add(r.id);r.format=t.format==='files'?'files':'image';return r;});
}
function helper(request){return new Promise((resolve,reject)=>{
 const child=spawn(path.join(__dirname,'native','YimuTransfer.exe').replace(/app\.asar([\\/])/,'app.asar.unpacked$1'),[],{windowsHide:true,stdio:['pipe','pipe','pipe']});let output='',error='',finished=false;
 const end=(e,v)=>{if(finished)return;finished=true;clearTimeout(timer);e?reject(e):resolve(v);};const timer=setTimeout(()=>{child.kill();end(Error('目标窗口响应超时；没有发送聊天消息'));},15000);
 child.on('error',e=>end(e));child.stdout.on('data',b=>{output+=b;if(output.length>1000000){child.kill();end(Error('目标窗口列表过大'));}});child.stderr.on('data',b=>error=(error+b).slice(-2000));child.on('close',code=>{try{if(code)throw Error(error||'无法操作目标窗口');const r=JSON.parse(output);if(r.error)throw Error(r.error);end(null,r);}catch(e){end(e);}});child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify(request));
 });}
class CanvasTransfer {
 constructor(folder){this.file=path.join(folder,'send-targets.json');}
 async targets(){try{return validateTargets(JSON.parse(await fs.readFile(this.file,'utf8')));}catch(e){if(e.code==='ENOENT')return structuredClone(defaults);throw Error('发送目标设置无法读取，请重新保存设置');}}
 async save(targets){const value=validateTargets(targets);await fs.mkdir(path.dirname(this.file),{recursive:true});await fs.writeFile(this.file+'.tmp',JSON.stringify(value,null,2));await fs.rename(this.file+'.tmp',this.file);return value;}
 async windows(){return (await helper({action:'windows'})).windows;}
 async send(id,files){const target=(await this.targets()).find(t=>t.id===id);if(!target)throw Error('发送目标已移除');if(!files.length||files.length>100)throw Error('请选择 1–100 个素材文件');return helper({action:'send',target,files});}
}
module.exports={CanvasTransfer,validateTargets,defaults};
