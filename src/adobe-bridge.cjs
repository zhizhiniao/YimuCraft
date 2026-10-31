const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');const {spawn}=require('node:child_process');
function adobeEnvironment(base=process.env){return {...base,OS:base.OS||'Windows_NT',CommonProgramFiles:base.CommonProgramFiles||'C:\\Program Files\\Common Files',CommonProgramW6432:base.CommonProgramW6432||'C:\\Program Files\\Common Files','CommonProgramFiles(x86)':base['CommonProgramFiles(x86)']||'C:\\Program Files (x86)\\Common Files'};}
function discoverAE(){const root=path.join(process.env.ProgramFiles||'C:\\Program Files','Adobe');if(!fs.existsSync(root))return [];return fs.readdirSync(root).filter(n=>n.startsWith('Adobe After Effects')).sort().reverse().map(n=>({name:n,path:path.join(root,n,'Support Files','AfterFX.exe')})).filter(x=>fs.existsSync(x.path));}
class AdobeBridge{
  constructor(directory,options={}){this.directory=path.resolve(directory);fs.mkdirSync(this.directory,{recursive:true});this.executable=options.executable||discoverAE()[0]?.path;this.timeout=options.timeout||120000;this.poll=options.poll||200;this.pending=false;}
  async run(operation,payload={},options={}){
    // Every refresh needs a matching host receipt, never a stale ae-state.json.
    if(this.unresolved){if(fs.existsSync(this.unresolved.receipt)||this.unresolved.exited)this.unresolved=null;else throw Error('上一项 AE 请求尚未结束，请先处理 AE 窗口中的提示。请求：'+this.unresolved.id);}
    if(this.pending)throw Error('AE 正在执行上一项操作，请等待回执');
    if(!this.executable||!fs.existsSync(this.executable))throw Error('未找到 AfterFX.exe，请在 AE 连接设置中选择程序');
    if(!['inspect','import','collectFile','verifyFile','inspectFile','renderPreview','fixture','font','preset','script'].includes(operation))throw Error('不支持的 AE 操作');
    this.pending=true;
    try{
      const isolated=['collectFile','verifyFile','inspectFile','renderPreview','fixture'].includes(operation);
      const launcher=isolated?this.executable:path.join(path.dirname(this.executable),'AfterFX.com');
      if(!fs.existsSync(launcher))throw Error('未找到 AfterFX.com，请修复 AE 安装或重新选择 AE 程序');
      // Keep both routes outside the legacy queue root to prevent double execution.
      const requestDir=path.join(this.directory,isolated?'isolated':'on-demand');fs.mkdirSync(requestDir,{recursive:true});
      const id=crypto.randomUUID(),receipt=path.join(requestDir,id+'.json'),script=path.join(requestDir,id+'.jsx');
      const request={id,operation,payload,receipt,isolated};
      const core=fs.readFileSync(path.join(__dirname,'adobe-host.jsx'),'utf8');
      fs.writeFileSync(script,'var YIMU_REQUEST = '+JSON.stringify(request).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+';\n'+core,'utf8');
      const log=fs.createWriteStream(path.join(this.directory,id+'.log'));let exit=null,spawnError;
      // Dispatch once; no heartbeat, queue polling or project scan runs in idle AE.
      const args=[...(isolated?['-m']:[]),'-r',script];
      const child=spawn(launcher,args,{cwd:path.dirname(this.executable),env:adobeEnvironment(),windowsHide:true,stdio:['ignore','pipe','pipe']});
      // Exiting the launcher does not mean the live host finished the request.
      const outstanding={id,receipt,exited:false};if(child)child.on('exit',()=>{outstanding.exited=isolated;});
      if(child){child.stdout.pipe(log,{end:false});child.stderr.pipe(log,{end:false});child.on('error',e=>{spawnError=e;log.end();});child.on('exit',(code,signal)=>{exit={code,signal};log.end();});}
      const started=Date.now();options.progress?.({phase:'等待 AE 执行',operation});
      while(Date.now()-started<this.timeout){
        if(fs.existsSync(receipt)){
          const result=JSON.parse(fs.readFileSync(receipt,'utf8').replace(/^\uFEFF/,''));
          if(result.id!==id)throw Error('AE 回执与请求不匹配');
          if(isolated&&child){const releaseDeadline=Date.now()+15000;while(!exit&&Date.now()<releaseDeadline)await new Promise(r=>setTimeout(r,100));}
          result.elapsedMs=Date.now()-started;result.receipt=receipt;result.source=isolated?'ae-isolated':'ae-on-demand';
          if(!isolated&&child){child.unref();child.stdout.unref?.();child.stderr.unref?.();}
          if(!child)log.end();
          if(!result.ok)throw Object.assign(Error('AE：'+result.error),{result});
          return result;
        }
        if(spawnError)throw spawnError;
        if(exit&&(isolated||exit.code!==0)&&Date.now()-started>3000){throw Error('AE 已退出但没有回执（退出码 '+exit.code+'）。请检查启动修复窗口、脚本权限。日志：'+path.join(this.directory,id+'.log'));}
        await new Promise(r=>setTimeout(r,this.poll));
      }
      if(!child)log.end();this.unresolved=outstanding;
      if(child){child.unref();child.stdout.unref?.();child.stderr.unref?.();}
      throw Object.assign(Error('AE '+Math.round(this.timeout/1000)+' 秒内未返回结果。请求可能仍在执行，请查看 AE 窗口，勿重复提交。请求：'+id),{pendingNative:{id,receipt,pid:child?child.pid:null,viaPanel:false}});
    }finally{this.pending=false;}
  }
}
module.exports={AdobeBridge,discoverAE,adobeEnvironment};
