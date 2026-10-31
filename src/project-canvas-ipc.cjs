const {app,dialog,ipcMain,nativeImage,shell,clipboard}=require('electron');
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const {ProjectCanvases}=require('./project-canvas.cjs');
async function installProjectCanvas(win){
  const folder=path.join(app.getPath('userData'),'project-canvases');
  const store=await new ProjectCanvases(folder).init();
  const transfer=new (require('./canvas-transfer.cjs').CanvasTransfer)(folder);const prepared=new Map();let nativeDragging=false;
  const transferFiles=(id,ids)=>{if(!Array.isArray(ids)||!ids.length||ids.length>100||ids.some(i=>typeof i!=='string'))throw Error('请选择 1–100 个素材');return store.dragFiles(id,ids);};
  const check=event=>{if(event.sender!==win.webContents||event.senderFrame!==win.webContents.mainFrame)throw Error('无效画布调用');};
  let actionQueue=Promise.resolve();
  const ordered=fn=>{const p=actionQueue.then(fn);actionQueue=p.catch(()=>{});return p;};
  const actions={
    sendTargets:()=>transfer.targets(),saveSendTargets:targets=>transfer.save(targets),sendWindows:()=>transfer.windows(),
    sendTo:async(id,ids,target)=>transfer.send(target,await transferFiles(id,ids)),
    prepareDrag:async(id,ids)=>{const files=await transferFiles(id,ids);const token=crypto.randomUUID();for(const [key,value] of prepared)if(value.until<Date.now())prepared.delete(key);while(prepared.size>=8)prepared.delete(prepared.keys().next().value);prepared.set(token,{files,until:Date.now()+60000});return token;},
    list:()=>store.list(),workspace:value=>store.workspace(value),settings:(id,settings)=>store.settings(id,settings),
    move:(id,changes)=>store.move(id,changes),create:(id,node)=>store.create(id,node),dissolve:(id,group)=>store.dissolve(id,group),connect:(id,from,to,label,anchors)=>store.connect(id,from,to,label,anchors),unlink:(id,line)=>store.unlink(id,line),
    importFiles:async id=>{const r=await dialog.showOpenDialog(win,{title:'选择素材 · 引用原文件',properties:['openFile','multiSelections'],filters:[{name:'图片、视频、音频与工程',extensions:['png','jpg','jpeg','webp','gif','svg','tif','tiff','psd','exr','mp4','mov','webm','mkv','wav','mp3','flac','aep','prproj','blend','pdf','pptx','docx']}]});return r.canceled?null:store.addSources(id,r.filePaths,'file');},
    addSource:async id=>{const r=await dialog.showOpenDialog(win,{title:'添加来源文件夹 · 不复制素材',properties:['openDirectory']});return r.canceled?null:store.addSources(id,r.filePaths,'directory');},
    choose:async()=>{
      const result=await dialog.showOpenDialog(win,{title:'选择项目根目录 · 只引用原文件',properties:['openDirectory']});if(result.canceled)return null;
      const id=await store.attach(result.filePaths[0]);return store.activate(id);
    },
    // Explicit path field is equivalent to choosing a folder; no source files are modified.
    attach:async root=>{const id=await store.attach(root);return store.activate(id);},
    activate:id=>store.activate(id),refresh:id=>store.refresh(id),patch:(id,changes)=>store.patch(id,changes),viewport:(id,view)=>store.viewport(id,view),
    reveal:async(id,item)=>shell.showItemInFolder(await store.resolve(id,item)),
    copyPath:async(id,item)=>clipboard.writeText(await store.resolve(id,item)),
    open:async(id,item)=>{const file=await store.resolve(id,item);require('./safe-open.cjs').assertSafeOpen(file);const err=await shell.openPath(file);if(err)throw Error(err);}
  };
  ipcMain.handle('canvas-command',async(event,name,...args)=>{check(event);if(!Object.hasOwn(actions,name))throw Error('未知画布操作');return ordered(()=>actions[name](...args));});
  store.on('changed',board=>{if(!win.isDestroyed())win.webContents.send('canvas-changed',board);});
  store.on('error-state',error=>{if(!win.isDestroyed())win.webContents.send('canvas-error',error);});
  ipcMain.on('canvas-drag',async(event,token)=>{
    let started=false,error;try{check(event);if(typeof token!=='string'||token.length>64)throw Error('无效拖放请求');if(nativeDragging)throw Error('已有文件正在拖动');const ready=prepared.get(token);prepared.delete(token);if(!ready||ready.until<Date.now())throw Error('文件尚未准备好，请重新拖动');
      const files=ready.files;if(!files.length||files.some(f=>!require('node:fs').existsSync(f)))throw Error('原文件已移走，请同步后重试');
      // Invoke synchronously from the trusted HTML dragstart IPC. No filesystem
      // await, pointer-move handoff or simulated key/mouse input before this call.
      nativeDragging=true;started=true;
      await event.sender.startDrag({files,icon:nativeImage.createFromPath(path.join(__dirname,'tray.png')).resize({width:32,height:32})});
    }catch(e){error=e.message;if(!win.isDestroyed())win.webContents.send('canvas-error',error);}
    finally{if(started)nativeDragging=false;if(!win.isDestroyed()&&event.sender===win.webContents)win.webContents.send('canvas-drag-ended',{token,error});}
  });
  let thumbQueue=Promise.resolve();const pending=new Map();const cache=path.join(folder,'thumbnails');await fs.mkdir(cache,{recursive:true});
  async function thumbnail(boardId,itemId){
    const file=await store.resolve(boardId,itemId),st=await fs.stat(file),hash=crypto.createHash('sha256').update(file+'|'+st.size+'|'+st.mtimeMs).digest('hex');
    const destination=path.join(cache,hash+'.jpg');try{await fs.access(destination);return destination;}catch{}
    if(!pending.has(hash)){
      const task=thumbQueue.then(async()=>{const preview=await nativeImage.createThumbnailFromPath(file,{width:520,height:390});if(preview.isEmpty())throw Error('此格式没有可用缩略图');await fs.writeFile(destination,preview.toJPEG(83));return destination;});
      thumbQueue=task.catch(()=>{});pending.set(hash,task);task.finally(()=>pending.delete(hash)).catch(()=>{});
    }
    return pending.get(hash);
  }
  return {store,async close(){await actionQueue;await store.close();},async response(url,request){
    const [boardId,itemId,type]=url.pathname.slice(1).split('/');
    const file=type==='thumb'?await thumbnail(boardId,itemId):type==='file'?await store.resolve(boardId,itemId):null;
    if(!file)return new Response('Not found',{status:404});return require('./media-response.cjs').mediaResponse(file,request);
  }};
}
module.exports={installProjectCanvas};
