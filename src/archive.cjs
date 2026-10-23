const fs=require('node:fs'),fsp=fs.promises,path=require('node:path'),crypto=require('node:crypto');const {pipeline}=require('node:stream/promises');const yazl=require('yazl'),yauzl=require('yauzl');
function entryPath(root,name){if(typeof name!=='string'||name.startsWith('/')||name.includes('\\')||name.split('/').some(p=>p==='..'||p==='.'||/[<>:"|?*\x00-\x1f]/.test(p)||/[. ]$/.test(p)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p)))throw Error('ZIP 路径无效：'+name);const p=path.resolve(root,name),rel=path.relative(root,p);if(rel.startsWith('..')||path.isAbsolute(rel))throw Error('ZIP 路径越界');return p;}
async function zipFolder(folder,destination,progress=()=>{}){
  if(fs.existsSync(destination))throw Error('目标 ZIP 已存在');const temporary=destination+'.partial-'+crypto.randomUUID();const zip=new yazl.ZipFile();const writing=pipeline(zip.outputStream,fs.createWriteStream(temporary,{flags:'wx'}));zip.on('error',e=>zip.outputStream.destroy(e));
  try{let count=0;const stack=[folder];while(stack.length){const dir=stack.pop();for(const item of await fsp.readdir(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isSymbolicLink())throw Error('不能打包符号链接');if(item.isDirectory())stack.push(p);else if(item.isFile()){zip.addFile(p,path.relative(folder,p).split(path.sep).join('/'));count++;}}}zip.end();await writing;await require('./rename-retry.cjs').renameRetry(temporary,destination);progress({phase:'ZIP 打包完成',count});return {path:destination,files:count};}catch(e){zip.outputStream.destroy();await writing.catch(()=>{});await fsp.rm(temporary,{force:true});throw e;}
}
async function unzip(file,destination,progress=()=>{}){
  if(fs.existsSync(destination))throw Error('解压目标已存在');await fsp.mkdir(destination,{recursive:true});let zip;
  try{
    zip=await new Promise((resolve,reject)=>yauzl.open(file,{lazyEntries:true,strictFileNames:true},(e,z)=>e?reject(e):resolve(z)));
    let size=0,count=0;const names=new Set();
    await new Promise((resolve,reject)=>{let failed=false;const fail=e=>{if(failed)return;failed=true;zip.close();reject(e);};zip.on('error',fail);zip.on('end',resolve);zip.on('entry',async entry=>{try{
      const p=entryPath(destination,entry.fileName);if((entry.externalFileAttributes>>>16&0xf000)===0xa000)throw Error('ZIP 不接受符号链接');if(entry.generalPurposeBitFlag&1)throw Error('暂不支持加密 ZIP');const lower=entry.fileName.toLowerCase();if(names.has(lower))throw Error('ZIP 含重复路径');names.add(lower);size+=entry.uncompressedSize;count++;if(count>200000||size>100*1024**3)throw Error('ZIP 超过 20 万项或 100 GB 安全上限');
      if(entry.fileName.endsWith('/'))await fsp.mkdir(p,{recursive:true});else{await fsp.mkdir(path.dirname(p),{recursive:true});const stream=await new Promise((res,rej)=>zip.openReadStream(entry,(e,s)=>e?rej(e):res(s)));await pipeline(stream,fs.createWriteStream(p,{flags:'wx'}));}
      progress({phase:'解压 ZIP',count,total:zip.entryCount});if(!failed)zip.readEntry();
    }catch(e){fail(e);}});zip.readEntry();});return {path:destination,count};
  }catch(e){zip?.close();await fsp.rm(destination,{recursive:true,force:true});throw e;}
}
module.exports={zipFolder,unzip,entryPath};
