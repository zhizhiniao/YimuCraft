const crypto=require('node:crypto');
const {similarity}=require('./visual-features.cjs');
const query=require('./discovery-query.js');
const mediaFields=['relative','sourceId','ext','size','modified','identity','pixelWidth','pixelHeight','dimensionChecked','missing'];
function syncReferences(board){for(const row of Object.values(board.items)){if(!row.referenceId)continue;const source=board.items[row.referenceId];if(!source){row.missing=true;continue;}for(const key of mediaFields)row[key]=source[key];row.missing=!!source.missing||!!source.hiddenAt;}}
function candidateGroup(store,id,ids,name){
 if(!Array.isArray(ids)||!ids.length||ids.length>200||ids.some(i=>typeof i!=='string')||typeof name!=='string'||!name.trim()||name.trim().length>80)throw Error('请选择 1–200 项，并填写 1–80 字组名');
 return store.transaction(id,b=>buildCandidateGroup(b,ids,name));
}
function buildCandidateGroup(b,ids,name){
  if(b.removedAt)throw Error('仓库已移除');
  const rows=[...new Set(ids)].map(id=>Object.hasOwn(b.items,id)?b.items[id]:null);
  if(rows.some(i=>!i||i.hiddenAt||i.missing||i.referenceId||!['image','video','audio','project','document'].includes(i.kind)))throw Error('部分素材不可用，请重新选择');
  const others=Object.values(b.items).filter(i=>i.admitted&&!i.hiddenAt),right=Math.max(0,...others.map(i=>i.x+i.width));
  const x=right+100,y=0,cols=Math.min(4,rows.length),width=cols*280+32,height=Math.ceil(rows.length/cols)*240+72;
  if(x+width>100000)throw Error('画布右侧空间不足，请先整理画布');
  const group={id:crypto.randomUUID(),kind:'group',name:name.trim(),text:'',x,y,width,height,color:'#b78c66',group:'候选素材',tags:[],status:'pending',hiddenAt:null,history:[],admitted:true,parentId:null,sizeMode:'manual',added:Date.now(),discovery:true};
  b.items[group.id]=group;b.groups['候选素材']??={x,y};const created=[];
  rows.forEach((source,index)=>{const row={...structuredClone(source),id:crypto.randomUUID(),referenceId:source.id,x:x+28+(index%cols)*280,y:y+48+Math.floor(index/cols)*240,width:256,height:190,sizeMode:'manual',parentId:group.id,group:'候选素材',history:[],admitted:true,hiddenAt:null,added:Date.now()};delete row.sequenceId;b.items[row.id]=row;created.push(row.id);});
  group.candidateIds=created;return {createdId:group.id};
}
async function libraryCandidateGroup(store,id,assets,name,validate=()=>{}){
 const fs=require('node:fs/promises'),path=require('node:path'),{fileKind}=require('./project-canvas.cjs');
 if(!assets.length||assets.length>200||typeof name!=='string'||!name.trim()||name.trim().length>80)throw Error('请选择素材并填写 1–80 字组名');
 const files=[];
 for(const a of assets){const file=await fs.realpath(a.path),st=await fs.stat(file),kind=fileKind(file);if(a.hidden||!st.isFile()||!kind)throw Error('部分素材不可用');files.push({asset:a,file,st,kind});}
 return store.transaction(id,b=>{
  validate();const ids=[];
  for(const {asset,file,st,kind} of files){
   let row=Object.values(b.items).find(i=>!i.referenceId&&!i.hiddenAt&&i.sourceId&&store.rawPath(b,i).toLowerCase()===file.toLowerCase());
   if(!row){const source={id:crypto.randomUUID(),path:file,type:'file'};b.sources.push(source);
    row={id:crypto.randomUUID(),sourceId:source.id,relative:path.basename(file),name:asset.name,kind,ext:asset.ext,size:st.size,modified:st.mtimeMs,tags:asset.tags||[],text:asset.note||'',status:'pending',x:0,y:0,width:256,height:190,group:'候选素材',admitted:false,hiddenAt:null,parentId:null,sizeMode:'manual',history:[],added:Date.now()};b.items[row.id]=row;
   }
   row.missing=false;ids.push(row.id);
  }
  return buildCandidateGroup(b,ids,name);
 });
}
function undoCandidateGroup(store,id,groupId){return store.transaction(id,b=>{const group=b.items[groupId];if(!group?.discovery||group.hiddenAt)throw Error('候选组已改变');const children=Object.values(b.items).filter(i=>i.parentId===groupId&&!i.hiddenAt);if(children.length!==group.candidateIds.length||children.some(i=>!group.candidateIds.includes(i.id)||!i.referenceId))throw Error('候选组成员已变化，请在画布中处理');for(const i of children){i.hiddenAt=Date.now();i.history.push({action:'undo-candidate',at:Date.now()});}group.hiddenAt=Date.now();});}
function visualSearch(store){
 let current=null;const cache=new Map();
 async function pixels(file){const fs=require('node:fs/promises'),stat=await fs.stat(file),key=file+'|'+stat.size+'|'+stat.mtimeMs;if(cache.has(key))return cache.get(key);const result=Array.from(await require('sharp')(file,{limitInputPixels:50000000}).rotate().resize(8,8,{fit:'fill'}).ensureAlpha().raw().toBuffer());if(result.length!==256)throw Error('图片无法分析');if(cache.size>=2000)cache.delete(cache.keys().next().value);cache.set(key,result);return result;}
 return {cancel(){if(current)current.cancelled=true;},async search(id,input,reference){
  if(current)throw Error('以图查找正在进行');const token={cancelled:false};current=token;
  try{const board=store.snapshot(id);if(board.removedAt)throw Error('仓库已移除');const filtered=query.rows(board,query.normalize(input)).filter(i=>i.kind==='image'&&!i.missing);if(filtered.length>500)throw Error('请先缩小到 500 张图片以内');const base=await pixels(reference.file||await store.resolve(id,reference.id));const ranked=[];let skipped=0;
   for(const row of filtered){if(token.cancelled)throw Error('已取消以图查找');try{const vector=await pixels(await store.resolve(id,row.id));ranked.push({id:row.id,score:similarity(base,vector)});}catch{skipped++;}}
   if(token.cancelled)throw Error('已取消以图查找');ranked.sort((a,b)=>b.score-a.score);return {ids:ranked.map(r=>r.id),skipped};
  }finally{if(current===token)current=null;}
 }};
}
module.exports={syncReferences,candidateGroup,libraryCandidateGroup,undoCandidateGroup,visualSearch};
