/* Secondary canvas tools. Nothing renders on the camera's pointer-move path. */
(()=>{
 'use strict';
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 window.YimuCanvasSidebar={mount(c){
  const nav=el('nav','canvas-quick-nav');nav.hidden=true;nav.setAttribute('aria-label','画布快捷功能');c.tabs.after(nav);
  const panel=el('aside','canvas-sources canvas-side-tools');panel.id='canvasSideTools';c.source.after(panel);
  let current='source',preview=null,undo=null,busy=false,boardId=null;try{current=localStorage.getItem('yimu-canvas-panel')||'source';}catch{}
  const names={source:'来源',groups:'分组',filter:'筛选',arrange:'整理'},sections={},buttons={};if(!names[current])current='source';
  const run=async fn=>{try{await fn();}catch(e){c.message(e.message,true);}};
  const button=(label,fn,cls)=>{const b=el('button',cls,label);b.type='button';b.onclick=()=>run(fn);return b;};
  const close=button('×',()=>c.show(false),'canvas-side-close');close.setAttribute('aria-label','收起侧栏');panel.append(close);
  const paths={source:'M3 6h7l2 3h9v11H3z',groups:'M4 4h6v6H4zM14 14h6v6h-6zM7 10v7h7',filter:'M3 5h18M6 12h12M9 19h6',arrange:'M3 3v18M7 5h14v4H7zM7 14h9v4H7z'};
  for(const key of Object.keys(names)){
   const b=button('',()=>open(key));b.dataset.panel=key;b.setAttribute('aria-label',names[key]);b.setAttribute('aria-controls',key==='source'?c.source.id:panel.id);
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),p=document.createElementNS(svg.namespaceURI,'path');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');p.setAttribute('d',paths[key]);svg.append(p);b.append(svg,el('span','',names[key]));nav.append(b);buttons[key]=b;
   if(key!=='source'){const s=el('section');s.dataset.panel=key;s.append(el('header','',names[key]==='分组'?'分组导航':names[key]==='整理'?'整理所选':names[key]));panel.append(s);sections[key]=s;}
  }
  const groupTop=el('div','canvas-side-actions');groupTop.append(button('未归组',()=>c.filter({kind:'',tag:'',ungrouped:true,status:'',search:'',shot:''})),button('新建分组',c.group));sections.groups.append(groupTop);
  const groupList=el('div','canvas-group-list');sections.groups.append(groupList);
  const search=el('input');search.id='canvasSearch';search.setAttribute('aria-label','搜索画布素材');search.placeholder='搜索名称、标签或说明';sections.filter.append(search);
  const typeButtons=el('div','canvas-filter-types'),kindButtons={};let kind='';
  for(const [value,label]of [['','全部'],['image','图片'],['sequence','序列'],['video','视频'],['audio','音频'],['other','其他']]){const b=button(label,async()=>{kind=value;await c.filter(filters());});b.dataset.kind=value;typeButtons.append(b);kindButtons[value]=b;}sections.filter.append(typeButtons);
  function field(label,n){const l=el('label','canvas-side-field');l.append(el('span','',label),n);sections.filter.append(l);return n;}
  const status=field('确认状态',el('select'));status.id='canvasQuickStatus';status.append(...[['','全部'],['pending','未确认'],['confirmed','已确认'],['missing','原文件缺失']].map(([v,n])=>new Option(n,v)));status.onchange=()=>run(()=>c.filter({...filters(),status:status.value}));
  const tag=field('标签',el('select'));tag.id='canvasQuickTag';tag.onchange=()=>run(()=>c.filter(filters()));
  const ungrouped=el('input');ungrouped.type='checkbox';ungrouped.id='canvasUngrouped';const ungroupedLabel=el('label','canvas-check');ungroupedLabel.append(ungrouped,el('span','','仅未归组'));sections.filter.append(ungroupedLabel);ungrouped.onchange=()=>run(()=>c.filter(filters()));
  sections.filter.append(button('清除筛选',()=>c.filter({kind:'',tag:'',ungrouped:false,status:'',search:'',shot:''}),'canvas-clear-filters'));
  const count=el('p','canvas-arrange-count');sections.arrange.append(count);
  const operations=el('div','canvas-arrange-actions');const actionButtons=[];
  for(const [mode,label]of [['left','左对齐'],['top','顶对齐'],['horizontal','水平等距'],['vertical','垂直等距'],['height','统一高度'],['grid','网格排列']]){const b=button(label,()=>startPreview(mode));b.dataset.arrange=mode;operations.append(b);actionButtons.push(b);}sections.arrange.append(operations);
  const actions=el('div','canvas-side-actions');const groupButton=button('元素编组',c.group),focusButton=button('定位所选',c.focusSelection);actions.append(groupButton,focusButton);sections.arrange.append(actions);
  const previewBar=el('div','canvas-arrange-preview');previewBar.hidden=true;previewBar.append(el('span','','预览中'),button('取消',cancelPreview),button('应用排列',apply,'primary'));sections.arrange.append(previewBar);
  const undoButton=button('撤销上次整理',revert);undoButton.id='canvasArrangeUndo';sections.arrange.append(undoButton);
  const note=el('p','canvas-side-empty');note.textContent='先在画布中选择要整理的元素';sections.arrange.append(note);
  function filters(){return {kind,tag:tag.value,ungrouped:ungrouped.checked};}
  function setFilters(f){kind=f.kind||'';if(!kindButtons[kind])kind='';ungrouped.checked=!!f.ungrouped;if(f.tag&&!Array.from(tag.options).some(o=>o.value===f.tag))tag.append(new Option(f.tag,f.tag));tag.value=f.tag||'';if(f.status!==undefined)status.value=f.status;}
  async function open(key){cancelPreview();current=key;try{localStorage.setItem('yimu-canvas-panel',key);}catch{}if(c.board()&&!c.board().settings.sidebar)await c.show(true);refresh();}
  function selection(){const ids=c.selected(),n=ids.length;count.textContent=`已选 ${n} 项`;note.hidden=n>=2;for(const b of actionButtons)b.disabled=n<2||busy||!!preview;groupButton.disabled=!n||busy||!!preview;focusButton.disabled=!n||!!preview;undoButton.disabled=!undo||busy||!!preview;for(const b of groupList.querySelectorAll('[data-group]'))b.classList.toggle('selected',ids.includes(b.dataset.group));}
  function refresh(){
   const board=c.board(),visible=!board||board.settings.sidebar;if(!board)current='source';nav.hidden=!c.active();panel.hidden=!visible||current==='source';c.source.hidden=!visible||current!=='source';
   for(const key of Object.keys(names)){buttons[key].setAttribute('aria-pressed',String(visible&&key===current));buttons[key].setAttribute('aria-expanded',String(visible&&key===current));buttons[key].disabled=key!=='source'&&!board;if(sections[key])sections[key].hidden=current!==key;}
   if(!board)return;if(boardId!==board.id){boardId=board.id;undo=null;cancelPreview();}
   if(current==='groups'){
    const rows=Object.values(board.items).filter(i=>i.admitted&&!i.hiddenAt),groups=rows.filter(i=>i.kind==='group'),counts=new Map();
    for(const row of rows.filter(i=>i.kind!=='group'&&!i.sequenceId)){let p=row.parentId,n=0;while(p&&n++<40){counts.set(p,(counts.get(p)||0)+1);p=board.items[p]?.parentId;}}
    const children=new Map(),groupIds=new Set(groups.map(g=>g.id));for(const g of groups){const parent=groupIds.has(g.parentId)?g.parentId:null;if(!children.has(parent))children.set(parent,[]);children.get(parent).push(g);}
    groupList.replaceChildren();function append(parent,depth){for(const g of (children.get(parent)||[]).sort((a,b)=>a.y-b.y||a.x-b.x)){const row=el('div','canvas-group-row');row.style.paddingLeft=Math.min(depth,8)*12+'px';const b=button('',()=>c.focusGroup(g.id));b.dataset.group=g.id;b.title=g.name;const color=el('i');color.style.background=g.color||'#b78c66';b.append(color,el('span','',g.name),el('small','',String(counts.get(g.id)||0)));row.append(b);groupList.append(row);append(g.id,depth+1);}}append(null,0);
    if(!groups.length)groupList.append(el('p','canvas-side-empty','暂无分组'));
   }
   const value=tag.value,tags=[...new Set(Object.values(board.items).filter(i=>i.admitted&&!i.hiddenAt).flatMap(i=>i.tags||[]))].sort((a,b)=>a.localeCompare(b,'zh-CN'));if(value&&!tags.includes(value))tags.push(value);tag.replaceChildren(new Option('全部标签',''),...tags.map(t=>new Option(t,t)));tag.value=value;status.value=c.status();for(const [k,b]of Object.entries(kindButtons))b.setAttribute('aria-pressed',String(k===kind));
   selection();
  }
  function capture(changes,items){return changes.map(change=>Object.fromEntries(['id','x','y','width','height','sizeMode','parentId','hiddenAt'].map(k=>[k,items[change.id][k]])));}
  function unchanged(rows){const items=c.board()?.items;return rows.every(r=>items?.[r.id]&&Object.keys(r).every(k=>items[r.id][k]===r[k]));}
  function startPreview(mode){if(busy)return;cancelPreview();const b=c.board(),changes=window.YimuCanvasArrange.plan(b.items,c.selected(),mode);preview={board:b.id,changes,before:capture(changes,b.items)};c.preview(changes);previewBar.hidden=false;selection();}
  function cancelPreview(){if(!preview)return;preview=null;c.preview(null);previewBar.hidden=true;selection();}
  async function apply(){if(!preview||busy)return;const p=preview;if(p.board!==c.board().id||!unchanged(p.before)){cancelPreview();throw Error('元素已变化，请重新预览');}preview=null;previewBar.hidden=true;busy=true;selection();try{await c.patch(p.changes,p.before);undo={board:p.board,before:p.before,after:capture(p.changes,c.board().items)};}finally{busy=false;c.preview(null);selection();}}
  async function revert(){if(!undo||busy)return;if(undo.board!==c.board().id||!unchanged(undo.after)){undo=null;selection();throw Error('元素已再次修改，不能撤销旧的整理');}const u=undo;busy=true;selection();try{await c.patch(u.before.map(({id,x,y,width,height,sizeMode})=>({id,x,y,width,height,sizeMode})),u.after);undo=null;}catch(e){undo=null;throw e;}finally{busy=false;selection();}}
  return {refresh,selection,filters,setFilters,cancelPreview,open,get previewActive(){return !!preview||busy;}};
 }};
})();
