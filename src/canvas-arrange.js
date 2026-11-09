/* Pure layout planning. A selected group moves with all descendants. */
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.YimuCanvasArrange=api;})(globalThis,()=>{
 'use strict';
 const box=i=>({...i,width:i.kind==='group'&&i.collapsed?240:i.width,height:i.kind==='group'&&i.collapsed?150:i.height});
 function plan(items,ids,mode,gap=32){
  const selected=new Set(ids),rows=[...selected].map(id=>items[id]).filter(i=>i&&i.admitted&&!i.hiddenAt).filter(i=>{let p=i.parentId,n=0;while(p&&n++<40){if(selected.has(p))return false;p=items[p]?.parentId;}return true;}).sort((a,b)=>a.y-b.y||a.x-b.x||a.id.localeCompare(b.id));
  if(rows.length<2)throw Error('请先选择至少两个独立元素');
  if(new Set(rows.map(i=>i.parentId||null)).size>1)throw Error('请选择同一分组内的元素，或选择整个分组');
  const placed=new Map(rows.map(i=>[i.id,box(i)])),left=Math.min(...rows.map(i=>i.x)),top=Math.min(...rows.map(i=>i.y));
  if(mode==='left'||mode==='top')for(const r of placed.values())r[mode==='left'?'x':'y']=mode==='left'?left:top;
  else if(mode==='grid'){
   const cols=Math.ceil(Math.sqrt(rows.length)),width=Math.max(...[...placed.values()].map(i=>i.width)),height=Math.max(...[...placed.values()].map(i=>i.height));
   rows.forEach((i,n)=>Object.assign(placed.get(i.id),{x:left+n%cols*(width+gap),y:top+Math.floor(n/cols)*(height+gap)}));
  }else if(mode==='horizontal'||mode==='vertical'){
   if(rows.length<3)throw Error('等距排列至少需要三个元素');
   const axis=mode==='horizontal'?'x':'y',size=axis==='x'?'width':'height',sorted=[...placed.values()].sort((a,b)=>a[axis]-b[axis]||a.id.localeCompare(b.id)),start=sorted[0][axis],end=Math.max(...sorted.map(i=>i[axis]+i[size])),total=sorted.reduce((n,i)=>n+i[size],0),spacing=Math.max(0,(end-start-total)/(rows.length-1));
   let pos=start;for(const r of sorted){r[axis]=pos;pos+=r[size]+spacing;}
  }else if(mode==='height'){
   if(rows.some(i=>i.kind==='group'))throw Error('等高仅用于素材和文字；分组可使用对齐、等距或网格');
   const height=rows[0].height;for(const r of placed.values()){r.width=r.width*height/r.height;r.height=height;}
  }else throw Error('未知整理方式');
  const changes=new Map();
  for(const original of rows){const r=placed.get(original.id),dx=r.x-original.x,dy=r.y-original.y;
   changes.set(r.id,{id:r.id,x:r.x,y:r.y,...(mode==='height'?{width:r.width,height:r.height,sizeMode:'manual'}:{})});
   if(original.kind==='group')for(const child of Object.values(items)){let p=child.parentId,n=0;while(p&&n++<40){if(p===original.id){changes.set(child.id,{id:child.id,x:child.x+dx,y:child.y+dy});break;}p=items[p]?.parentId;}}
  }
  for(const c of changes.values())for(const [k,v]of Object.entries(c))if(['x','y','width','height'].includes(k)&&(!Number.isFinite(v)||Math.abs(v)>100000||(['width','height'].includes(k)&&(v<8||v>8000))))throw Error('整理后的尺寸或位置超出画布范围');
  return [...changes.values()];
 }
 return {plan};
});
