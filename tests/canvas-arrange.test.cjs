const test=require('node:test'),assert=require('node:assert/strict'),{plan}=require('../src/canvas-arrange.js');
const item=(id,x,y,w=120,h=80,extra={})=>({id,x,y,width:w,height:h,kind:'image',admitted:true,hiddenAt:null,parentId:null,...extra});
const fs=require('node:fs/promises'),path=require('node:path'),{ProjectCanvases}=require('../src/project-canvas.cjs');
async function fixture(){const dir=await fs.mkdtemp(path.resolve('work/canvas-arrange-')),store=await new ProjectCanvases(path.join(dir,'settings'),{watch:false}).init(),id=await store.attach(dir);return {dir,store,id};}
test('guarded arrange and undo reject later edits and new group members atomically',async()=>{
 const {store,id}=await fixture();try{const group=(await store.create(id,{kind:'group'})).createdId,child=(await store.create(id,{kind:'note',x:40,y:50})).createdId;await store.patch(id,[{id:child,parentId:group}]);const rows=[group,child].map(key=>{const i=store.snapshot().items[key];return {id:key,x:i.x,y:i.y,parentId:i.parentId};});
 await store.patch(id,[{id:child,x:80}]);const before=store.snapshot();await assert.rejects(()=>store.patch(id,[{id:group,x:400},{id:child,x:440}],rows),/已再次修改/);assert.deepEqual(store.snapshot(),before);
 await store.patch(id,[{id:child,x:40}]);const added=(await store.create(id,{kind:'note'})).createdId;await store.patch(id,[{id:added,parentId:group}]);const expanded=store.snapshot();await assert.rejects(()=>store.patch(id,[{id:group,x:400},{id:child,x:440}],rows),/分组内容已变化/);assert.deepEqual(store.snapshot(),expanded);
 }finally{await store.close();}
});
test('canvas filters validate extra fields and survive reload while legacy filters remain accepted',async()=>{
 const {dir,store,id}=await fixture();try{const filters={shot:'',status:'pending',search:'参考',kind:'image',tag:'人物',ungrouped:true};await store.settings(id,{filters});const before=store.snapshot();await assert.rejects(()=>store.settings(id,{filters:{...filters,tag:42}}),/无效筛选/);assert.deepEqual(store.snapshot(),before);const reopened=await new ProjectCanvases(path.join(dir,'settings'),{watch:false}).init();assert.deepEqual(reopened.snapshot().filters,filters);await reopened.close();await store.settings(id,{filters:{shot:'',status:'',search:''}});assert.equal(store.snapshot().filters.kind,'');}finally{await store.close();}
});
test('arranging selected groups moves descendants exactly once and leaves unrelated items untouched',()=>{
 const items={g:item('g',300,100,400,400,{kind:'group'}),h:item('h',40,200,300,300,{kind:'group'}),nested:item('nested',350,120,150,150,{kind:'group',parentId:'g'}),child:item('child',380,170,30,40,{parentId:'nested'}),other:item('other',90,80)};
 const before=structuredClone(items),changes=plan(items,['g','h','nested','child'],'left');assert.deepEqual(items,before);assert.equal(changes.length,4);assert.equal(changes.find(c=>c.id==='g').x,40);assert.equal(changes.find(c=>c.id==='child').x,120);assert.ok(!changes.some(c=>c.id==='other'));
});
test('grid and equal-height preserve aspect and membership without touching source metadata',()=>{
 const items={a:item('a',30,40,100,50),b:item('b',250,100,60,120),c:item('c',600,300,80,80)};
 const grid=plan(items,['a','b','c'],'grid');assert.deepEqual(grid.map(i=>[i.x,i.y]),[[30,40],[162,40],[30,192]]);
 const same=plan(items,['a','b'],'height');assert.equal(same[1].height,50);assert.equal(same[1].width,25);assert.ok(same.every(c=>!Object.hasOwn(c,'parentId')&&!Object.hasOwn(c,'relative')));
});
test('distribution has equal edge gaps; incompatible selections and invalid sizes are rejected',()=>{
 const items={a:item('a',0,0,100),b:item('b',300,0,50),c:item('c',600,0,100)};const rows=plan(items,['a','b','c'],'horizontal');assert.equal(rows[1].x-(rows[0].x+100),rows[2].x-(rows[1].x+50));
 assert.throws(()=>plan(items,['a','b'],'horizontal'),/三个/);items.b.parentId='g';assert.throws(()=>plan(items,['a','b'],'grid'),/同一分组/);items.b.parentId=null;items.a.height=8000;items.b.width=8000;items.b.height=8;assert.throws(()=>plan(items,['a','b'],'height'),/超出/);
});
