const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{Library}=require('../src/library.cjs');
for(const field of ['cover','preview','cover_override','bundle_folder'])test('deletion preserves a file referenced by another asset: '+field,async()=>{
 const root=fs.mkdtempSync(path.resolve('work/review-shared-'));let lib=new Library(root);
 try{
  const dir=path.join(root,'managed');fs.mkdirSync(dir,{recursive:true});
  const shared=path.join(dir,'shared.txt'),project=path.join(dir,'other.aep');
  fs.writeFileSync(shared,'shared bytes');fs.writeFileSync(project,'fixture');
  await lib.importPaths([shared,project]);
  const sharedId=lib.query({q:'shared'}).items[0].id,otherId=lib.query({q:'other'}).items[0].id;
  lib.db.prepare('UPDATE assets SET '+field+'=? WHERE id=?').run(field==='bundle_folder'?dir:shared,otherId);
  lib.update([sharedId],{hidden:true});
  await assert.rejects(lib.removePermanent([sharedId]),/其他素材/);
  lib.close();lib=new Library(root);
  assert.equal(fs.readFileSync(shared,'utf8'),'shared bytes');
  assert.equal(lib.get(sharedId).hidden,1);assert.equal(lib.get(otherId)[field],field==='bundle_folder'?dir:shared);
 }finally{lib.close();}
});
