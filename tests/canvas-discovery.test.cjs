const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {ProjectCanvases}=require('../src/project-canvas.cjs');
const {candidateGroup,undoCandidateGroup,visualSearch}=require('../src/canvas-discovery.cjs');
const Q=require('../src/discovery-query.js');
test('discovery narrows real metadata without inferring unlabelled visual meaning',()=>{
 const query=Q.parse('找些客厅图片，横屏');assert.deepEqual(query.terms,['客厅']);assert.equal(query.kind,'image');assert.equal(query.orientation,'landscape');
 const narrow=Q.parse('只看已确认，不要人物',query);assert.deepEqual(narrow.terms,['客厅']);assert.deepEqual(narrow.exclude,['人物']);
 const row={kind:'image',name:'客厅.png',tags:['自然光'],status:'confirmed',pixelWidth:1600,pixelHeight:900};assert.equal(Q.matches(row,narrow),true);assert.equal(Q.matches({...row,tags:['人物']},narrow),false);assert.equal(Q.matches({...row,pixelWidth:0},narrow),false);
 assert.equal(Q.matches(row,Q.parse('自然光')),true);assert.equal(Q.matches({...row,tags:[]},Q.parse('自然光')),false);
 assert.equal(Q.matches({...row,kind:'video'},Q.parse('不要视频')),false);assert.equal(Q.matches(row,Q.parse('不要视频')),true);
 assert.deepEqual(Q.parse('清除条件，只看竖屏',narrow),{...Q.empty(),orientation:'portrait'});
 assert.throws(()=>Q.parse('x'.repeat(501)),/500/);assert.throws(()=>Q.normalize({kind:'delete'}),/无效/);
});
test('candidate groups preserve originals, persist references, synchronize and roll back failed saves',async()=>{
 const root=await fs.mkdtemp(path.resolve('work/discovery-core-')),source=path.join(root,'source'),profile=path.join(root,'profile');await fs.mkdir(source);
 const sharp=require('sharp');for(const name of ['镜头_001.png','镜头_002.png','镜头_003.png'])await sharp({create:{width:160,height:90,channels:3,background:'#ba7755'}}).png().toFile(path.join(source,name));
 let store=await new ProjectCanvases(profile,{watch:false}).init();try{
  const id=await store.attach(source);await store.activate(id);await store.settings(id,{autoSequences:false});let b=store.snapshot(id),sources=Object.values(b.items).filter(i=>i.kind==='image'),ids=sources.slice(0,2).map(i=>i.id),before=structuredClone(b.items);
  const result=await candidateGroup(store,id,[...ids,ids[0]],'开场候选');b=result.board;assert.equal(b.items[result.createdId].candidateIds.length,2);for(const row of sources)assert.deepEqual(b.items[row.id],before[row.id]);
  let refs=Object.values(b.items).filter(i=>i.referenceId);assert.equal(refs.length,2);assert.equal(await store.resolve(id,refs[0].id),await store.resolve(id,refs[0].referenceId));
  await store.workspace('discovery');await store.close();store=await new ProjectCanvases(profile,{watch:false}).init();assert.equal(store.list().workspace,'discovery');await store.activate(id);b=store.snapshot(id);assert.equal(Object.values(b.items).filter(i=>i.kind==='image'&&!i.referenceId).length,3);assert.equal(b.items[result.createdId].candidateIds.length,2);assert.ok(refs.every(i=>!b.items[i.id].missing));assert.equal(Object.values(b.items).find(i=>i.kind==='sequence').frameIds.length,3);
  await fs.rename(path.join(source,'镜头_001.png'),path.join(source,'重命名.png'));await store.refresh(id);b=store.snapshot(id);const renamed=Object.values(b.items).find(i=>!i.referenceId&&i.name==='重命名.png');assert.ok(renamed);const ref=Object.values(b.items).find(i=>i.referenceId===renamed.id);assert.equal(ref.relative,renamed.relative);assert.equal(await store.resolve(id,ref.id),path.join(source,'重命名.png'));
  await fs.unlink(path.join(source,'重命名.png'));await store.refresh(id);assert.equal(store.snapshot(id).items[ref.id].missing,true);
  const originalSave=store.save,unchanged=store.snapshot(id);store.save=async()=>{throw Error('disk full');};await assert.rejects(candidateGroup(store,id,[ids[1]],'失败组'),/disk full/);store.save=originalSave;assert.deepEqual(store.snapshot(id),unchanged);
  await undoCandidateGroup(store,id,result.createdId);b=store.snapshot(id);assert.ok(b.items[result.createdId].hiddenAt);assert.ok(b.items[ids[1]]&&!b.items[ids[1]].hiddenAt);assert.equal((await fs.readdir(source)).length,2);
 }finally{await store.close();}
});
test('image search uses real pixels, ranks identical files first and validates scope',async()=>{
 const root=await fs.mkdtemp(path.resolve('work/discovery-visual-')),source=path.join(root,'source');await fs.mkdir(source);const sharp=require('sharp');for(const [name,color]of [['red.png','#ee3322'],['copy.png','#ee3322'],['blue.png','#2233ee']])await sharp({create:{width:24,height:24,channels:3,background:color}}).png().toFile(path.join(source,name));const store=await new ProjectCanvases(path.join(root,'profile'),{watch:false}).init();try{const id=await store.attach(source);await store.activate(id);const rows=Object.values(store.snapshot(id).items),red=rows.find(i=>i.name==='red.png'),blue=rows.find(i=>i.name==='blue.png');const search=visualSearch(store),result=await search.search(id,Q.empty(),{id:red.id});assert.equal(result.ids.at(-1),blue.id);assert.equal(result.ids.length,3);assert.equal(result.skipped,0);await assert.rejects(search.search(id,{kind:'invalid'},{id:red.id}),/无效/);}finally{await store.close();}
});
