const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{DatabaseSync}=require('node:sqlite');
const {Library}=require('../src/library.cjs'),appearance=require('../src/appearance.js');
test('legacy schema migrates; folder and collection appearance persists without changing media',async()=>{
 const root=path.resolve('work/appearance-'+Date.now()),index=path.join(root,'index');fs.mkdirSync(index,{recursive:true});
 const db=new DatabaseSync(path.join(index,'library.sqlite'));db.exec("CREATE TABLE folder_preferences(path TEXT PRIMARY KEY,icon TEXT NOT NULL DEFAULT '▱');CREATE TABLE collections(id INTEGER PRIMARY KEY,name TEXT NOT NULL,parent INTEGER REFERENCES collections(id) ON DELETE CASCADE);INSERT INTO collections VALUES(1,'旧分类',NULL)");db.close();
 const original=path.join(root,'original.txt');fs.writeFileSync(original,'unchanged');let lib=new Library(index);try{
  await lib.importPaths([original]);const item=lib.query().items[0],folder=path.dirname(item.path),before=fs.readFileSync(item.path);
  lib.setFolderAppearance(folder,{icon:'music',color:'#759cde'});lib.setCollectionAppearance(1,{icon:'👩‍💻',color:'#82AB72'});lib.saveCollection(1,'新名称');
  assert.throws(()=>lib.setFolderAppearance(path.join(root,'unrelated'),{icon:'folder'}),/当前库/);
  assert.throws(()=>lib.setCollectionAppearance(1,{icon:'<script>'}),/Emoji/);
  lib.close();lib=new Library(index);assert.equal(lib.stats().folderPreferences.find(f=>f.path===folder).color,'#759CDE');assert.equal(lib.stats().collections[0].icon,'👩‍💻');assert.equal(lib.stats().collections[0].name,'新名称');assert.deepEqual(fs.readFileSync(item.path),before);
  lib.setFolderAppearance(folder,{icon:'folder',color:''});assert.equal(lib.stats().folderPreferences[0].color,'');assert.equal(fs.readFileSync(original,'utf8'),'unchanged');
 }finally{lib.close();}
});
test('appearance validates a single emoji and CSS-safe colors; legacy icons remain recognizable',()=>{
 assert.deepEqual(appearance.normalize({icon:'♫'}),{icon:'music',color:''});assert.equal(appearance.normalize({icon:'🎬'}).icon,'🎬');
 assert.throws(()=>appearance.normalize({icon:'🎬🎵'}));assert.throws(()=>appearance.normalize({icon:'music',color:'url(x)'}));
});
