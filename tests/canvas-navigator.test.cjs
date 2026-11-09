const test=require('node:test'),assert=require('node:assert/strict');
const {layout,viewport,project,viewAt}=require('../src/canvas-navigator.js');
test('overview includes negative coordinates, distant items and the current viewport without stretching',()=>{
 const v={x:700,y:-300,scale:.25,width:960,height:640},items=[{x:-12000,y:-8000,width:500,height:900},{x:20000,y:15000,width:700,height:200}],m=layout(items,v,200,120);
 for(const i of [...items,viewport(v)]){const b=project(i,m);assert.ok(b.x>=0&&b.y>=0&&b.x+b.width<=200.00001&&b.y+b.height<=120.00001);assert.ok(Math.abs(b.width/b.height-i.width/i.height)<1e-9);}
});
test('navigator position round-trips at every camera scale and preserves drag offset',()=>{
 for(const scale of [.05,.2,1,5]){const v={x:-400,y:300,scale,width:1000,height:700},m=layout([{x:-2000,y:-1000,width:4000,height:2000}],v,180,108),b=project(viewport(v),m),point={x:b.x+b.width/2,y:b.y+b.height/2},p=viewAt(point,m,v);assert.ok(Math.abs(p.x-v.x)<1e-8&&Math.abs(p.y-v.y)<1e-8);const q=viewAt({x:point.x+17,y:point.y-9},m,v);assert.ok(Math.abs(q.x-(v.x-17/m.scale))<1e-8&&Math.abs(q.y-(v.y+9/m.scale))<1e-8);}
});
test('empty scenes and a single point still produce finite usable navigation',()=>{
 for(const items of [[],[{x:0,y:0,width:0,height:0}]]){const v={x:0,y:0,scale:1,width:1,height:1},m=layout(items,v,132,80);assert.ok(Number.isFinite(m.scale)&&m.scale>0);const p=viewAt({x:66,y:40},m,v);assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));}
});
