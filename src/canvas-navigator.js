/* Overview geometry is shared with tests; the scene is painted only after edits. */
((root,factory)=>{const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.YimuCanvasNavigator=api;})(globalThis,()=>{
 'use strict';
 function viewport(v){return {x:-v.x,y:-v.y,width:v.width/v.scale,height:v.height/v.scale};}
 function layout(items,v,width,height){
  const boxes=[...items,viewport(v)];let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  for(const b of boxes){left=Math.min(left,b.x);top=Math.min(top,b.y);right=Math.max(right,b.x+b.width);bottom=Math.max(bottom,b.y+b.height);}
  const pad=Math.max(40,Math.max(right-left,bottom-top)*.04);left-=pad;top-=pad;right+=pad;bottom+=pad;
  const scale=Math.min(width/(right-left),height/(bottom-top));
  return {scale,x:(width-(right-left)*scale)/2-left*scale,y:(height-(bottom-top)*scale)/2-top*scale,width,height};
 }
 function project(b,m){return {x:b.x*m.scale+m.x,y:b.y*m.scale+m.y,width:b.width*m.scale,height:b.height*m.scale};}
 function viewAt(point,m,v){return {x:v.width/(2*v.scale)-(point.x-m.x)/m.scale,y:v.height/(2*v.scale)-(point.y-m.y)/m.scale};}
 function mount(stage,callbacks){
  const panel=document.createElement('aside');panel.className='canvas-navigator';panel.hidden=true;panel.setAttribute('aria-label','画布布局导航');
  panel.innerHTML='<header><span>导航</span><button type="button" aria-label="收起导航" aria-expanded="true">−</button></header><div class="canvas-navigator-map" tabindex="0" role="region" aria-label="画布导航，拖动视口或点击定位，方向键平移"><canvas aria-hidden="true"></canvas><div class="canvas-navigator-viewport" aria-hidden="true"></div></div>';
  stage.append(panel);const map=panel.querySelector('.canvas-navigator-map'),canvas=panel.querySelector('canvas'),rect=panel.querySelector('.canvas-navigator-viewport'),toggle=panel.querySelector('button'),ctx=canvas.getContext('2d');
  let items=[],selection=new Set(),mapping=null,drag=null,enabled=false,frame=0,dirty=true,refit=true,settle=0,collapsed=false,width=200,height=120,stageWidth=1,stageHeight=1;
  const view=()=>({...callbacks.getView(),width:stageWidth,height:stageHeight});
  function schedule(scene=false,bounds=false){dirty ||= scene;refit ||= bounds;if(!frame)frame=requestAnimationFrame(paint);}
  function paint(){
   frame=0;if(!enabled||collapsed||!items.length)return;
   const v=view();if(refit&&!drag){mapping=layout(items,v,width,height);refit=false;dirty=true;}if(!mapping)return;
   if(dirty){const dpr=Math.min(2,devicePixelRatio||1);if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    const style=getComputedStyle(stage),muted=style.getPropertyValue('--muted').trim()||'#a5a19b',accent=style.getPropertyValue('--accent').trim()||'#da7956';
    for(const item of items){const b=project(item,mapping);ctx.fillStyle=selection.has(item.id)?accent:item.kind==='group'?(item.color||'#b78c66')+'22':muted;ctx.fillRect(b.x,b.y,Math.max(1,b.width),Math.max(1,b.height));if(item.kind==='group'){ctx.strokeStyle=item.color||accent;ctx.lineWidth=1;ctx.strokeRect(b.x+.5,b.y+.5,b.width,b.height);}}
    dirty=false;
   }
   const b=project(viewport(v),mapping);rect.style.transform=`translate(${b.x}px,${b.y}px)`;rect.style.width=Math.max(5,b.width)+'px';rect.style.height=Math.max(5,b.height)+'px';
  }
  function update(panning=false){schedule();clearTimeout(settle);if(!drag&&!panning)settle=setTimeout(()=>schedule(false,true),300);}
  function finish(cancel=false){if(!drag)return;const d=drag;drag=null;if(map.hasPointerCapture(d.pointer))map.releasePointerCapture(d.pointer);map.classList.remove('is-dragging');if(cancel)callbacks.pan(d.view.x,d.view.y);callbacks.commit();schedule(false,true);}
  function move(e){if(!drag)return;const point={x:e.clientX-drag.bounds.left-drag.offset.x,y:e.clientY-drag.bounds.top-drag.offset.y},p=viewAt(point,drag.mapping,drag.view);callbacks.pan(p.x,p.y);}
  map.addEventListener('pointerdown',e=>{if(e.button!==0||!mapping)return;e.preventDefault();e.stopPropagation();callbacks.begin();clearTimeout(settle);const v=view(),b=project(viewport(v),mapping),bounds=map.getBoundingClientRect(),p={x:e.clientX-bounds.left,y:e.clientY-bounds.top},inside=p.x>=b.x&&p.x<=b.x+b.width&&p.y>=b.y&&p.y<=b.y+b.height;
   drag={pointer:e.pointerId,view:v,mapping:{...mapping},bounds,offset:inside?{x:p.x-b.x-b.width/2,y:p.y-b.y-b.height/2}:{x:0,y:0}};map.focus();map.setPointerCapture(e.pointerId);map.classList.add('is-dragging');move(e);
  });
  map.addEventListener('pointermove',e=>{if(drag?.pointer===e.pointerId){e.stopPropagation();move(e);}});
  map.addEventListener('pointerup',e=>{if(drag?.pointer===e.pointerId){e.stopPropagation();move(e);finish();}});
  map.addEventListener('pointercancel',()=>finish(true));map.addEventListener('lostpointercapture',()=>finish(true));
  map.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(true);return;}if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();e.stopPropagation();const v=view(),step=e.shiftKey ? .5 : .1;callbacks.begin();callbacks.pan(v.x+({ArrowLeft:1,ArrowRight:-1}[e.key]||0)*v.width/v.scale*step,v.y+({ArrowUp:1,ArrowDown:-1}[e.key]||0)*v.height/v.scale*step);callbacks.commit();schedule(false,true);});
  panel.addEventListener('wheel',e=>{e.preventDefault();e.stopPropagation();},{passive:false});for(const name of ['dblclick','contextmenu'])panel.addEventListener(name,e=>{e.preventDefault();e.stopPropagation();});
  toggle.onclick=()=>{finish(true);collapsed=!collapsed;panel.classList.toggle('collapsed',collapsed);map.hidden=collapsed;toggle.textContent=collapsed?'+':'−';toggle.setAttribute('aria-label',collapsed?'展开导航':'收起导航');toggle.setAttribute('aria-expanded',String(!collapsed));if(!collapsed)schedule(true,true);};
  const resize=new ResizeObserver(()=>{stageWidth=stage.clientWidth||1;stageHeight=stage.clientHeight||1;if(!collapsed){width=map.clientWidth||200;height=map.clientHeight||120;}schedule(true,true);});resize.observe(stage);resize.observe(map);
  const theme=new MutationObserver(()=>schedule(true));theme.observe(document.body,{attributes:true,attributeFilter:['class','data-theme']});theme.observe(document.documentElement,{attributes:true,attributeFilter:['class','data-theme']});
  const blur=()=>finish(true);window.addEventListener('blur',blur);
  return {get dragging(){return !!drag;},update,setItems(rows){items=rows.map(i=>({...i})).sort((a,b)=>(a.kind==='group'?0:1)-(b.kind==='group'?0:1));panel.hidden=!enabled||!items.length;schedule(true,true);},select(ids){selection=new Set(ids);schedule(true);},enable(value){finish(true);enabled=value;panel.hidden=!value||!items.length;if(value)schedule(true,true);},cancel:()=>finish(true),destroy(){finish(true);cancelAnimationFrame(frame);clearTimeout(settle);resize.disconnect();theme.disconnect();window.removeEventListener('blur',blur);panel.remove();}};
 }
 return {viewport,layout,project,viewAt,mount};
});
