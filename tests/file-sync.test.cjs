const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{Library}=require('../src/library.cjs');
test('unreadable directories retain the last known state instead of reporting missing files',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'yimu-sync-access-')),dir=path.join(root,'managed','private');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,'keep.txt');fs.writeFileSync(file,'keep');const lib=new Library(root),readdir=fs.promises.readdir;
 try{await lib.importPaths([file]);const id=lib.query({}).items[0].id;fs.promises.readdir=async function(folder,...args){if(folder===dir)throw Object.assign(Error('denied'),{code:'EACCES'});return readdir.call(this,folder,...args);};const result=await lib.synchronize();assert.equal(result.errors[0].code,'EACCES');assert.equal(lib.get(id).missing,0);assert.equal(result.missing,0);}finally{fs.promises.readdir=readdir;lib.close();fs.rmSync(root,{recursive:true,force:true});}
});
test('owned files synchronize additions, edits, rename metadata, offline and restart',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'yimu-sync-')),dir=path.join(root,'managed','batch');fs.mkdirSync(dir,{recursive:true});const original=path.join(dir,'音频.txt');fs.writeFileSync(original,'one');let lib=new Library(root);
 try{await lib.importPaths([original]);const id=lib.query({}).items[0].id;lib.update([id],{tags:['保留'],rating:4,note:'资料'});const collection=lib.saveCollection(null,'分类');lib.assignCollection([id],collection.id);
 const renamed=path.join(dir,'改名.txt');fs.renameSync(original,renamed);let r=await lib.synchronize();assert.equal(r.renamed,1);assert.equal(lib.get(id).name,'改名.txt');assert.deepEqual(lib.get(id).tags,['保留']);assert.equal(lib.get(id).rating,4);
 fs.writeFileSync(renamed,'changed content');fs.writeFileSync(path.join(dir,'新增.txt'),'new');r=await lib.synchronize();assert.equal(r.changed,1);assert.equal(r.added,1);assert.equal(lib.get(id).size,15);
 lib.close();lib=new Library(root);fs.renameSync(dir,path.join(root,'offline'));await lib.synchronize();assert.equal(lib.get(id).missing,1);assert.equal(lib.get(id).note,'资料');fs.renameSync(path.join(root,'offline'),dir);await lib.synchronize();assert.equal(lib.get(id).missing,0);assert.equal(lib.query({collection:collection.id}).items[0].id,id);
 fs.unlinkSync(renamed);await lib.synchronize();assert.equal(lib.get(id).missing,1);assert.equal(lib.query({}).total,2);
 }finally{lib.close();fs.rmSync(root,{recursive:true,force:true});}
});
test('unchanged sync performs no database writes and deferral never accesses a closed library',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'yimu-sync-idle-')),dir=path.join(root,'managed','batch');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,'same.txt');fs.writeFileSync(file,'same');const lib=new Library(root);let closed=false;
 try{await lib.importPaths([file]);const changes=()=>lib.db.prepare('SELECT total_changes() n').get().n;const before=changes();await lib.synchronize();assert.equal(changes(),before);const result=await lib.synchronize(()=>{lib.close();closed=true;return false;});assert.equal(result.deferred,true);}finally{if(!closed)lib.close();fs.rmSync(root,{recursive:true,force:true});}
});
test('external directory moves and extension changes retain identity; AE bundles stay private',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'yimu-sync-move-')),dir=path.join(root,'managed','batch','folder');fs.mkdirSync(dir,{recursive:true});let lib=new Library(root);
 try{const file=path.join(dir,'test.txt');fs.writeFileSync(file,'content');await lib.importPaths([file]);const id=lib.query({}).items[0].id;lib.update([id],{note:'keep'});const moved=path.join(path.dirname(dir),'renamed');fs.renameSync(dir,moved);await lib.synchronize();assert.equal(lib.get(id).path,path.join(moved,'test.txt'));assert.equal(lib.get(id).note,'keep');fs.renameSync(path.join(moved,'test.txt'),path.join(moved,'test.cube'));await lib.synchronize();assert.equal(lib.get(id).kind,'lut');assert.equal(lib.get(id).ext,'cube');
 const dependencies=path.join(root,'managed','batch','_ae');fs.mkdirSync(dependencies);fs.writeFileSync(path.join(dependencies,'private.txt'),'dependency');await lib.synchronize();assert.equal(lib.query({}).total,1);
 }finally{lib.close();fs.rmSync(root,{recursive:true,force:true});}
});

test('package file sync tracks owned assets and moved bundles without indexing package metadata or project dependencies',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'yimu-package-sync-')),bundle=path.join(root,'packages','one','bundle');fs.mkdirSync(bundle,{recursive:true});const file=path.join(bundle,'project.prproj');fs.writeFileSync(file,'fixture');fs.writeFileSync(path.join(bundle,'dependency.txt'),'dependency');fs.writeFileSync(path.join(root,'packages','one','yimucraft.json'),'metadata');let lib=new Library(root);
 try{await lib.importPaths([file]);const id=lib.query({}).items[0].id;lib.update([id],{note:'keep'});lib.db.prepare('UPDATE assets SET bundle_folder=? WHERE id=?').run(bundle,id);await lib.synchronize();assert.equal(lib.query({}).total,1);const moved=path.join(root,'managed','moved');fs.mkdirSync(path.dirname(moved),{recursive:true});fs.renameSync(bundle,moved);await lib.synchronize();assert.equal(lib.query({}).total,1);assert.equal(lib.get(id).path,path.join(moved,'project.prproj'));assert.equal(lib.get(id).bundle_folder,moved);assert.equal(lib.get(id).note,'keep');await lib.synchronize();assert.equal(lib.query({}).total,1);fs.unlinkSync(path.join(moved,'project.prproj'));await lib.synchronize();assert.equal(lib.get(id).missing,1);}finally{lib.close();fs.rmSync(root,{recursive:true,force:true});}
});
