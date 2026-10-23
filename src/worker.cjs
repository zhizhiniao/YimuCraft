const {parentPort,workerData}=require('node:worker_threads');
const {Library}=require('./library.cjs');
let library=new Library(workerData.folder);let busy=false,cancelled=false,mutationRevision=0;const semantic=new (require('./semantic.cjs').Semantic)(workerData.models||require('path').join(workerData.folder,'models'));
parentPort.on('message',async ({id,command,args=[]})=>{
  if(command==='cancel'){cancelled=true;parentPort.postMessage({id,result:true});return;}
  if(busy){syncMessages.push({id,command,args});return;}
  busy=true;cancelled=false;
  if(!['query','stats','get','getMany','aiStatus','aiSearch','backup','duplicates','exportAetodo','exportPackage','exportZip'].includes(command))mutationRevision++;
  try{if(!['receiveAEPackages','attachLibrary','collectPremiere','removePermanent','synchronize','query','stats','get','getMany','update','importPaths','importManaged','importAetodo','exportAetodo','exportPackage','exportZip','importZip','importPackage','relink','saveCollection','deleteCollection','assignCollection','setCover','backup','switchLibrary','restoreLibrary','renameTag','touch','duplicates','setPreview','indexVisual','rename','moveFolder','createFolder','removeEmptyFolder','setFolderIcon','setFolderAppearance','setCollectionAppearance','aiStatus','aiInstall','aiIndex','aiSearch','aiTag'].includes(command))throw Error('未知命令');const report=p=>parentPort.postMessage({progress:p});let result;
    if(command==='receiveAEPackages')result=await require('./ae-package-inbox.cjs').receive(library,report);
    else if(command==='attachLibrary'){const replacement=new Library(args[1]);try{const linked=await require('./existing-library.cjs').attach(replacement,args[0],report);result={...replacement.stats(),...linked};}catch(e){replacement.close();throw e;}library.close();library=replacement;watchLibrary();}
    else if(command==='switchLibrary'||command==='restoreLibrary'){if(command==='restoreLibrary')await Library.restoreBackup(args[0],args[1]);const replacement=new Library(command==='restoreLibrary'?args[1]:args[0]);try{result=replacement.stats();}catch(e){replacement.close();throw e;}library.close();library=replacement;watchLibrary();}
    else if(command==='collectPremiere')result=await require('./premiere-collect.cjs').collectCurrent(library,args[0],args[1],report);
    else if(command==='removePermanent')result=await library.removePermanent(args[0],report);
    else if(command==='aiStatus')result=semantic.status(library);
    else if(command==='aiInstall'){await semantic.load(report,true);result={...semantic.status(library),message:'本地 AI 模型已就绪'};}
    else if(command==='aiIndex')result=await semantic.index(library,report,()=>cancelled,args[0]);
    else if(command==='aiSearch')result=await semantic.search(library,args[0],report);
    else if(command==='aiTag')result=await semantic.tag(library,args[0],args[1],report,()=>cancelled);
    else if(command==='moveFolder')result=await library.moveFolder(args[0],args[1],{...args[2],report});
    else if(command==='importManaged')result=await library.importManaged(args[0],report,()=>cancelled,args[1]);
    else if(command==='importPaths')result=await library.importPaths(args[0],report,()=>cancelled);
    else if(command==='indexVisual')result=await library.indexVisual(report,()=>cancelled);
    else if(command==='duplicates')result=await library.duplicates(report,()=>cancelled);
    else if(command==='importAetodo')result=await library.importAetodo(args[0],report);
    else if(command==='exportAetodo')result=await library.exportAetodo(args[0],args[1],report,args[2]);
    else if(command==='exportPackage')result=await library.exportPackage(args[0],args[1],report,args[2]);
    else if(command==='importPackage')result=await library.importOwnedPackage(args[0],report);
    else if(command==='exportZip')result=await library.exportZip(args[0],args[1],report,args[2]);
    else if(command==='importZip')result=await library.importZip(args[0],report);
    else result=await library[command](...args);
    parentPort.postMessage({id,result});
  }catch(e){parentPort.postMessage({id,error:e.message});}finally{busy=false;if(syncMessages.length)parentPort.emit('message',syncMessages.shift());}
});

let syncQueued=false,syncMessages=[],syncDirty=true,nextSync=0,watchers=[];
function watchLibrary(){for(const watcher of watchers)watcher.close();watchers=[];const fs=require('fs'),path=require('path');for(const name of ['managed','packages']){const root=path.join(library.folder,name);fs.mkdirSync(root,{recursive:true});try{watchers.push(fs.watch(root,{recursive:true},()=>{syncDirty=true;}));}catch{}}syncDirty=true;}
watchLibrary();
setInterval(async()=>{if(busy||syncQueued||(!syncDirty&&Date.now()<nextSync))return;syncQueued=true;syncDirty=false;nextSync=Date.now()+60000;const scanningLibrary=library,scanRevision=mutationRevision;let acquired=false;try{const result=await scanningLibrary.synchronize(()=>{if(busy||library!==scanningLibrary||mutationRevision!==scanRevision)return false;busy=true;acquired=true;return true;});if(result.deferred)syncDirty=true;else if(result.added||result.changed||result.renamed||result.missing)parentPort.postMessage({changed:result});}catch(e){parentPort.postMessage({syncError:e.message});}finally{syncQueued=false;if(acquired){busy=false;if(syncMessages.length)parentPort.emit('message',syncMessages.shift());}}},1500).unref();
