const path=require('node:path'),fs=require('node:fs'),{DatabaseSync}=require('node:sqlite');
const key=p=>path.resolve(p).toLowerCase();
function inside(root,file){const rel=path.relative(key(root),key(file));return rel===''||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel));}
function remap(file,mappings){if(!file)return file;for(const {from,to}of mappings)if(inside(from,file))file=path.join(to,path.relative(from,file));return file;}
function inventory(libraries,groups){
 const snapshots=[];for(const root of libraries){const file=path.join(root,'library.sqlite');if(!fs.existsSync(file))continue;const db=new DatabaseSync(file,{readOnly:true});
  try{const rows=db.prepare('SELECT id,path,kind,size,modified,cover,cover_override,preview FROM assets').all();
   if(rows.some(r=>groups.some(g=>inside(g.from,r.path))))throw Error('缓存目录内存在原素材引用，已停止处理，请先更换目录');
   snapshots.push({root,rows:rows.filter(r=>['cover','cover_override','preview'].some(k=>r[k]&&groups.some(g=>inside(g.from,r[k])))),audio:rows.filter(r=>r.kind==='audio')});
  }finally{db.close();}
 }return snapshots;
}
function changesFor(snapshots,mappings,mode){return snapshots.map(s=>({root:s.root,rows:s.rows.map(r=>{const after={};for(const field of ['cover','cover_override','preview']){const moved=remap(r[field],mappings);after[field]=mode==='delete'&&moved!==r[field]?(field==='preview'&&['audio','video'].includes(r.kind)?r.path:null):moved;}return {id:r.id,path:r.path,before:{cover:r.cover,cover_override:r.cover_override,preview:r.preview},after};})}));}
function apply(changes,restore=false){
 for(const group of changes){const db=new DatabaseSync(path.join(group.root,'library.sqlite'));try{db.exec('BEGIN IMMEDIATE');const read=db.prepare('SELECT path,cover,cover_override,preview FROM assets WHERE id=?'),write=db.prepare('UPDATE assets SET cover=?,cover_override=?,preview=? WHERE id=?');
  for(const r of group.rows){const current=read.get(r.id),wanted=restore?r.before:r.after,expected=restore?r.after:r.before;if(!current||current.path!==r.path)throw Error('素材已改变，缓存目录未切换');if(['cover','cover_override','preview'].every(k=>current[k]===wanted[k]))continue;if(!['cover','cover_override','preview'].every(k=>current[k]===expected[k]))throw Error('素材预览已改变，缓存迁移已停止');write.run(wanted.cover,wanted.cover_override,wanted.preview,r.id);}db.exec('COMMIT');
 }catch(e){try{db.exec('ROLLBACK');}catch{}throw e;}finally{db.close();}}
}
module.exports={inside,key,remap,inventory,changesFor,apply};
