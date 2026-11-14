const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {Library}=require('../src/library.cjs'),{ProjectCanvases}=require('../src/project-canvas.cjs');
const {search}=require('../src/library-discovery.cjs'),{libraryCandidateGroup,undoCandidateGroup}=require('../src/canvas-discovery.cjs'),Q=require('../src/discovery-query.js');
test('library discovery searches untagged names, paths and dimensions; pagination and scope are bounded',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'library-find-')),media=path.join(root,'客厅'),db=new Library(path.join(root,'index'));await fs.mkdir(media);
 try{for(const [name,w,h]of [['风景.jpg',320,180],['人物.jpg',180,320],['方图.jpg',200,200]])await require('sharp')({create:{width:w,height:h,channels:3,background:'#cdaa88'}}).jpeg().toFile(path.join(media,name));
  await db.importPaths([media]);assert.equal((await search(db,{query:Q.parse('客厅 图片')})).items.length,3);
  const horizontal=await search(db,{query:Q.parse('横屏 图片')});assert.equal(horizontal.items.length,1);assert.equal(horizontal.items[0].name,'风景.jpg');assert.deepEqual(horizontal.items[0].tags,[]);
  assert.equal((await search(db,{query:Q.parse('竖屏')})).items[0].name,'人物.jpg');
  const first=await search(db,{limit:1}),second=await search(db,{offset:first.nextOffset,limit:1});assert.equal(first.hasMore,true);assert.notEqual(first.items[0].id,second.items[0].id);
  assert.equal((await search(db,{query:Q.parse('图片 排除 人物')})).total,2);
  const ids=[Number(second.items[0].id),Number(first.items[0].id)];assert.deepEqual((await search(db,{ids,sort:'relevance'})).items.map(i=>Number(i.id)),ids);
  await assert.rejects(search(db,{location:'different'}),/切换/);await assert.rejects(search(db,{query:Q.parse('只看已确认')}),/项目/);await assert.rejects(search(db,{offset:Infinity}),/分页/);await assert.rejects(search(db,{},()=>true),/取消/);
 }finally{db.close();}
});
test('library candidate admission is atomic, preserves originals, survives reopen and supports undo',async()=>{
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'library-candidate-')),project=path.join(root,'project'),media=path.join(root,'outside.jpg');await fs.mkdir(project);await require('sharp')({create:{width:100,height:60,channels:3,background:'#aa6644'}}).jpeg().toFile(media);
 const store=await new ProjectCanvases(path.join(root,'state'),{watch:false}).init(),id=await store.attach(project),before=await fs.readFile(media);
 const assets=[{path:media,name:'outside.jpg',ext:'jpg',tags:[],note:'库内备注'}];
 const result=await libraryCandidateGroup(store,id,assets,'选片');const group=result.board.items[result.createdId];assert.equal(group.candidateIds.length,1);const candidate=result.board.items[group.candidateIds[0]];assert.equal(candidate.text,'库内备注');assert.equal(await store.resolve(id,candidate.id),media);assert.equal(result.board.items[candidate.referenceId].admitted,false);
 const prior=JSON.stringify(store.snapshot(id));await assert.rejects(libraryCandidateGroup(store,id,[...assets,{path:media+'-missing'}],'失败'));assert.equal(JSON.stringify(store.snapshot(id)),prior);
 await store.close();const reopened=await new ProjectCanvases(path.join(root,'state'),{watch:false}).init();await reopened.refresh(id);assert.equal(await reopened.resolve(id,candidate.id),media);await undoCandidateGroup(reopened,id,group.id);assert.ok(reopened.board(id).items[candidate.id].hiddenAt);assert.deepEqual(await fs.readFile(media),before);await reopened.close();
});
