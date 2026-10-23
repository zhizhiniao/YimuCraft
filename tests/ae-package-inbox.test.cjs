const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{Library}=require('../src/library.cjs'),{receive}=require('../src/ae-package-inbox.cjs');
test('AE in-progress package is invisible to synchronization; receipt commits only the project once',async()=>{
 const lib=new Library(fs.mkdtempSync(path.join(os.tmpdir(),'yimu-ae-inbox-')));try{
  const id='ae-123-456',folder=path.join(lib.folder,'managed','ae',id),inbox=path.join(lib.folder,'ae-inbox');fs.mkdirSync(folder,{recursive:true});fs.mkdirSync(inbox);const project=path.join(folder,'test.aep'),footage=path.join(folder,'sound.wav');fs.writeFileSync(project,'test-project');fs.writeFileSync(footage,'test-media');
  await lib.synchronize();assert.equal(lib.query().total,0);
  const receipt={id,operation:'collectCurrent',ok:true,result:{project,after:{missing:[],files:[{path:footage}]}}};fs.writeFileSync(path.join(inbox,id+'.json'),JSON.stringify(receipt));
  assert.equal((await receive(lib)).count,1);assert.equal(lib.query().total,1);assert.equal(lib.query().items[0].bundle_folder,folder);await lib.synchronize();assert.equal(lib.query().total,1);assert.equal(lib.query().items[0].missing,0);assert.equal((await receive(lib)).count,0);
 }finally{lib.close();}
});
test('AE receipt with dependency outside its owned package is rejected',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'yimu-ae-reject-')),lib=new Library(root);try{
  const id='ae-11-22',folder=path.join(root,'managed','ae',id),inbox=path.join(root,'ae-inbox');fs.mkdirSync(folder,{recursive:true});fs.mkdirSync(inbox);const project=path.join(folder,'test.aep'),outside=path.join(root,'outside.wav');fs.writeFileSync(project,'project');fs.writeFileSync(outside,'outside');fs.writeFileSync(path.join(inbox,id+'.json'),JSON.stringify({id,operation:'collectCurrent',ok:true,result:{project,after:{missing:[],files:[{path:outside}]}}}));const result=await receive(lib);assert.equal(result.count,0);assert.equal(result.errors.length,1);assert.equal(lib.query().total,0);assert.equal(fs.readFileSync(outside,'utf8'),'outside');
 }finally{lib.close();}
});
