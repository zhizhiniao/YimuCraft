const fs = require('node:fs');
const fsp = fs.promises;
const path = require('node:path');
const crypto = require('node:crypto');
const appearance=require('./appearance.js');
const { DatabaseSync } = require('node:sqlite');
const {zipFolder,unzip}=require('./archive.cjs');
const groups = { image: ['png','jpg','jpeg','webp','gif','bmp','svg','avif','psd','psb','tif','tiff','exr','dpx','tga','ai','pdf','hdr','dds','jp2','j2k','jpf','jpx',...require('./raw-preview.cjs').extensions], video: ['mp4','webm','mov','m4v','mkv','avi','mxf'], audio: ['wav','mp3','ogg','flac','m4a','aac'], project: ['aep','aepx','prproj','ffx','jsx','jsxbin','mogrt'], lut: ['cube'], model: ['obj','stl','glb','gltf','fbx'], font: ['ttf','otf','woff','woff2'] };
const kind = ext => Object.keys(groups).find(k => groups[k].includes(ext)) || 'other';
const normalize = p => path.resolve(p);
const key = p => normalize(p).toLowerCase();
function inside(root, p) { const r = path.relative(root,p); return r === '' || (!r.startsWith('..' + path.sep) && r !== '..' && !path.isAbsolute(r)); }
function safeJoin(root, rel) { if (typeof rel !== 'string' || !rel || path.isAbsolute(rel)) throw Error('素材包路径无效'); const p = path.resolve(root, rel); if (!inside(root,p)) throw Error('素材包路径越界'); return p; }
async function hash(file) { const h = crypto.createHash('sha256'); for await (const b of fs.createReadStream(file)) h.update(b); return h.digest('hex'); }
async function walk(root, report = () => {}, cancelled = () => false) {
  const files = [], errors = []; const stack = [root];
  while (stack.length) {
    if (cancelled()) break;
    const p = stack.pop();
    try { const st = await fsp.lstat(p); if (st.isSymbolicLink()) continue;
      if (st.isDirectory()) { for (const e of await fsp.readdir(p)) { if (!['.git','node_modules','.yimucraft'].includes(e)) stack.push(path.join(p,e)); } }
      else if (st.isFile()) files.push({path:p, size:st.size, modified:st.mtimeMs});
    } catch (e) { errors.push({path:p,error:e.message}); }
    if (files.length % 100 === 0) report({phase:'扫描',count:files.length});
  } return {files,errors};
}
class Library {
  constructor(folder) {
    this.folder = normalize(folder); fs.mkdirSync(this.folder,{recursive:true});
    this.db = new DatabaseSync(path.join(this.folder,'library.sqlite'));
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS assets(id INTEGER PRIMARY KEY, path TEXT NOT NULL, path_key TEXT UNIQUE NOT NULL, name TEXT NOT NULL, ext TEXT NOT NULL, kind TEXT NOT NULL, folder TEXT NOT NULL, size INTEGER NOT NULL, modified REAL NOT NULL, added REAL NOT NULL, cover TEXT, preview TEXT, tags TEXT NOT NULL DEFAULT '[]', rating INTEGER NOT NULL DEFAULT 0, favorite INTEGER NOT NULL DEFAULT 0, note TEXT NOT NULL DEFAULT '', hidden INTEGER NOT NULL DEFAULT 0);
      CREATE INDEX IF NOT EXISTS assets_folder ON assets(folder); CREATE INDEX IF NOT EXISTS assets_kind ON assets(kind);
      CREATE TABLE IF NOT EXISTS roots(path TEXT PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS collections(id INTEGER PRIMARY KEY,name TEXT NOT NULL,parent INTEGER REFERENCES collections(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS collection_assets(collection INTEGER REFERENCES collections(id) ON DELETE CASCADE,asset INTEGER REFERENCES assets(id) ON DELETE CASCADE,PRIMARY KEY(collection,asset));`);
    if(!this.db.prepare('PRAGMA table_info(assets)').all().some(x=>x.name==='cover_override'))this.db.exec('ALTER TABLE assets ADD COLUMN cover_override TEXT');
    if(!this.db.prepare('PRAGMA table_info(assets)').all().some(x=>x.name==='last_used'))this.db.exec('ALTER TABLE assets ADD COLUMN last_used REAL');
    if(!this.db.prepare('PRAGMA table_info(assets)').all().some(x=>x.name==='bundle_folder'))this.db.exec('ALTER TABLE assets ADD COLUMN bundle_folder TEXT');
    if(!this.db.prepare('PRAGMA table_info(assets)').all().some(x=>x.name==='portable_pr'))this.db.exec('ALTER TABLE assets ADD COLUMN portable_pr INTEGER NOT NULL DEFAULT 0');
    if(!this.db.prepare('PRAGMA table_info(assets)').all().some(x=>x.name==='source_url'))this.db.exec("ALTER TABLE assets ADD COLUMN source_url TEXT NOT NULL DEFAULT ''");
    if(!this.db.prepare('PRAGMA table_info(assets)').all().some(x=>x.name==='missing'))this.db.exec('ALTER TABLE assets ADD COLUMN missing INTEGER NOT NULL DEFAULT 0');
    this.db.exec('CREATE TABLE IF NOT EXISTS external_assets(asset INTEGER PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,source_id INTEGER)');
    this.db.exec('CREATE TABLE IF NOT EXISTS file_identity(asset INTEGER PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,identity TEXT)');
    this.db.exec("CREATE TABLE IF NOT EXISTS folder_preferences(path TEXT PRIMARY KEY,icon TEXT NOT NULL DEFAULT '▱')");
    for(const table of ['folder_preferences','collections'])for(const [column,defaultValue] of [['icon','folder'],['color','']])if(!this.db.prepare('PRAGMA table_info('+table+')').all().some(x=>x.name===column))this.db.exec("ALTER TABLE "+table+" ADD COLUMN "+column+" TEXT NOT NULL DEFAULT '"+defaultValue+"'");
    this.db.exec('CREATE TABLE IF NOT EXISTS import_sources(source TEXT NOT NULL,digest TEXT NOT NULL,asset INTEGER REFERENCES assets(id) ON DELETE CASCADE,stored_digest TEXT NOT NULL)');
    this.db.exec('CREATE INDEX IF NOT EXISTS import_sources_lookup ON import_sources(source,digest)');
    this.db.exec('CREATE INDEX IF NOT EXISTS import_sources_asset ON import_sources(asset)');
    for(const [type,extensions] of Object.entries(groups))this.db.prepare("UPDATE assets SET kind=?,cover=CASE WHEN ?='image' THEN COALESCE(cover,path) ELSE cover END WHERE kind='other' AND ext IN (SELECT value FROM json_each(?))").run(type,type,JSON.stringify(extensions));
    this.db.exec('CREATE TABLE IF NOT EXISTS semantic_features(asset INTEGER PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,signature TEXT NOT NULL,model TEXT NOT NULL,vector BLOB NOT NULL)');
    this.db.exec('CREATE TABLE IF NOT EXISTS visual_features(asset INTEGER PRIMARY KEY REFERENCES assets(id) ON DELETE CASCADE,signature TEXT NOT NULL,pixels TEXT NOT NULL)');
    try{require('./trash.cjs').recover(this);}catch(e){this.db.close();throw e;}
  }
  async removePermanent(ids,report){return require('./trash.cjs').remove(this,ids,report);}
  async synchronize(beforeApply){return require('./file-sync.cjs').synchronize(this,beforeApply);}
  async createFolder(parent,name){return require('./folders.cjs').createFolder(this,parent,name);}
  async removeEmptyFolder(folder){return require('./folders.cjs').removeEmptyFolder(this,folder);}
  setFolderIcon(folder,icon){const old=this.db.prepare('SELECT color FROM folder_preferences WHERE path=?').get(folder);const result=this.setFolderAppearance(folder,{icon,color:old?.color||''});this.db.prepare('UPDATE folder_preferences SET icon=? WHERE path=?').run(icon,result.path);return result;}
  setFolderAppearance(folder,value){const a=appearance.normalize(value);if(typeof folder!=='string'||!path.isAbsolute(folder))throw Error('文件夹路径无效');folder=path.resolve(folder);const prefix=folder.endsWith(path.sep)?folder:folder+path.sep;const known=this.db.prepare('SELECT 1 FROM assets WHERE lower(folder)=lower(?) OR substr(lower(folder),1,?)=lower(?) LIMIT 1').get(folder,prefix.length,prefix)||this.db.prepare('SELECT 1 FROM folder_preferences WHERE path=?').get(folder);const owned=['managed','packages'].some(n=>inside(path.join(this.folder,n),folder))&&fs.existsSync(folder)&&fs.statSync(folder).isDirectory();if(!known&&!owned)throw Error('请选择当前库中的文件夹');this.db.prepare('INSERT INTO folder_preferences(path,icon,color) VALUES(?,?,?) ON CONFLICT(path) DO UPDATE SET icon=excluded.icon,color=excluded.color').run(folder,a.icon,a.color);return {path:folder,...a};}
  setCollectionAppearance(id,value){const a=appearance.normalize(value);if(!this.db.prepare('SELECT 1 FROM collections WHERE id=?').get(id))throw Error('分类不存在');this.db.prepare('UPDATE collections SET icon=?,color=? WHERE id=?').run(a.icon,a.color,id);return {id,...a};}
  async moveFolder(source,destination,options){return require('./folders.cjs').moveFolder(this,source,destination,options);}
  async importAetodo(file,report){return require('./aetodopack.cjs').importPack(this,file,report);}
  async exportAetodo(ids,destination,report,overrides){return require('./aetodopack.cjs').exportPack(this,ids,destination,report,overrides);}
  async importManaged(paths,report,cancelled,options){return require('./managed-import.cjs').importManaged(this,paths,report,cancelled,options);}
  close() { this.db.close(); }
  async rename(id,name){const row=this.get(id);if(this.db.prepare('SELECT 1 FROM external_assets WHERE asset=?').get(Number(id)))throw Error('已连接素材仅引用原文件；请复制入库后重命名');name=String(name).trim();if(!name||name.length>240||/[<>:"/\\|?*\x00-\x1f]/.test(name)||/[. ]$/.test(name)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name))throw Error('文件名无效');if(path.extname(name).toLowerCase()!==(row.ext?'.'+row.ext:''))throw Error('请保留原文件扩展名');const target=path.join(path.dirname(row.path),name);if(target===row.path)return row;if((key(target)!==key(row.path)&&fs.existsSync(target))||this.db.prepare('SELECT id FROM assets WHERE path_key=? AND id<>?').get(key(target),Number(id)))throw Error('同名文件或索引已存在');const stat=await fsp.lstat(row.path);if(!stat.isFile()||stat.isSymbolicLink())throw Error('只支持普通文件重命名');let linked=false,removed=false;const oldBundle=row.bundle_folder||row.path.slice(0,-path.extname(row.path).length),bundle=row.kind==='project'&&fs.existsSync(oldBundle)&&fs.statSync(oldBundle).isDirectory()?oldBundle:null;this.db.exec('BEGIN');try{await require('./file-move.cjs').moveNoReplace(row.path,target);linked=true;removed=true;this.db.prepare('UPDATE assets SET path=?,path_key=?,name=?,bundle_folder=? WHERE id=?').run(target,key(target),name,bundle,Number(id));for(const field of ['cover','preview','cover_override'])this.db.prepare('UPDATE assets SET '+field+'=? WHERE '+field+'=?').run(target,row.path);this.db.exec('COMMIT');return this.get(id);}catch(e){if(this.db.isTransaction)this.db.exec('ROLLBACK');if(linked){try{if(removed)await require('./file-move.cjs').moveNoReplace(target,row.path);}catch(recovery){throw Error('重命名失败，文件保留于 '+target+'；恢复失败：'+recovery.message);}}throw e;}}
  async indexVisual(report=()=>{},cancelled=()=>false){const rows=this.db.prepare("SELECT id,path,kind,cover,cover_override,modified,size FROM assets WHERE hidden=0 AND (kind='image' OR cover IS NOT NULL OR cover_override IS NOT NULL)").all();const {extract}=require('./visual-features.cjs');let count=0,skipped=0;const errors=[];for(const row of rows){if(cancelled())break;try{const file=row.cover_override||row.cover||row.path,st=await fsp.stat(file),signature=JSON.stringify([file,st.size,st.mtimeMs]),old=this.db.prepare('SELECT signature FROM visual_features WHERE asset=?').get(row.id);if(old?.signature===signature)skipped++;else{const pixels=await extract(file);this.db.prepare('INSERT INTO visual_features VALUES(?,?,?) ON CONFLICT(asset) DO UPDATE SET signature=excluded.signature,pixels=excluded.pixels').run(row.id,signature,JSON.stringify(pixels));}}catch(e){errors.push({path:row.path,error:e.message});}report({phase:'建立色彩与相似图索引',count:++count,total:rows.length});}return {count,skipped,errors,cancelled:cancelled(),message:(cancelled()?'已取消，保留已完成索引':'图像索引完成')+' · '+count+' 项，失败 '+errors.length+' 项'};}
  visualSearch({color,similarTo}={}){const {colorScore,similarity}=require('./visual-features.cjs');let reference;if(similarTo){const row=this.db.prepare('SELECT pixels FROM visual_features WHERE asset=?').get(Number(similarTo));if(!row)throw Error('请先从“工具”建立色彩与相似图索引');reference=JSON.parse(row.pixels);}else if(!/^#[0-9a-f]{6}$/i.test(color))throw Error('颜色无效');const rows=this.db.prepare('SELECT v.asset,v.pixels FROM visual_features v JOIN assets a ON a.id=v.asset WHERE a.hidden=0').all();if(!rows.length)throw Error('请先从“工具”建立色彩与相似图索引');return rows.map(r=>({id:r.asset,score:reference?similarity(reference,JSON.parse(r.pixels)):colorScore(JSON.parse(r.pixels),color)})).filter(r=>reference?r.id!==Number(similarTo):r.score>=.08).sort((a,b)=>b.score-a.score).slice(0,reference?200:undefined);}
  touch(ids){const update=this.db.prepare('UPDATE assets SET last_used=? WHERE id=?');for(const id of ids)update.run(Date.now(),Number(id));return {count:ids.length};}
  async duplicates(report=()=>{},cancelled=()=>false){const rows=this.db.prepare('SELECT id,path,size FROM assets WHERE hidden=0 AND size IN(SELECT size FROM assets WHERE hidden=0 GROUP BY size HAVING count(*)>1) ORDER BY size,id').all(),byHash=new Map(),errors=[];let count=0;for(const row of rows){if(cancelled())break;try{const digest=await hash(row.path),key=row.size+':'+digest;if(!byHash.has(key))byHash.set(key,[]);byHash.get(key).push(row.id);}catch(e){errors.push({path:row.path,error:e.message});}report({phase:'核对重复文件内容',count:++count,total:rows.length});}const groups=[...byHash.values()].filter(g=>g.length>1);return {groups,ids:groups.flat(),cancelled:cancelled(),errors,count,message:'找到 '+groups.length+' 组内容相同的文件；未删除原文件'};}
  static async restoreBackup(source,destination){
    if(fs.existsSync(destination)&&fs.readdirSync(destination).length)throw Error('恢复目标须为新的空文件夹');
    const backup=new DatabaseSync(source,{readOnly:true});
    try{if(backup.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('备份数据库损坏');const columns=backup.prepare('PRAGMA table_info(assets)').all().map(x=>x.name);if(!['id','path','path_key','tags','rating','hidden'].every(x=>columns.includes(x)))throw Error('不是一幕索引备份');await fsp.mkdir(destination,{recursive:true});const partial=path.join(destination,'restore.partial');try{await require('node:sqlite').backup(backup,partial);await fsp.rename(partial,path.join(destination,'library.sqlite'));}catch(e){await fsp.rm(partial,{force:true});throw e;}}finally{backup.close();}
    return {path:destination};
  }
  renameTag(oldTag,newTag){oldTag=String(oldTag).trim();newTag=String(newTag).trim();if(!oldTag||newTag.length>100)throw Error('标签名称无效');const rows=this.db.prepare('SELECT id,tags FROM assets WHERE EXISTS(SELECT 1 FROM json_each(assets.tags) WHERE value=?)').all(oldTag);this.db.exec('BEGIN');try{const update=this.db.prepare('UPDATE assets SET tags=? WHERE id=?');for(const row of rows){const tags=[...new Set(JSON.parse(row.tags).flatMap(t=>t===oldTag?(newTag?[newTag]:[]):[t]))];update.run(JSON.stringify(tags),row.id);}this.db.exec('COMMIT');return {count:rows.length,message:newTag?'标签已重命名／合并':'标签已移除，素材保留'};}catch(e){this.db.exec('ROLLBACK');throw e;}}
  get(id) { const r=this.db.prepare('SELECT * FROM assets WHERE id=?').get(Number(id)); if (!r) throw Error('素材不存在'); return {...r,cover:r.cover_override||r.cover,tags:JSON.parse(r.tags)}; }
  getMany(ids){if(!Array.isArray(ids)||ids.some(id=>!Number.isSafeInteger(id)||id<1))throw Error('素材编号无效');const unique=[...new Set(ids)],rows=this.db.prepare('SELECT * FROM assets WHERE id IN (SELECT value FROM json_each(?))').all(JSON.stringify(unique)),byId=new Map(rows.map(r=>[r.id,r]));if(rows.length!==unique.length)throw Error('部分素材已不存在，请刷新后重试');return unique.map(id=>{const r=byId.get(id);return {...r,cover:r.cover_override||r.cover,tags:JSON.parse(r.tags)};});}
  query(f={}) {
    if(f.color||f.similarTo)f={...f,visualIds:this.visualSearch(f).map(r=>r.id)};
    const where=['hidden=?'], args=[f.trash ? 1:0];
    if (f.q) { where.push('(name LIKE ? ESCAPE \'\\\' OR tags LIKE ? ESCAPE \'\\\' OR note LIKE ? ESCAPE \'\\\')'); const s='%'+String(f.q).replace(/[\\%_]/g,'\\$&')+'%'; args.push(s,s,s); }
    if (f.kind) {where.push('kind=?'); args.push(f.kind);}
    if (f.ext) {where.push('ext=?');args.push(f.ext);}
    if (f.favorite) where.push('favorite=1');
    if (f.note) where.push("note!=''");
    if(f.recent)where.push('last_used IS NOT NULL');
    if(Array.isArray(f.ids)){where.push('id IN (SELECT value FROM json_each(?))');args.push(JSON.stringify(f.ids));}
    if(Array.isArray(f.visualIds)){where.push('id IN (SELECT value FROM json_each(?))');args.push(JSON.stringify(f.visualIds));}
    if(f.unclassified)where.push('NOT EXISTS(SELECT 1 FROM collection_assets ca WHERE ca.asset=assets.id)');
    if(f.collection){where.push('id IN (WITH RECURSIVE c(id) AS (SELECT id FROM collections WHERE id=? UNION ALL SELECT collections.id FROM collections JOIN c ON collections.parent=c.id) SELECT asset FROM collection_assets WHERE collection IN (SELECT id FROM c))');args.push(Number(f.collection));}
    if (f.rating) {where.push('rating>=?');args.push(Number(f.rating));}
    if (f.tag) {where.push('EXISTS (SELECT 1 FROM json_each(assets.tags) WHERE value=?)'); args.push(f.tag);}
    if (f.folder) { const folder=normalize(f.folder); if (f.recursive !== false) {where.push('(folder=? OR substr(folder,1,?)=?)'); args.push(folder,folder.length+1,folder+path.sep);} else {where.push('folder=?');args.push(folder);} }
    for (const [field,from,to] of [['added',f.after,f.before],['modified',f.modifiedAfter,f.modifiedBefore]]) {
      if (from) {where.push(field+'>=?');args.push(new Date(from+'T00:00:00').getTime());} if (to) {where.push(field+'<?');const date=new Date(to+'T00:00:00');date.setDate(date.getDate()+1);args.push(date.getTime());}
    }
    const clause=where.join(' AND '), total=this.db.prepare('SELECT count(*) n FROM assets WHERE '+clause).get(...args).n;
    const order=Array.isArray(f.visualIds)?'(SELECT CAST(key AS INTEGER) FROM json_each(?) WHERE value=assets.id)':f.recent?'last_used DESC':({name:'name COLLATE NOCASE ASC',newest:'added DESC',modified:'modified DESC',size:'size DESC',rating:'rating DESC'}[f.sort] || 'name COLLATE NOCASE ASC');
    if(Array.isArray(f.visualIds))args.push(JSON.stringify(f.visualIds));
      if(f.idsOnly)return {total,ids:this.db.prepare(`SELECT id FROM assets WHERE ${clause} ORDER BY ${order},id`).all(...args).map(r=>r.id)};
    const rows=this.db.prepare(`SELECT * FROM assets WHERE ${clause} ORDER BY ${order},id LIMIT ? OFFSET ?`).all(...args,Math.max(1,Math.min(500,Number(f.limit)||200)),Math.max(0,Number(f.offset)||0));
    return {total,items:rows.map(r=>({...r,cover:r.cover_override||r.cover,tags:JSON.parse(r.tags)}))};
  }
  stats() {let linkedSource=null;try{linkedSource=JSON.parse(fs.readFileSync(path.join(this.folder,'linked-library.json'),'utf8')).source;}catch{}return {linkedSource,tagCounts:this.db.prepare('SELECT value tag,count(*) count FROM assets,json_each(assets.tags) WHERE hidden=0 GROUP BY value ORDER BY value').all(),folderPreferences:this.db.prepare('SELECT path,icon,color FROM folder_preferences').all(),total:this.db.prepare('SELECT count(*) n FROM assets WHERE hidden=0').get().n,collections:this.db.prepare('SELECT c.*,count(a.id) count FROM collections c LEFT JOIN collection_assets ca ON ca.collection=c.id LEFT JOIN assets a ON ca.asset=a.id AND a.hidden=0 GROUP BY c.id ORDER BY c.name').all(),folders:this.db.prepare('SELECT folder,count(*) count FROM assets WHERE hidden=0 GROUP BY folder ORDER BY folder').all(),roots:this.db.prepare('SELECT path FROM roots').all().map(x=>x.path),tags:this.db.prepare('SELECT DISTINCT value FROM assets,json_each(assets.tags) WHERE hidden=0 ORDER BY value').all().map(x=>x.value),formats:this.db.prepare('SELECT DISTINCT ext FROM assets WHERE hidden=0 ORDER BY ext').all().map(x=>x.ext),location:this.folder};}
  saveCollection(id,name,parent=null){name=String(name).trim();if(!name||name.length>100)throw Error('分类名须为 1–100 个字符');parent=parent?Number(parent):null;if(parent&&!this.db.prepare('SELECT id FROM collections WHERE id=?').get(parent))throw Error('上级分类不存在');if(id){id=Number(id);if(!this.db.prepare('SELECT id FROM collections WHERE id=?').get(id))throw Error('分类不存在');let p=parent;while(p){if(p===id)throw Error('分类不能移动到自身或子分类');p=this.db.prepare('SELECT parent FROM collections WHERE id=?').get(p)?.parent;}this.db.prepare('UPDATE collections SET name=?,parent=? WHERE id=?').run(name,parent,id);return {id};}return {id:Number(this.db.prepare('INSERT INTO collections(name,parent) VALUES(?,?)').run(name,parent).lastInsertRowid)};}
  deleteCollection(id){this.db.prepare('DELETE FROM collections WHERE id=?').run(Number(id));return {message:'已删除分类及其子分类；原文件与素材记录保留'};}
  assignCollection(ids,collection,remove=false){this.db.exec('BEGIN');try{for(const id of ids){this.get(id);this.db.prepare(remove?'DELETE FROM collection_assets WHERE collection=? AND asset=?':'INSERT OR IGNORE INTO collection_assets(collection,asset) VALUES(?,?)').run(Number(collection),Number(id));}this.db.exec('COMMIT');return {count:ids.length};}catch(e){this.db.exec('ROLLBACK');throw e;}}
  setPreview(id,cover,preview){this.get(id);this.db.prepare('UPDATE assets SET cover_override=?,preview=COALESCE(?,preview) WHERE id=?').run(cover,preview,Number(id));return this.get(id);}
  setCover(id,file){this.get(id);this.db.prepare('UPDATE assets SET cover_override=? WHERE id=?').run(file,Number(id));return this.get(id);}
  async backup(destination){if(fs.existsSync(destination))throw Error('备份文件已存在');const partial=destination+'.partial-'+crypto.randomUUID();try{await require('node:sqlite').backup(this.db,partial);await fsp.rename(partial,destination);return {message:'索引备份已保存（不包含素材原文件）',path:destination};}catch(e){await fsp.rm(partial,{force:true});throw e;}}
  async importPaths(paths, report=()=>{}, cancelled=()=>false) {
    if (!Array.isArray(paths)||!paths.length) throw Error('请选择文件或文件夹');
    let scanned=[],errors=[];
    for (const p of paths) { const root=normalize(p); if (inside(this.folder,root)&&!inside(path.join(this.folder,'packages'),root)&&!inside(path.join(this.folder,'managed'),root)) throw Error('不能导入索引数据库目录'); const result=await walk(root,report,cancelled); scanned.push(...result.files);errors.push(...result.errors); }
    const unique=new Map(scanned.map(x=>[key(x.path),x]));scanned=[...unique.values()];
    const byPath = new Map(scanned.map(f=>[key(f.path),f.path]));
    // Include siblings when the picker imports individual project files.
    for (const f of scanned.filter(x=>kind(path.extname(x.path).slice(1).toLowerCase())==='project')) {
      const dir=path.dirname(f.path); for(const n of await fsp.readdir(dir)) byPath.set(key(path.join(dir,n)),path.join(dir,n));
      const sub=path.join(dir,path.basename(f.path,path.extname(f.path))); try { for(const n of await fsp.readdir(sub)) byPath.set(key(path.join(sub,n)),path.join(sub,n)); } catch {}
    }
    const put=this.db.prepare(`INSERT INTO assets(path,path_key,name,ext,kind,folder,size,modified,added,cover,preview) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(path_key) DO UPDATE SET name=excluded.name,ext=excluded.ext,kind=excluded.kind,folder=excluded.folder,size=excluded.size,modified=excluded.modified,cover=excluded.cover,preview=excluded.preview`);
    let count=0; const ownTransaction=!this.db.isTransaction;
    if(ownTransaction)this.db.exec('BEGIN');
    try { for (const f of scanned) {
      if (cancelled()) break;
      const ext=path.extname(f.path).slice(1).toLowerCase(), type=kind(ext), stem=f.path.slice(0,-ext.length-1);
      const bases=[stem,path.join(stem,path.basename(stem))];
      const find=es=>{for(const base of bases) for(const e of es){const p=byPath.get(key(base+'.'+e));if(p&&fs.statSync(p).isFile())return p;}return null;};
      const cover=type==='image'?f.path:find(groups.image); const preview=type==='video'||type==='audio'?f.path:type==='project'?find(groups.video):null;
      put.run(f.path,key(f.path),path.basename(f.path),ext,type,path.dirname(f.path),f.size,f.modified,Date.now(),cover,preview);const imported=this.db.prepare('SELECT id FROM assets WHERE path_key=?').get(key(f.path));require('./file-sync.cjs').remember(this,f.path,imported.id);count++;
      if(count%100===0) {if(ownTransaction)this.db.exec('COMMIT');report({phase:'索引',count,total:scanned.length});await new Promise(r=>setImmediate(r));if(ownTransaction)this.db.exec('BEGIN');}
    } if(ownTransaction)this.db.exec('COMMIT'); } catch(e){if(ownTransaction&&this.db.isTransaction)this.db.exec('ROLLBACK');throw e;}
    for(const p of paths) {if(fs.existsSync(p)){const r=fs.statSync(p).isDirectory()?normalize(p):path.dirname(normalize(p));this.db.prepare('INSERT OR IGNORE INTO roots VALUES(?)').run(r);}}
    return {count,errors,cancelled:cancelled()};
  }
  update(ids, patch) {
    if(patch.tagMode&&patch.tagMode!=='replace'){
      if(!['append','remove'].includes(patch.tagMode)||!Array.isArray(patch.tags))throw Error('标签修改方式无效');
      const changed=patch.tags.map(t=>String(t).trim()).filter(Boolean),rows=ids.map(id=>this.get(id));
      // Validate the complete patch before mutating any selected record.
      if(Object.hasOwn(patch,'rating')&&(!Number.isInteger(Number(patch.rating))||Number(patch.rating)<0||Number(patch.rating)>5))throw Error('评分范围为 0–5');
      this.db.exec('SAVEPOINT bulk_tags');try{for(const row of rows){const tags=patch.tagMode==='append'?[...new Set([...row.tags,...changed])]:row.tags.filter(t=>!changed.includes(t));this.update([row.id],{...patch,tags,tagMode:'replace'});}this.db.exec('RELEASE bulk_tags');}catch(e){this.db.exec('ROLLBACK TO bulk_tags; RELEASE bulk_tags');throw e;}return;
    }
    const allowed=['tags','rating','favorite','note','hidden','source_url']; const columns=[],values=[];
    for(const k of allowed) if(Object.hasOwn(patch,k)) { let v=patch[k]; if(k==='tags'){if(!Array.isArray(v))throw Error('标签必须为数组');v=JSON.stringify([...new Set(v.map(x=>String(x).trim()).filter(Boolean))]);} else if(k==='rating'){v=Number(v);if(!Number.isInteger(v)||v<0||v>5)throw Error('评分范围为 0–5');} else if(k==='source_url')v=require('./source-url.cjs').sourceURL(v);else if(k==='note')v=String(v);else v=v?1:0;columns.push(k+'=?');values.push(v); }
    if(!columns.length)return;
    const own=!this.db.isTransaction;if(own)this.db.exec('BEGIN');try {const s=this.db.prepare('UPDATE assets SET '+columns.join(',')+' WHERE id=?');for(const id of ids)s.run(...values,Number(id));if(own)this.db.exec('COMMIT');}catch(e){if(own)this.db.exec('ROLLBACK');throw e;}
  }
  async exportPackage(ids, destination, report=()=>{}, overrides={}) {
    const dest=normalize(destination); if(fs.existsSync(dest))throw Error('目标目录已存在，请选择新的素材包名称');
    const rows=ids.map(id=>({...this.get(id),...(overrides[id]||{})})); if(!rows.length)throw Error('请先选择素材');
    if(rows.some(r=>inside(path.dirname(r.path),dest)))throw Error('请把素材包保存到源素材目录以外，避免重复包含');
    const stage=dest+'.partial-'+crypto.randomUUID(); await fsp.mkdir(stage,{recursive:true});
    try {
      const records=[], manifestFiles=new Map(), collectionMap=new Map();
      const includeCollection=id=>{if(collectionMap.has(id))return;const c=this.db.prepare('SELECT id,name,parent FROM collections WHERE id=?').get(id);if(!c)return;if(c.parent)includeCollection(c.parent);collectionMap.set(id,c);};
      for(const [i,row] of rows.entries()) {
        const root=path.dirname(row.path), bucket='assets/'+row.id; const files=new Set([row.path,row.cover,row.preview].filter(Boolean));
        if(row.kind==='model')for(const resource of await require('./model-resources.cjs').resources(row.path))files.add(resource.path);
        if(row.kind==='project') {
          for(const folder of [row.bundle_folder||row.path.slice(0,-path.extname(row.path).length),path.join(root,'(Footage)')]) {
            if(fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {const r=await walk(folder);if(r.errors.length)throw Error(r.errors[0].error);r.files.forEach(f=>files.add(f.path));}
          }
        }
        if([...files].some(p=>inside(dest,p)||inside(stage,p)))throw Error('素材包目标不能包含源素材');
        const mapping=new Map();
        for(const file of files) { const external=!inside(root,file);if(external&&file!==row.cover&&file!==row.preview)throw Error('关联文件位于工程目录外'); const st=await fsp.lstat(file);if(!st.isFile()||st.isSymbolicLink())throw Error('不支持链接文件');const rel=bucket+'/'+(external?'__preview/'+path.basename(file):path.relative(root,file).split(path.sep).join('/'));const target=safeJoin(stage,rel);await fsp.mkdir(path.dirname(target),{recursive:true});await fsp.copyFile(file,target,fs.constants.COPYFILE_EXCL);mapping.set(file,rel);manifestFiles.set(rel,{path:rel,size:st.size,sha256:await hash(target)}); }
        const collections=this.db.prepare('SELECT collection FROM collection_assets WHERE asset=?').all(row.id).map(c=>c.collection);collections.forEach(includeCollection);
        const bundleFolder=row.bundle_folder&&inside(root,row.bundle_folder)?bucket+'/'+path.relative(root,row.bundle_folder).split(path.sep).join('/'):null;
        records.push({premiereCollected:!!row.portable_pr,path:mapping.get(row.path),cover:mapping.get(row.cover)||null,preview:mapping.get(row.preview)||null,tags:row.tags,rating:row.rating,favorite:row.favorite,note:row.note,sourceUrl:row.source_url,collections,bundleFolder:bundleFolder&&fs.existsSync(safeJoin(stage,bundleFolder))?bundleFolder:null});report({phase:'打包',count:i+1,total:rows.length});
      }
      await fsp.writeFile(path.join(stage,'yimucraft.json'),JSON.stringify({format:'yimucraft-package',version:2,created:new Date().toISOString(),files:[...manifestFiles.values()],collections:[...collectionMap.values()],assets:records},null,2));
      await require('./rename-retry.cjs').renameRetry(stage,dest);return {path:dest,count:rows.length,files:manifestFiles.size};
    }catch(e){await fsp.rm(stage,{recursive:true,force:true});throw e;}
  }
  async importOwnedPackage(folder,report=()=>{}) {
    folder=normalize(folder);
    if(inside(path.join(this.folder,'packages'),folder))return this.importPackage(folder,report);
    if(inside(folder,this.folder))throw Error('不能导入包含当前素材库的目录');
    const owned=path.join(this.folder,'packages',crypto.randomUUID());
    try{await fsp.cp(folder,owned,{recursive:true,errorOnExist:true,force:false,filter:async file=>{if((await fsp.lstat(file)).isSymbolicLink())throw Error('素材包包含链接文件');return true;}});return {...await this.importPackage(owned,report),path:owned};}
    catch(e){await fsp.rm(owned,{recursive:true,force:true});throw e;}
  }
  async importPackage(folder,report=()=>{}) {
    const root=normalize(folder), m=JSON.parse(await fsp.readFile(path.join(root,'yimucraft.json'),'utf8'));
    if(m.format!=='yimucraft-package'||![1,2].includes(m.version)||!Array.isArray(m.files)||!Array.isArray(m.assets))throw Error('不支持的素材包');
    const collections=m.version===2?m.collections:[];
    if(!Array.isArray(collections)||collections.length>10000)throw Error('素材包分类无效');
    const collectionMap=new Map();for(const c of collections){if(!Number.isSafeInteger(c.id)||collectionMap.has(c.id)||typeof c.name!=='string'||!c.name.trim()||c.name.length>100)throw Error('素材包分类无效');collectionMap.set(c.id,c);}
    const ordered=[],visited=new Set();for(const c of collections){const chain=[],local=new Set();let current=c;while(current&&!visited.has(current.id)){if(local.has(current.id))throw Error('素材包分类包含循环');local.add(current.id);chain.push(current);if(current.parent!==null&&!collectionMap.has(current.parent))throw Error('素材包上级分类不存在');current=current.parent===null?null:collectionMap.get(current.parent);}for(const entry of chain.reverse()){visited.add(entry.id);ordered.push(entry);}}
    for(const a of m.assets)if(m.version===2&&(!Array.isArray(a.collections)||a.collections.some(id=>!collectionMap.has(id))))throw Error('素材包引用未知分类');
    const validated=new Set();
    for(const file of m.files) {const p=safeJoin(root,file.path);const real=await fsp.realpath(p);if(!inside(await fsp.realpath(root),real))throw Error('素材包包含越界链接');const st=await fsp.lstat(p);if(!st.isFile()||st.isSymbolicLink()||st.size!==file.size||await hash(p)!==file.sha256)throw Error('文件校验失败：'+file.path);validated.add(file.path);}
    for(const a of m.assets)for(const k of ['path','cover','preview'])if(a[k]&&!validated.has(a[k]))throw Error('素材包引用未校验的文件');
    for(const a of m.assets)if(a.bundleFolder){const folder=safeJoin(root,a.bundleFolder);if(!inside(await fsp.realpath(root),await fsp.realpath(folder))||!fs.statSync(folder).isDirectory())throw Error('素材包关联目录无效');}
    // Validate all metadata before beginning any database mutations.
    for(const a of m.assets)if(!Array.isArray(a.tags)||!a.tags.every(t=>typeof t==='string')||!Number.isInteger(a.rating)||a.rating<0||a.rating>5||typeof a.note!=='string')throw Error('素材包元数据无效');
    for(const a of m.assets)a.sourceUrl=require('./source-url.cjs').sourceURL(a.sourceUrl);
    if(inside(path.join(this.folder,'packages'),root)){let rebased=false;for(const a of m.assets)if(a.premiereCollected===true&&a.bundleFolder&&/\.prproj$/i.test(a.path)){const file=safeJoin(root,a.path);await require('./premiere-paths.cjs').normalizeCollected(file,true);const record=m.files.find(f=>f.path===a.path);record.size=(await fsp.stat(file)).size;record.sha256=await hash(file);rebased=true;}if(rebased)await fsp.writeFile(path.join(root,'yimucraft.json'),JSON.stringify(m,null,2));}
    this.db.exec('BEGIN');
    try {
      const importedCollections=new Map();for(const c of ordered){const parent=c.parent===null?null:importedCollections.get(c.parent),existing=this.db.prepare('SELECT id FROM collections WHERE name=? AND parent IS ?').get(c.name,parent);importedCollections.set(c.id,existing?.id||this.saveCollection(null,c.name,parent).id);}
      for(const [i,a] of m.assets.entries()) {const p=safeJoin(root,a.path);await this.importPaths([p]); const row=this.db.prepare('SELECT id FROM assets WHERE path_key=?').get(key(p));this.db.prepare('UPDATE assets SET cover=?,preview=?,tags=?,rating=?,favorite=?,note=?,source_url=? WHERE id=?').run(a.cover?safeJoin(root,a.cover):null,a.preview?safeJoin(root,a.preview):null,JSON.stringify(a.tags),a.rating,a.favorite?1:0,a.note,a.sourceUrl,row.id);if(a.bundleFolder)this.db.prepare('UPDATE assets SET bundle_folder=? WHERE id=?').run(safeJoin(root,a.bundleFolder),row.id);if(a.premiereCollected===true)this.db.prepare('UPDATE assets SET portable_pr=1 WHERE id=?').run(row.id);for(const collection of m.version===2?a.collections:[])this.db.prepare('INSERT OR IGNORE INTO collection_assets(collection,asset) VALUES(?,?)').run(importedCollections.get(collection),row.id);report({phase:'导入素材包',count:i+1,total:m.assets.length});}
      this.db.exec('COMMIT');return {count:m.assets.length};
    }catch(e){this.db.exec('ROLLBACK');throw e;}
  }
  async exportZip(ids,destination,report=()=>{},overrides={}){
    const temp=path.join(this.folder,'package-staging',crypto.randomUUID());await this.exportPackage(ids,temp,report,overrides);
    try{const r=await zipFolder(temp,destination,report);return {...r,count:ids.length};}finally{await fsp.rm(temp,{recursive:true,force:true});}
  }
  async importZip(file,report=()=>{}){
    const destination=path.join(this.folder,'packages',crypto.randomUUID());await unzip(file,destination,report);
    try{const r=fs.existsSync(path.join(destination,'yimucraft.json'))?await this.importPackage(destination,report):await this.importPaths([destination],report);return {...r,path:destination};}catch(e){await fsp.rm(destination,{recursive:true,force:true});throw e;}
  }
  async relink(oldRoot,newRoot) {
    oldRoot=normalize(oldRoot);newRoot=normalize(newRoot);const rows=this.db.prepare('SELECT * FROM assets').all().filter(r=>inside(oldRoot,r.path)),changes=[],remap=file=>file&&inside(oldRoot,file)?path.join(newRoot,path.relative(oldRoot,file)):file;let verified=0;
    for(const r of rows){const p=remap(r.path);if(!fs.existsSync(p))throw Error('新位置缺少文件：'+p);if(fs.statSync(p).size!==r.size)throw Error('新位置文件大小不一致：'+p);const digest=this.db.prepare('SELECT stored_digest FROM import_sources WHERE asset=? LIMIT 1').get(r.id)?.stored_digest||(fs.existsSync(r.path)?await hash(r.path):null);if(digest){if(await hash(p)!==digest)throw Error('新位置文件内容校验失败：'+p);verified++;}const next={...r,next:p};for(const field of ['cover','preview','cover_override','bundle_folder']){next[field]=remap(r[field]);if(next[field]&&next[field]!==r[field]&&!fs.existsSync(next[field]))throw Error('新位置缺少关联文件：'+next[field]);}changes.push(next);}
    this.db.exec('BEGIN');try{for(const r of changes)this.db.prepare('UPDATE assets SET path=?,path_key=?,folder=?,cover=?,preview=?,cover_override=?,bundle_folder=? WHERE id=?').run(r.next,key(r.next),path.dirname(r.next),r.cover,r.preview,r.cover_override,r.bundle_folder,r.id);for(const r of this.db.prepare('SELECT path FROM roots').all())if(inside(oldRoot,r.path)){this.db.prepare('DELETE FROM roots WHERE path=?').run(r.path);this.db.prepare('INSERT OR IGNORE INTO roots VALUES(?)').run(remap(r.path));}for(const f of this.db.prepare('SELECT path,icon,color FROM folder_preferences').all())if(inside(oldRoot,f.path)){this.db.prepare('DELETE FROM folder_preferences WHERE path=?').run(f.path);this.db.prepare('INSERT INTO folder_preferences(path,icon,color) VALUES(?,?,?)').run(remap(f.path),f.icon,f.color);}this.db.exec('COMMIT');}catch(e){this.db.exec('ROLLBACK');throw e;}return {count:changes.length,verified,message:'已重新定位 '+changes.length+' 项，其中 '+verified+' 项通过内容校验'+(verified<changes.length?'；旧索引中无哈希且原文件离线的条目仅核对大小':'')};
  }
}
module.exports={Library,kind,inside,safeJoin,hash};
