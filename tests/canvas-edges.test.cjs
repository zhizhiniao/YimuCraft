const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const edges=require('../src/canvas-edges.js'),{ProjectCanvases}=require('../src/project-canvas.cjs');
test('all port pairs route finite, axis-aligned bends; rounded paths retain endpoints',()=>{
 const a={x:0,y:0,width:200,height:100};for(const b of [{x:600,y:300,width:200,height:100},{x:-500,y:-300,width:200,height:100},{x:0,y:400,width:200,height:100}])for(const fromSide of ['left','right','top','bottom'])for(const toSide of ['left','right','top','bottom']){
  const l={fromSide,toSide,fromOffset:.25,toOffset:.75},sharp=edges.route({...l,style:'orthogonal'},a,b),rounded=edges.route({...l,style:'rounded'},a,b);
  assert.doesNotMatch(rounded,/NaN|Infinity|undefined/);const ps=[...sharp.matchAll(/[ML] (-?[\d.]+) (-?[\d.]+)/g)].map(m=>[+m[1],+m[2]]);for(let i=1;i<ps.length;i++)assert.ok(ps[i-1][0]===ps[i][0]||ps[i-1][1]===ps[i][1]);assert.equal(rounded.split(' L ')[0],sharp.split(' L ')[0]);assert.ok(rounded.endsWith(ps.at(-1).join(' ')));
 }
});
test('edge defaults, reverse merge, undo, validation and legacy reopen preserve node data',async()=>{
 const root=await fs.mkdtemp(path.resolve('work/edge-store-')),project=path.join(root,'source'),profile=path.join(root,'profile');await fs.mkdir(project);let s=await new ProjectCanvases(profile,{watch:false}).init();const id=await s.attach(project),a=(await s.create(id,{kind:'text',text:'A'})).createdId,b=(await s.create(id,{kind:'text',text:'B',x:500})).createdId;
 await s.connect(id,a,b,'去',{direction:'forward',style:'inherit'});let line=Object.keys(s.snapshot(id).links)[0];await s.connect(id,b,a,'回');const items=s.snapshot(id).items;await s.mergeLinks(id,line);assert.equal(Object.keys(s.snapshot(id).links).length,1);assert.equal(s.snapshot(id).links[line].direction,'both');assert.equal(s.snapshot(id).links[line].label,'去 / 回');await s.undoLinks(id);assert.equal(Object.keys(s.snapshot(id).links).length,2);
 await s.patchLink(id,line,{style:'straight',label:'',direction:'none'});await s.edgeStyle(id,'orthogonal',true);assert.equal(s.snapshot(id).links[line].style,undefined);await s.undoLinks(id);assert.equal(s.snapshot(id).links[line].style,'straight');assert.deepEqual(s.snapshot(id).items,items);
 const before=JSON.stringify(s.snapshot(id));for(const changes of [{label:'x'.repeat(161)},{direction:'bad'},{style:'bad'},{from:b},{color:'url(http://example.com)'}])await assert.rejects(async()=>s.patchLink(id,line,changes));assert.equal(JSON.stringify(s.snapshot(id)),before);
 await s.connect(id,a,b);assert.equal(Object.keys(s.snapshot(id).links).length,2);await s.close();s=await new ProjectCanvases(profile,{watch:false}).init();assert.equal(s.snapshot(id).settings.edgeStyle,'rounded');assert.equal(s.snapshot(id).links[line].direction,'none');await s.close();
 const file=path.join(profile,'projects.json'),legacy=JSON.parse(await fs.readFile(file,'utf8'));delete legacy.boards[0].settings.edgeStyle;await fs.writeFile(file,JSON.stringify(legacy));s=await new ProjectCanvases(profile,{watch:false}).init();assert.equal(s.snapshot(id).settings.edgeStyle,'curve');assert.deepEqual(s.snapshot(id).items,items);await s.close();
});
test('all styles avoid a blocker, moving an unrelated node invalidates a cached clear path',()=>{
 const a={id:'a',x:0,y:0,width:160,height:80},b={id:'b',x:700,y:0,width:160,height:80},block={id:'block',x:300,y:-100,width:200,height:280},l={fromSide:'right',toSide:'left'};
 for(const style of edges.styles){const open=edges.plan(l,a,b,style,[a,b]),avoided=edges.plan(l,a,b,style,[a,b,block],open);assert.equal(avoided.blocked,false,style);assert.ok(edges.clear(avoided.points,[a,b,block]),style);assert.equal(avoided.detour,true,style);assert.equal(avoided.points[0].x,a.x+a.width);assert.equal(avoided.points.at(-1).x,b.x);}
 const impossible={id:'overlap',x:100,y:-100,width:300,height:280};assert.equal(edges.plan(l,a,b,'rounded',[a,b,impossible]).blocked,true);
});
test('global labels do not overlap each other or nodes and stay bound to their own paths',()=>{
 const nodes=[{id:'a',x:0,y:0,width:160,height:80},{id:'b',x:1000,y:0,width:160,height:80}],points=[{x:160,y:40},{x:1000,y:40}],rows=Array.from({length:20},(_,i)=>({id:String(i).padStart(2,'0'),width:150,height:32,points})),positions=edges.layoutLabels(rows,nodes);assert.equal(positions.size,rows.length);
 const rects=[];for(const [id,p]of positions){assert.ok(!p.blocked,id);assert.ok(nodes.every(r=>!edges.overlaps(p,r,4)),id);assert.ok(rects.every(r=>!edges.overlaps(p,r,4)),id);assert.ok(p.anchor.x>=160&&p.anchor.x<=1000);assert.equal(p.anchor.y,40);rects.push(p);}assert.deepEqual(edges.layoutLabels(rows,nodes),positions);
});
test('dense grid routes across all four port sides without crossing node interiors',()=>{
 const boxes=Array.from({length:30},(_,i)=>({id:String(i),x:(i%6)*220,y:Math.floor(i/6)*160,width:140,height:90})),sides=['left','right','top','bottom'];
 for(let i=0;i<40;i++){const a=boxes[i%30],b=boxes[(i*7+11)%30];if(a===b)continue;const l={fromSide:sides[i%4],toSide:sides[(i+1)%4]},p=edges.plan(l,a,b,'rounded',boxes);assert.equal(p.blocked,false,JSON.stringify([a.id,b.id,l]));assert.ok(edges.clear(p.points,boxes));}
});
