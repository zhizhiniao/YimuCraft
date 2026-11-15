const {dialog,shell,nativeImage}=require('electron');
function createCacheActions({locations,getWindow,getCanvas,command,media,canChange,report,changed}){
 let busy=false;const tasks=new Set();
 const actions={
  cacheInfo:()=>locations.info(),
  cacheChoose:async kind=>{if(!['library','canvas'].includes(kind))throw Error('缓存分类无效');const info=locations.info()[kind],r=await dialog.showOpenDialog(getWindow(),{title:kind==='library'?'选择所有素材库共用的缓存文件夹':'选择项目画布缓存文件夹',defaultPath:info.path||info.defaultPath,properties:['openDirectory']});return r.canceled?null:{kind,destination:r.filePaths[0]};},
  cacheOpen:async kind=>{const info=locations.info()[kind];if(!info)throw Error('缓存分类无效');const folder=info.path||(kind==='library'?info.active[0]?.path:info.defaultPath);if(!folder)throw Error('暂无缓存目录');const error=await shell.openPath(folder);if(error)throw Error(error);return true;},
  cacheCancel:()=>{locations.cancel();return true;},
  cacheChange:async input=>{if(busy)throw Error('正在处理缓存');canChange();busy=true;let pausedCanvas=false;
   try{await command('cacheFreeze',true);require('./audio-waveform.cjs').dispose();require('./audio-preview.cjs').dispose();await Promise.allSettled(tasks);require('./audio-preview.cjs').resume();
    const canvas=getCanvas();if(input.kind==='canvas'&&canvas){await canvas.pauseCache();pausedCanvas=true;}
    const items=canvas?.cacheItems()||[],result=await locations.change({...input,protectedFiles:items.map(i=>i.file),report,rebuild:context=>context.kind==='library'?require('./cache-rebuild.cjs').rebuildLibrary(context):require('./cache-rebuild.cjs').rebuildCanvas(context,items,async file=>{const image=await nativeImage.createThumbnailFromPath(file,{width:520,height:390});if(image.isEmpty())throw Error('无法重建缩略图：'+file);return image.toJPEG(83);})});media.clear();return result;
   }finally{require('./audio-preview.cjs').resume();try{if(pausedCanvas)await getCanvas().resumeCache();}finally{try{await command('cacheFreeze',false);}finally{busy=false;changed();}}}
  }
 };
 return {actions,get busy(){return busy;},invoke(name,fn){if(busy&&!['cacheInfo','cacheCancel'].includes(name))throw Error('正在切换缓存目录，请等待完成');const task=Promise.resolve().then(fn);if(['audioWaveform','audioPreview','generatePreview','setCover','lutReference','aePreview'].includes(name)){tasks.add(task);task.finally(()=>tasks.delete(task)).catch(()=>{});}return task;}};
}
module.exports={createCacheActions};
