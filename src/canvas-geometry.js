/* Shared canvas geometry: screen affordances and persistent group membership. */
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.YimuCanvasGeometry=api;})(globalThis,()=>{
 const box=i=>({...i,width:i.kind==='group'&&i.collapsed?240:i.width,height:i.kind==='group'&&i.collapsed?150:i.height});
 function concealed(i,items){if(i.hiddenAt||!i.admitted)return true;let p=i.parentId,n=0;while(p&&n++<40){const g=items[p];if(!g||g.hiddenAt||!g.admitted||g.collapsed)return true;p=g.parentId;}return false;}
 function depth(i,items){let n=0,p=i.parentId;while(p&&n<40){n++;p=items[p]?.parentId;}return n;}
 function dropParent(items,item,moving){const b=box(item),cx=b.x+b.width/2,cy=b.y+b.height/2;return Object.values(items).filter(g=>{if(g.kind!=='group'||moving.has(g.id)||concealed(g,items))return false;let p=g.parentId,n=0;while(p&&n++<40){if(moving.has(p))return false;p=items[p]?.parentId;}const r=box(g);return cx>=r.x&&cx<=r.x+r.width&&cy>=r.y&&cy<=r.y+r.height;}).sort((a,b)=>depth(b,items)-depth(a,items)||box(a).width*box(a).height-box(b).width*box(b).height)[0]?.id||null;}
 function portZone(r,p,band=48,offset=18){if(!p)return null;const x=p.x,y=p.y,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mx=Math.min(8,r.width/2),my=Math.min(8,r.height/2);let side,cx,cy,t;
  if(y>=r.top&&y<=r.bottom&&x<r.left&&x>=r.left-band){side='left';cx=r.left-offset;cy=clamp(y,r.top+my,r.bottom-my);t=(cy-r.top)/r.height;}
  else if(y>=r.top&&y<=r.bottom&&x>r.right&&x<=r.right+band){side='right';cx=r.right+offset;cy=clamp(y,r.top+my,r.bottom-my);t=(cy-r.top)/r.height;}
  else if(x>=r.left&&x<=r.right&&y<r.top&&y>=r.top-band){side='top';cy=r.top-offset;cx=clamp(x,r.left+mx,r.right-mx);t=(cx-r.left)/r.width;}
  else if(x>=r.left&&x<=r.right&&y>r.bottom&&y<=r.bottom+band){side='bottom';cy=r.bottom+offset;cx=clamp(x,r.left+mx,r.right-mx);t=(cx-r.left)/r.width;}
  return side?{side,x:cx,y:cy,offset:clamp(t,0,1)}:null;
 }
 return {box,concealed,depth,dropParent,portZone};
});
