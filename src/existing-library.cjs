// Independent, read-only adapter. Media remains in the selected library;
// all YimuCraft metadata and caches live in a separate index directory.
const fs=require('node:fs'),path=require('node:path'),{DatabaseSync,backup}=require('node:sqlite');
function detect(folder){return fs.existsSync(path.join(folder,'data','aetodo.db'));}
function component(value){value=String(value||'');if(!value||/[<>:"/\\|?*\x00-\x1f]/.test(value)||value==='.'||value==='..')throw Error('已有库包含无效文件或分类名称');return value;}
async function attach(lib,source,report=()=>{}){
 source=path.resolve(source);if(!detect(source))throw Error('未识别的已有素材库');
 const marker=path.join(lib.folder,'linked-library.json');
 if(fs.existsSync(marker)){if(JSON.parse(fs.readFileSync(marker)).source!==source)throw Error('已有库索引来源不匹配');return {count:lib.stats().total,reused:true};}
 if(lib.stats().total)throw Error('请为已有库使用独立空索引');
 const snapshot=path.join(lib.folder,'linked-source.sqlite'),original=new DatabaseSync(path.join(source,'data','aetodo.db'),{readOnly:true});
 try{await backup(original,snapshot);}finally{original.close();}
 const db=new DatabaseSync(snapshot,{readOnly:true});
 let count=0,missing=0;const failures=[];
 try{
  const tree=new Map(db.prepare('SELECT id,pid,title FROM ae_tree').all().map(n=>[n.id,n])),dirs=new Map();
  function folder(id,seen=new Set()){if(dirs.has(id))return dirs.get(id);const n=tree.get(id);if(!n||seen.has(id))throw Error('已有库分类缺失或循环');seen.add(id);const value=path.join(tree.has(n.pid)?folder(n.pid,seen):'',component(n.title));dirs.set(id,value);return value;}
  const tags=new Map();for(const r of db.prepare('SELECT r.source_id,t.title FROM ae_tag_relation r JOIN ae_tag t ON r.tag_id=t.id').all()){if(!tags.has(r.source_id))tags.set(r.source_id,[]);tags.get(r.source_id).push(r.title);}
  const rows=db.prepare('SELECT id,uuid,termId,filename,ext,filetype,star,favorite,ctime,mtime,isDeleted,tag,url,note,atime FROM ae_source').all();
  lib.db.exec('CREATE TABLE IF NOT EXISTS external_assets(asset INTEGER PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,source_id INTEGER); BEGIN');
  const insert=lib.db.prepare('INSERT INTO assets(path,path_key,name,ext,kind,folder,size,modified,added,cover,preview,tags,rating,favorite,note,hidden,source_url,last_used,missing) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(path_key) DO NOTHING');
  const ids=new Map(),collectionIds=new Map();
  function collection(id){if(collectionIds.has(id))return collectionIds.get(id);const n=tree.get(id);folder(id);const parent=tree.has(n.pid)?collection(n.pid):null;const cid=Number(lib.db.prepare('INSERT INTO collections(name,parent) VALUES(?,?)').run(n.title,parent).lastInsertRowid);collectionIds.set(id,cid);return cid;}
  for(const id of tree.keys())collection(id);
  const {kind}=require('./library.cjs');
  for(const r of rows){
   try{
    const ext=component(r.filetype==='seq'?r.ext:r.filetype).toLowerCase(),name=component(r.filename)+'.'+ext,file=path.join(source,'source',folder(r.termId),name);
    const stat=fs.existsSync(file)?fs.statSync(file):null;if(!stat)missing++;
    let cover=null,preview=null;const previewDir=path.join(source,'preview',component(r.uuid));
    if(fs.existsSync(previewDir)){const names=fs.readdirSync(previewDir);const image=names.find(n=>/\.(webp|png|jpe?g|gif)$/i.test(n)),media=names.find(n=>/\.(mp4|mov|webm|wav|mp3|ogg|flac|m4a|aac)$/i.test(n));if(image)cover=path.join(previewDir,image);if(media)preview=path.join(previewDir,media);}
    const type=kind(ext);if(!cover&&type==='image')cover=file;if(!preview&&['audio','video'].includes(type))preview=file;
    let labels=tags.get(r.id)||[];if(!labels.length&&r.tag){try{const parsed=JSON.parse(r.tag);if(Array.isArray(parsed))labels=parsed.filter(x=>typeof x==='string');}catch{labels=r.tag.split(/[,，|]/).filter(Boolean);}}
    insert.run(file,file.toLowerCase(),name,ext,type,path.dirname(file),stat?.size||0,stat?.mtimeMs||r.mtime||0,r.ctime||Date.now(),cover,preview,JSON.stringify(labels),Math.max(0,Math.min(5,r.star||0)),r.favorite?1:0,r.note||'',r.isDeleted?1:0,r.url||'',r.atime||null,stat?0:1);
    const id=lib.db.prepare('SELECT id FROM assets WHERE path_key=?').get(file.toLowerCase()).id;ids.set(r.id,id);lib.db.prepare('INSERT OR IGNORE INTO external_assets VALUES(?,?)').run(id,r.id);lib.db.prepare('INSERT OR IGNORE INTO collection_assets VALUES(?,?)').run(collection(r.termId),id);count++;
   }catch(e){failures.push({id:r.id,error:e.message});}
   if(count%500===0){report({phase:'连接已有库',count,total:rows.length});await new Promise(r=>setImmediate(r));}
  }
  for(const r of db.prepare('SELECT source_id,term_id FROM ae_tree_relation').all()){if(ids.has(r.source_id)&&tree.has(r.term_id))lib.db.prepare('INSERT OR IGNORE INTO collection_assets VALUES(?,?)').run(collection(r.term_id),ids.get(r.source_id));}
  if(!count)throw Error('已有库没有可连接的素材记录');
  lib.db.exec('COMMIT');const result={source,count,missing,skipped:failures.length,errors:failures.slice(0,30),linked:true};fs.writeFileSync(marker,JSON.stringify(result,null,2));return result;
 }catch(e){if(lib.db.isTransaction)lib.db.exec('ROLLBACK');throw e;}finally{db.close();}
}
module.exports={detect,attach};
