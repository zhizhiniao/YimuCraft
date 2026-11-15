const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto'),{inside,remap}=require('./cache-index.cjs');
const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
async function removeStaged(stage,target){if(path.resolve(stage)===path.resolve(target)||!inside(stage,target))throw Error('临时缓存清理路径越界');try{const real=await fs.realpath(target),base=await fs.realpath(stage);if(!inside(base,real)||(await fs.lstat(target)).isSymbolicLink())throw Error('临时缓存包含链接');await fs.rm(target,{recursive:true,force:true});}catch(e){if(e.code!=='ENOENT')throw e;}}
async function rebuildLibrary(context){
 const {stage,snapshots,groups,namespace,files,report,stop}=context,available=new Set(files.map(f=>f.relative)),overrides=[];let completed=0;
 for(const snapshot of snapshots){const base=path.join(stage,namespace(snapshot.root));for(const name of ['waveforms','audio-cache'])await removeStaged(stage,path.join(base,name));
  for(const row of snapshot.audio){stop();const key=digest(JSON.stringify([row.path,row.size,row.modified,1])),wave=available.has(path.join(namespace(snapshot.root),'waveforms',key+'.json')),audio=available.has(path.join(namespace(snapshot.root),'audio-cache',key+'.flac'));if(!wave&&!audio)continue;
   if(wave)await require('./audio-waveform.cjs').waveform(row.path,path.join(base,'waveforms'));if(audio)await require('./audio-preview.cjs').ensure(row.path,path.join(base,'audio-cache'));report({phase:'重建音频缓存',count:++completed});
  }
  for(const row of snapshot.rows){stop();if(row.kind!=='video'||!row.preview||!groups.some(g=>inside(g.from,row.preview)))continue;
   const stagedPreview=remap(row.preview,groups.map(g=>({from:g.from,to:path.join(stage,g.relative)}))),dir=path.dirname(stagedPreview);
   if(/^[a-f0-9]{64}$/i.test(path.basename(dir))&&path.basename(path.dirname(dir))==='derived-video')await removeStaged(stage,dir);else try{await fs.unlink(stagedPreview);}catch(e){if(e.code!=='ENOENT')throw e;}
   const result=await require('./media-preview.cjs').generate(row,path.join(base,'previews'),report),override={root:snapshot.root,id:row.id,preview:result.preview};
   if(!row.cover_override||path.dirname(row.cover_override)===path.dirname(row.preview))override.cover_override=result.cover;overrides.push(override);report({phase:'重建视频预览',count:++completed});
  }
 }
 return overrides;
}
async function rebuildCanvas(context,items,thumbnail){
 const {stage,files,report,stop}=context,available=new Set(files.map(f=>f.relative));for(const name of ['previews','thumbnails'])await removeStaged(stage,path.join(stage,name));
 const previews=new (require('./canvas-preview-media.cjs').CanvasPreviewMedia)(path.join(stage,'previews'));let completed=0;
 try{for(const item of items){stop();const key=digest(JSON.stringify([item.file,item.size,item.modified,item.kind,1])),ext=item.kind==='image'?'png':item.kind==='audio'?'flac':'mp4',thumb=digest(item.file+'|'+item.size+'|'+item.modified);let generated=false;
   if(available.has(path.join('previews',key+'.'+ext))){await previews.ensure(item.file,item.kind);generated=true;}
   if(available.has(path.join('thumbnails',thumb+'.jpg'))){await fs.mkdir(path.join(stage,'thumbnails'),{recursive:true});await fs.writeFile(path.join(stage,'thumbnails',thumb+'.jpg'),await thumbnail(item.file));generated=true;}
   if(generated)report({phase:'重建项目画布缓存',count:++completed});
  }}finally{await previews.close();}return [];
}
module.exports={rebuildLibrary,rebuildCanvas};
