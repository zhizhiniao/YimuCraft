/* Project references stay local; gallery cards use existing cached thumbnails. */
(()=>{
 'use strict';
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 function summary(b){const rows=Object.values(b.items).filter(i=>i.admitted&&!i.hiddenAt&&!['group','note','text'].includes(i.kind)&&!(i.sequenceId&&b.settings.autoSequences&&b.items[i.sequenceId]?.collapsed)&&(i.kind!=='sequence'||(b.settings.autoSequences&&i.collapsed&&!i.missing)));return {id:b.id,name:b.name,root:b.root,offline:!!b.offline,count:rows.length,preview:rows.filter(i=>['image','video','sequence'].includes(i.kind)&&!i.missing).slice(0,4).map(i=>({id:i.id,modified:i.modified||0}))};}
 window.YimuCanvasRepositories={mount(c){
  let rows=[],active=null,last='';
  function draw(){const key=JSON.stringify([rows,active]);if(key===last)return;last=key;c.host.replaceChildren();
   if(!rows.length)c.host.append(el('p','canvas-side-empty','尚未打开项目仓库'));
   for(const r of rows){const row=el('div','canvas-repository');row.classList.toggle('current',r.id===active);const open=el('button','canvas-repository-open');open.type='button';open.dataset.repositoryOpen=r.id;open.setAttribute('aria-label','打开仓库 '+r.name);open.setAttribute('aria-pressed',String(r.id===active));open.title=r.root;open.onclick=()=>c.open(r.id);
    const cover=el('span','canvas-repository-cover');cover.setAttribute('aria-hidden','true');
    if(r.preview?.length)for(const i of r.preview){const image=el('img');image.alt='';image.loading='lazy';image.draggable=false;image.src=`yimu://canvas/${r.id}/${i.id}/thumb?v=${i.modified}`;image.onerror=()=>image.style.visibility='hidden';cover.append(image);}else{const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),p=document.createElementNS(svg.namespaceURI,'path');svg.setAttribute('viewBox','0 0 24 24');p.setAttribute('d','M3 6h7l2 3h9v11H3z');svg.append(p);cover.append(svg);}
    const text=el('span','canvas-repository-text'),parent=r.root.replace(/[\\/]+$/,'').split(/[\\/]/).slice(-2,-1)[0]||'';text.append(el('strong','',r.name),el('small','',`${r.count||0} 项${r.offline?' · 离线':parent?' · '+parent:''}`));open.append(cover,text);
    const remove=el('button','canvas-repository-remove','×');remove.type='button';remove.dataset.repositoryRemove=r.id;remove.title='从列表移除';remove.setAttribute('aria-label','移除仓库 '+r.name);remove.onclick=()=>c.remove(r);row.append(open,remove);c.host.append(row);
   }
  }
  return {set(list,b){rows=list.boards;active=b?.id||list.active;if(b)rows=rows.map(r=>r.id===b.id?summary(b):r);draw();},update(b){active=b?.id||null;if(b)rows=rows.map(r=>r.id===b.id?summary(b):r);draw();}};
 }};
})();
