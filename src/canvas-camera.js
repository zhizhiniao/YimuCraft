// One compositor transform per frame. Logical camera state follows input immediately.
(()=>{
 'use strict';
 window.YimuCanvasCamera=(world,options={})=>{
  const stage=world.parentElement,min=options.minScale??.05,max=options.maxScale??5;
  let x=options.startX||0,y=options.startY||0,scale=options.startScale||1,frame=0,notify=false,disposed=false;
  function flush(){if(frame)cancelAnimationFrame(frame);frame=0;if(disposed)return;world.style.transform=`translate3d(${x*scale}px,${y*scale}px,0) scale(${scale})`;if(notify){notify=false;world.dispatchEvent(new CustomEvent('panzoomchange',{detail:{x,y,scale}}));}}
  function queue(silent){notify ||= !silent;if(!frame&&!disposed)frame=requestAnimationFrame(flush);}
  function pan(nextX,nextY,opts={}){if(!Number.isFinite(nextX)||!Number.isFinite(nextY))return;if(x===nextX&&y===nextY)return;x=nextX;y=nextY;queue(opts.silent);}
  function zoom(next,opts={}){next=Math.max(min,Math.min(max,next));if(!Number.isFinite(next)||next===scale)return;const point=opts.focal||{x:stage.clientWidth/2,y:stage.clientHeight/2};x+=point.x/next-point.x/scale;y+=point.y/next-point.y/scale;scale=next;queue(opts.silent);}
  function zoomWithWheel(e){const rect=stage.getBoundingClientRect(),delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?stage.clientHeight:1);zoom(scale*Math.exp(-Math.max(-500,Math.min(500,delta))*.0015),{focal:{x:e.clientX-rect.left,y:e.clientY-rect.top}});}
  queue(true);
  return {pan,zoom,zoomWithWheel,zoomIn:()=>zoom(scale*Math.exp(options.step??.15)),zoomOut:()=>zoom(scale/Math.exp(options.step??.15)),getPan:()=>({x,y}),getScale:()=>scale,flush,destroy(){disposed=true;cancelAnimationFrame(frame);}};
 };
})();
