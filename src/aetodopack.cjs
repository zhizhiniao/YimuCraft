const fs=require('node:fs'),p=fs.promises,path=require('node:path'),crypto=require('node:crypto');
const {zipFolder,unzip}=require('./archive.cjs');
// Observed v3/v4 wire format: ZIP + UTF-8 metadata with XOR 0x30 on UTF-16 code units.
// This module is independently implemented; it does not load any Aetodo code.
function transform(text){let result='';for(let i=0;i<text.length;i++)result+=String.fromCharCode(text.charCodeAt(i)^0x30);return result;}
function component(value){if(typeof value!=='string'||!value||/[<>:"/\\|?*\x00-\x1f]/.test(value)||/[. ]$/.test(value)||value==='.'||value==='..'||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(value))throw Error('素材包包含无效名称');return value;}
async function importPack(lib,file,report=()=>{}){
 const {hash,safeJoin}=require('./library.cjs'),root=path.join(lib.folder,'packages',crypto.randomUUID());
 await unzip(file,root,report);
 try{
  const meta=path.join(root,'metadata');if((await p.stat(meta)).size>32*1024*1024)throw Error('素材包元数据过大');const data=JSON.parse(transform(await p.readFile(meta,'utf8'))),c=data.catalog;
  if(!c||![2,'2.0',3,4].includes(c.version)||c.packType!=='single'||!Array.isArray(c.allTree)||!Array.isArray(data.source))throw Error('目前支持 Aetodo v2/v3/v4 单库素材包');
  if(c.allTree.length>10000||data.source.length>200000)throw Error('素材包记录过多');component(c.title);
  const tree=new Map(),dirs=new Map();for(const n of c.allTree){if(!Number.isSafeInteger(n.id)||tree.has(n.id))throw Error('素材包分类编号无效');component(n.title);tree.set(n.id,n);}
  function dir(id,seen=new Set()){if(dirs.has(id))return dirs.get(id);if(seen.has(id)||!tree.has(id))throw Error('素材包分类循环或缺失');seen.add(id);const n=tree.get(id),value=tree.has(n.pid)?dir(n.pid,seen)+'/'+n.title:n.title;dirs.set(id,value);return value;}
  for(const id of tree.keys())dir(id);
  const files=[];async function walk(d){for(const e of await p.readdir(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory())await walk(f);else{const st=await p.stat(f);files.push({path:path.relative(root,f).split(path.sep).join('/'),size:st.size,sha256:await hash(f)});}}}await walk(root);const names=new Set(files.map(f=>f.path));
  const assets=data.source.map(s=>{component(s.filename);component(s.ext);component(s.filetype);component(s.uuid);let rel=dir(s.termId)+'/'+s.filename+'.'+(s.filetype==='seq'?s.ext:s.filetype);if([2,'2.0'].includes(c.version)){component(c.packUUID);const leaf=s.filename+'.'+s.filetype;const candidates=[c.packUUID+'/'+s.uuid+'/'+leaf,c.packUUID+'/'+s.uuid+'/'+tree.get(s.termId).title+'/'+leaf];rel=candidates.find(n=>names.has(n))||rel;}safeJoin(root,rel);if(!names.has(rel))throw Error('素材包缺少文件：'+rel);const related=[...names].filter(n=>n.startsWith(s.uuid+'/')||([2,'2.0'].includes(c.version)&&n.startsWith(c.packUUID+'/'+s.uuid+'/')&&n!==rel));const cover=related.find(n=>/\.(png|jpe?g|webp|gif)$/i.test(n))||null,preview=related.find(n=>/\.(mp4|mov|webm|wav|mp3|ogg|flac|m4a|aac)$/i.test(n))||null;let tags=[];if(Array.isArray(s.yimuTags))tags=s.yimuTags;else if(typeof s.tag==='string')tags=s.tag.split(/[,，|]/).map(t=>t.trim()).filter(Boolean);return {premiereCollected:s.yimuPremiereCollected===true,path:rel,cover,preview,tags,rating:Number(s.star)||0,favorite:!!s.yimuFavorite,note:typeof s.yimuNote==='string'?s.yimuNote:'',sourceUrl:s.yimuSourceURL,collections:s.yimuCollections===undefined?[s.termId]:s.yimuCollections,bundleFolder:s.yimuBundleFolder||(['aep','aepx','prproj'].includes(s.ext.toLowerCase())?path.posix.dirname(rel):null)};});
  const manifest={format:'yimucraft-package',version:2,files,assets,collections:c.allTree.map(n=>({id:n.id,name:n.title,parent:tree.has(n.pid)?n.pid:null}))};
  await p.writeFile(path.join(root,'yimucraft.json'),JSON.stringify(manifest));const result=await lib.importPackage(root,report);return {...result,path:root,format:'aetodopack',version:c.version};
 }catch(e){await p.rm(root,{recursive:true,force:true});throw e;}
}
async function exportPack(lib,ids,destination,report=()=>{},overrides={}){
 const {hash}=require('./library.cjs'),owned=path.join(lib.folder,'package-staging',crypto.randomUUID()),stage=path.join(owned,'zip'),intermediate=path.join(owned,'source');await p.mkdir(stage,{recursive:true});
 try{await lib.exportPackage(ids,intermediate,report,overrides);const manifest=JSON.parse(await p.readFile(path.join(intermediate,'yimucraft.json'),'utf8')),title='YimuCraft',allTree=[{id:1,pid:0,title,counts:0}],source=[],collectionIds=new Map(),collectionPaths=new Map(),occupied=new Set(),directories=new Set([title.toLowerCase()]);
  function collection(id){if(collectionIds.has(id))return collectionIds.get(id);const c=manifest.collections.find(c=>c.id===id);if(!c)return 1;const parent=c.parent?collection(c.parent):1,n=allTree.length+1;component(c.name);collectionIds.set(id,n);const directory=(collectionPaths.get(parent)||title)+'/'+c.name;if(directories.has(directory.toLowerCase()))throw Error('分类名称在 Windows 路径中冲突：'+directory);directories.add(directory.toLowerCase());collectionPaths.set(n,directory);allTree.push({id:n,pid:parent,title:c.name,counts:0});return n;}
  manifest.collections.forEach(c=>collection(c.id));
  for(const [i,a] of manifest.assets.entries()){
   const uuid=crypto.randomUUID().replaceAll('-',''),name=path.basename(a.path),ext=path.extname(name).slice(1).toLowerCase();if(!ext)throw Error('Aetodo 素材包暂不支持无扩展名文件，请改用一幕 ZIP：'+name);let id=a.collections.length?collection(a.collections[0]):1,relative=collectionPaths.get(id)||title;
   const bucket=path.dirname(a.path),contents=manifest.files.filter(f=>f.path.startsWith(bucket+'/'));
   if(contents.length>1||occupied.has((relative+'/'+name).toLowerCase())){const base=String(i+1)+'_'+path.basename(name,path.extname(name));let folder=base,suffix=2;while(directories.has((relative+'/'+folder).toLowerCase()))folder=base+'_'+suffix++;const parent=id;id=allTree.length+1;allTree.push({id,pid:parent,title:folder,counts:0});relative+='/'+folder;directories.add(relative.toLowerCase());collectionPaths.set(id,relative);}
   occupied.add((relative+'/'+name).toLowerCase());const target=path.join(stage,relative);await p.mkdir(target,{recursive:true});for(const entry of await p.readdir(path.join(intermediate,bucket)))await p.cp(path.join(intermediate,bucket,entry),path.join(target,entry),{recursive:true,errorOnExist:true,force:false});allTree.find(t=>t.id===id).counts++;
   for(const f of [a.cover,a.preview].filter(Boolean)){const preview=path.join(stage,uuid,path.basename(name,path.extname(name))+'_preview'+path.extname(f));await p.mkdir(path.dirname(preview),{recursive:true});await p.copyFile(path.join(intermediate,f),preview);}
   const file=path.join(intermediate,a.path),stat=await p.stat(file),{width,height,duration}=await require('./media-metadata.cjs').inspect(file);
   source.push({yimuPremiereCollected:a.premiereCollected===true,uuid,hash:await hash(file),termId:id,filename:path.basename(name,path.extname(name)),ext,filetype:ext,width,height,size:stat.size,duration,aspect:height?width/height:0,star:a.rating,tag:a.tags.join(','),visible:1,comp_type:1,yimuTags:a.tags,yimuFavorite:a.favorite,yimuNote:a.note,yimuSourceURL:a.sourceUrl,yimuCollections:a.collections.map(collection),yimuBundleFolder:a.bundleFolder?path.posix.join(relative,path.posix.relative(bucket,a.bundleFolder)):null});
  }
  await p.writeFile(path.join(stage,'metadata'),transform(JSON.stringify({catalog:{version:4,packType:'single',packUUID:crypto.randomUUID(),intro:'',title,selectTreeId:1,allTree},source})),'utf8');const result=await zipFolder(stage,destination,report);return {...result,count:ids.length};
 }finally{await p.rm(owned,{recursive:true,force:true});}
}
module.exports={importPack,exportPack,transform};
