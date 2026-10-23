const fs=require('node:fs'),path=require('node:path');
const key=p=>path.resolve(p).toLowerCase();
function identity(st){return st.ino?`${st.dev}:${st.ino}:${st.birthtimeNs}`:null;}
function remember(lib,file,id){const st=fs.lstatSync(file,{bigint:true});lib.db.prepare('INSERT INTO file_identity(asset,identity) VALUES(?,?) ON CONFLICT(asset) DO UPDATE SET identity=excluded.identity').run(id,identity(st));}
async function synchronize(lib,beforeApply=()=>true){
 const {inside}=require('./library.cjs'),managed=path.join(lib.folder,'managed');
 // Only library-owned files are watched. Source copies remain independent.
 const roots=[managed,path.join(lib.folder,'packages')];
 const files=new Map(),errors=[];
 async function scan(dir){try{if((await fs.promises.lstat(dir)).isSymbolicLink())return;for(const entry of await fs.promises.readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isSymbolicLink())continue;if(entry.isDirectory()){if(!['_ae','.git','node_modules','.yimucraft'].includes(entry.name))await scan(file);}else if(entry.isFile()){const st=await fs.promises.lstat(file,{bigint:true});files.set(key(file),{file,identity:identity(st),size:Number(st.size),modified:Number(st.mtimeNs)/1e6});}}}catch(e){errors.push({path:dir,code:e.code,error:e.message});}}
 for(const root of roots.filter((r,i)=>!roots.some((other,j)=>j!==i&&inside(other,r)&&other!==r)))await scan(root);
 if(!lib.db.isOpen)return {deferred:true};
 const rows=lib.db.prepare('SELECT a.*,f.identity FROM assets a LEFT JOIN file_identity f ON f.asset=a.id').all().filter(a=>roots.some(r=>inside(r,a.path)));
 const indexedPaths=new Map(rows.map(a=>[key(a.path),a.id]));const bundles=rows.filter(a=>a.bundle_folder&&a.kind==='project').map(a=>a.bundle_folder);
 const byIdentity=new Map();for(const f of files.values()){if(!f.identity)continue;const list=byIdentity.get(f.identity)||[];list.push(f);byIdentity.set(f.identity,list);}
 const modelResources=new Set();for(const row of rows.filter(r=>['gltf','glb','obj'].includes(r.ext))){const file=files.get(key(row.path))?.file;if(file)try{for(const resource of await require('./model-resources.cjs').resources(file))modelResources.add(key(resource.path));}catch(e){errors.push({path:file,error:e.message});}}
 if(!beforeApply())return {deferred:true};
 let added=0,changed=0,renamed=0,missing=0;const seen=new Set();
 lib.db.exec('BEGIN');try{
 for(const row of rows){let f=files.get(key(row.path));if(!f&&row.identity){const candidates=byIdentity.get(row.identity)||[];if(candidates.length===1&&(!indexedPaths.has(key(candidates[0].file))||indexedPaths.get(key(candidates[0].file))===row.id))f=candidates[0];}
 if(!f){if(errors.some(e=>e.code!=='ENOENT'&&inside(e.path,row.path)))continue;if(!row.missing){lib.db.prepare('UPDATE assets SET missing=1 WHERE id=?').run(row.id);missing++;}continue;}
 seen.add(key(f.file));if(f.file!==row.path){lib.db.prepare('UPDATE assets SET path=?,path_key=?,folder=?,name=? WHERE id=?').run(f.file,key(f.file),path.dirname(f.file),path.basename(f.file),row.id);for(const field of ['cover','preview','cover_override'])lib.db.prepare('UPDATE assets SET '+field+'=? WHERE '+field+'=?').run(f.file,row.path);if(path.dirname(f.file)!==path.dirname(row.path)){for(const field of ['cover','preview','cover_override','bundle_folder'])if(row[field]&&inside(path.dirname(row.path),row[field])){const relocated=path.join(path.dirname(f.file),path.relative(path.dirname(row.path),row[field]));if(fs.existsSync(relocated)){lib.db.prepare('UPDATE assets SET '+field+'=? WHERE id=?').run(relocated,row.id);if(field==='bundle_folder')bundles.push(relocated);}}}renamed++;}
 if(f.file!==row.path||row.size!==f.size||Math.abs(row.modified-f.modified)>1||row.missing){await lib.importPaths([f.file]);lib.db.prepare('DELETE FROM visual_features WHERE asset=?').run(row.id);lib.db.prepare('DELETE FROM semantic_features WHERE asset=?').run(row.id);changed++;}
 if(row.missing)lib.db.prepare('UPDATE assets SET missing=0 WHERE id=?').run(row.id);if(row.identity!==f.identity)remember(lib,f.file,row.id);
 }
 for(const [k,f] of files){if(seen.has(k)||modelResources.has(k)||inside(path.join(managed,'ae'),f.file)||!inside(managed,f.file)||bundles.some(b=>inside(b,f.file)))continue;await lib.importPaths([f.file]);added++;}
 lib.db.exec('COMMIT');
 }catch(e){lib.db.exec('ROLLBACK');throw e;}
 return {added,changed,renamed,missing,errors};
}
module.exports={remember,synchronize};
