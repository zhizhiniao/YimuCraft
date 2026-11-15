// Persistent derived videos: source references locate content-addressed artifacts.
const fs=require('node:fs'),fsp=fs.promises,path=require('node:path'),crypto=require('node:crypto');
const requests=new Map(),builds=new Map();
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
const signature=st=>JSON.stringify([st.size,st.mtimeMs,st.dev,st.ino,st.birthtimeMs]);
async function json(file){try{return JSON.parse(await fsp.readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT'||e instanceof SyntaxError)return null;throw e;}}
async function valid(base,key,recipe){
 const manifest=await json(path.join(base,'manifest.json'));
 if(!manifest||manifest.key!==key||manifest.recipe!==recipe||!['preview.webm','preview.mp4'].includes(manifest.preview))return null;
 for(const name of ['cover.png',manifest.preview]){try{const st=await fsp.stat(path.join(base,name));if(!st.isFile()||st.size<=0||st.size!==manifest.files?.[name]?.size||st.mtimeMs!==manifest.files[name].mtimeMs)return null;}catch(e){if(e.code==='ENOENT')return null;throw e;}}
 return {cover:path.join(base,'cover.png'),preview:path.join(base,manifest.preview),cacheHit:true};
}
async function writeJson(file,value){await fsp.mkdir(path.dirname(file),{recursive:true});const tmp=file+'.'+crypto.randomUUID()+'.tmp';try{await fsp.writeFile(tmp,JSON.stringify(value));await fsp.rename(tmp,file);}finally{await fsp.rm(tmp,{force:true});}}
async function ensure(asset,folder,render,progress=()=>{}){
 const file=path.resolve(asset.path),before=await fsp.stat(file);if(!before.isFile())throw Error('原素材不是文件');
 const sig=signature(before),recipe=JSON.stringify(['video-preview',1,require('ffmpeg-static/package.json').version,/\.mov$/i.test(file)?'vp9-alpha-720':'h264-720']);
 const reference=path.join(folder,'video-sources',digest(JSON.stringify([file.toLowerCase(),sig,recipe]))+'.json');
 if(requests.has(reference))return requests.get(reference);
 const request=(async()=>{
  const old=await json(reference);
  if(old?.signature===sig&&old.recipe===recipe&&/^[a-f0-9]{64}$/.test(old.key)){const found=await valid(path.join(folder,'derived-video',old.key),old.key,recipe);if(found)return found;}
  // Only new/suspect source revisions are hashed; warm opens read small records.
  const hash=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(file))hash.update(chunk);const sourceHash=hash.digest('hex');
  if(signature(await fsp.stat(file))!==sig)throw Error('原文件已改变，请重新预览');
  const key=digest(JSON.stringify([sourceHash,recipe])),base=path.join(folder,'derived-video',key);
  if(!builds.has(base)){const build=(async()=>{
   const found=await valid(base,key,recipe);if(found)return found;
   progress({phase:'正在生成兼容预览'});const result=await render(asset,folder,progress),temporary=path.dirname(result.preview);
   try{
    if(signature(await fsp.stat(file))!==sig)throw Error('原文件已改变，请重新预览');
    const preview=path.basename(result.preview),files={};for(const name of ['cover.png',preview]){const st=await fsp.stat(path.join(temporary,name));if(!st.size)throw Error('生成的预览为空');files[name]={size:st.size,mtimeMs:st.mtimeMs};}
    await writeJson(path.join(temporary,'manifest.json'),{key,recipe,sourceHash,preview,files});await fsp.mkdir(path.dirname(base),{recursive:true});
    // Keep invalid completed artifacts for diagnosis; only publish a completed dir.
    try{await fsp.rename(base,base+'.invalid-'+crypto.randomUUID());}catch(e){if(e.code!=='ENOENT')throw e;}
    await fsp.rename(temporary,base);return {cover:path.join(base,'cover.png'),preview:path.join(base,preview),cacheHit:false};
   }catch(e){await fsp.rm(temporary,{recursive:true,force:true});throw e;}
  })();builds.set(base,build);build.finally(()=>builds.delete(base)).catch(()=>{});}
  const result=await builds.get(base);if(signature(await fsp.stat(file))!==sig)throw Error('原文件已改变，请重新预览');
  await writeJson(reference,{signature:sig,recipe,key,sourceHash});return result;
 })();requests.set(reference,request);try{return await request;}finally{requests.delete(reference);}
}
module.exports={ensure};
