/* Resizable preview window and a media camera, independent of canvas coordinates. */
(()=>{
 'use strict';
 const make=(tag,cls,text)=>{const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function mount(dialog,stage){
  const abort=new AbortController(),signal=abort.signal,listen=(n,type,fn,options={})=>n.addEventListener(type,fn,{...options,signal});
  const header=make('header','canvas-preview-header'),title=dialog.querySelector('h2'),tools=make('div','canvas-preview-tools'),zoomLabel=make('output','canvas-preview-zoom','100%');
  title.id='canvasPreviewTitle';dialog.setAttribute('aria-labelledby',title.id);dialog.prepend(header);header.append(title,tools);
  const button=(label,fn)=>{const n=make('button','',label);n.type='button';n.onclick=fn;tools.append(n);return n;};
  let width=1,height=1,scale=1,x=0,y=0,fitted=true,visual=null,raf=0,closed=false,gesture=null,maximized=false,normal;
  const fitButton=button('适合窗口',fit),actualButton=button('100%',()=>zoom(1));tools.append(zoomLabel);
  const maximize=button('最大化',()=>setMaximized(!maximized));maximize.setAttribute('aria-pressed','false');
  stage.tabIndex=0;stage.setAttribute('aria-label','媒体预览，滚轮缩放，中键平移');stage.title='滚轮缩放 · 中键拖动平移 · 双击画面适合窗口';
  const hint=make('span','canvas-preview-hint','滚轮缩放 · 中键平移');stage.append(hint);
  function paint(){raf=0;if(!visual)return;visual.style.width=width+'px';visual.style.height=height+'px';visual.style.transform=`translate(${x}px, ${y}px) scale(${scale})`;zoomLabel.value=Math.round(scale*100)+'%';}
  function schedule(){if(!raf&&!closed)raf=requestAnimationFrame(paint);}
  function fit(){fitted=true;scale=Math.min(stage.clientWidth/width,stage.clientHeight/height);if(!Number.isFinite(scale)||scale<=0)scale=1;x=(stage.clientWidth-width*scale)/2;y=(stage.clientHeight-height*scale)/2;schedule();}
  function zoom(next,cx=stage.clientWidth/2,cy=stage.clientHeight/2){if(!visual)return;next=clamp(next,.01,32);x=cx-(cx-x)*next/scale;y=cy-(cy-y)*next/scale;scale=next;fitted=false;schedule();}
  function dimensions(){if(!visual)return;const w=visual.videoWidth||visual.naturalWidth,h=visual.videoHeight||visual.naturalHeight;if(w&&h){const changed=w!==width||h!==height;width=w;height=h;if(fitted||changed)fit();}}
  function setVisual(node){visual=node;const enabled=!!node;for(const n of [fitButton,actualButton,zoomLabel,hint])n.hidden=!enabled;if(!node)return;node.classList.add('canvas-preview-visual');node.draggable=false;listen(node,'load',dimensions);listen(node,'loadedmetadata',dimensions);dimensions();}
  listen(stage,'wheel',e=>{if(!visual)return;e.preventDefault();const r=stage.getBoundingClientRect(),dy=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1);zoom(scale*Math.exp(-clamp(dy,-300,300)*.002),e.clientX-r.left,e.clientY-r.top);},{passive:false});
  listen(stage,'dblclick',e=>{if(visual&&e.button===0)fit();});
  listen(stage,'pointerdown',e=>{if(e.button!==1||!visual)return;e.preventDefault();stage.setPointerCapture(e.pointerId);gesture={type:'pan',id:e.pointerId,startX:e.clientX,startY:e.clientY,x,y};stage.classList.add('is-panning');});
  listen(stage,'auxclick',e=>{if(e.button===1)e.preventDefault();});
  listen(dialog,'keydown',e=>{if(e.target.matches('input,textarea,select')||!visual)return;if(['+','=','-','0'].includes(e.key)){e.preventDefault();if(e.key==='0')fit();else zoom(scale*(e.key==='-'?1/1.2:1.2));}});
  function bounds(value){const maxW=Math.max(1,innerWidth-16),maxH=Math.max(1,innerHeight-16),w=clamp(value.width,Math.min(560,maxW),maxW),h=clamp(value.height,Math.min(360,maxH),maxH);return {width:w,height:h,left:clamp(value.left,8,Math.max(8,innerWidth-w-8)),top:clamp(value.top,8,Math.max(8,innerHeight-h-8))};}
  function apply(rect){for(const key of ['width','height','left','top'])dialog.style[key]=rect[key]+'px';}
  function remember(){if(maximized)return;normal=bounds(Object.fromEntries(['width','height','left','top'].map(k=>[k,parseFloat(dialog.style[k])])));try{localStorage.setItem('yimu.canvas.preview.bounds',JSON.stringify(normal));}catch{}}
  function setMaximized(value){if(value===maximized)return;if(value)remember();maximized=value;dialog.classList.toggle('is-maximized',value);maximize.textContent=value?'还原窗口':'最大化';maximize.setAttribute('aria-pressed',String(value));apply(value?{left:8,top:8,width:innerWidth-16,height:innerHeight-16}:bounds(normal));}
  listen(header,'dblclick',e=>{if(!e.target.closest('button'))setMaximized(!maximized);});
  listen(header,'pointerdown',e=>{if(e.button!==0||maximized||e.target.closest('button'))return;e.preventDefault();header.setPointerCapture(e.pointerId);gesture={type:'move',id:e.pointerId,startX:e.clientX,startY:e.clientY,rect:dialog.getBoundingClientRect()};});
  for(const edge of ['n','e','s','w','ne','nw','se','sw']){const grip=make('div','canvas-preview-resize');grip.dataset.edge=edge;grip.setAttribute('aria-hidden','true');dialog.append(grip);listen(grip,'pointerdown',e=>{if(e.button!==0||maximized)return;e.preventDefault();grip.setPointerCapture(e.pointerId);gesture={type:'resize',edge,id:e.pointerId,startX:e.clientX,startY:e.clientY,rect:dialog.getBoundingClientRect()};});}
  listen(dialog,'pointermove',e=>{if(!gesture||gesture.id!==e.pointerId)return;const dx=e.clientX-gesture.startX,dy=e.clientY-gesture.startY;if(gesture.type==='pan'){x=gesture.x+dx;y=gesture.y+dy;fitted=false;schedule();return;}const r=gesture.rect;if(gesture.type==='move'){apply(bounds({width:r.width,height:r.height,left:r.left+dx,top:r.top+dy}));return;}let left=r.left,right=r.right,top=r.top,bottom=r.bottom;const edge=gesture.edge,minW=Math.min(560,innerWidth-16),minH=Math.min(360,innerHeight-16);if(edge.includes('w'))left=clamp(r.left+dx,8,right-minW);if(edge.includes('e'))right=clamp(r.right+dx,left+minW,innerWidth-8);if(edge.includes('n'))top=clamp(r.top+dy,8,bottom-minH);if(edge.includes('s'))bottom=clamp(r.bottom+dy,top+minH,innerHeight-8);apply({left,top,width:right-left,height:bottom-top});});
  function end(){if(!gesture)return;if(gesture.type!=='pan')remember();gesture=null;stage.classList.remove('is-panning');}
  for(const event of ['pointerup','pointercancel','lostpointercapture'])listen(dialog,event,end);listen(window,'blur',end);
  listen(window,'resize',()=>{apply(maximized?{left:8,top:8,width:innerWidth-16,height:innerHeight-16}:bounds(dialog.getBoundingClientRect()));if(!maximized)remember();});
  const observer=new ResizeObserver(()=>{if(fitted)fit();});observer.observe(stage);
  let stored;try{stored=JSON.parse(localStorage.getItem('yimu.canvas.preview.bounds'));}catch{}
  normal=bounds(stored&&['width','height','left','top'].every(k=>Number.isFinite(stored[k]))?stored:{width:1100,height:760,left:(innerWidth-1100)/2,top:(innerHeight-760)/2});apply(normal);
  listen(dialog,'close',()=>{remember();closed=true;abort.abort();observer.disconnect();cancelAnimationFrame(raf);});
  setVisual(stage.querySelector('img,video'));return {setVisual,fit};
 }
 window.YimuCanvasPreview={mount};
})();
