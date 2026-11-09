/* Project-local discovery. Every result is a real repository item. */
(()=>{
 'use strict';
 const Q=window.YimuDiscoveryQuery;
 const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const icons={search:'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',image:'M3 3h18v18H3zM3 17l6-6 4 4 3-3 5 5M7 7h1',filter:'M3 6h18M3 12h18M3 18h18M8 3v6M16 9v6M10 15v6',history:'M3 11a9 9 0 1 1 2 7M3 4v7h7M12 7v6l4 2',plus:'M12 4v16M4 12h16',send:'M12 20V4M5 11l7-7 7 7',undo:'M9 4L3 10l6 6M3 10h12a6 6 0 0 1 6 6v4',compare:'M3 4h7v16H3zM14 4h7v16h-7z',grid:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'};
 function icon(name){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('viewBox','0 0 24 24');s.setAttribute('aria-hidden','true');const p=document.createElementNS(s.namespaceURI,'path');p.setAttribute('d',icons[name]);s.append(p);return s;}
 window.YimuCanvasDiscovery={mount(c){
  const api=window.yimuCanvas,root=el('section','discovery');root.id='canvasDiscovery';root.hidden=true;root.setAttribute('aria-label','找素材');document.body.append(root);
  const chat=el('aside','discovery-chat'),results=el('div','discovery-results');root.append(chat,results);
  let boardId=null,state=null,visible=false,limit=60,ranked=null,selected=new Set(),loading=false,generation=0,dialogCount=0;
  const fresh=()=>({query:Q.empty(),messages:[],history:[]});
  const key=()=>`yimu.discovery.v1.${boardId}`;
  const status=el('p','discovery-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');status.hidden=true;
  function notify(text,error=false){status.textContent=text;status.hidden=!text;status.classList.toggle('error',error);}
  const run=async fn=>{try{return await fn();}catch(e){notify(e.message,true);}};
  function button(label,fn,cls='',name){const b=el('button',cls);b.type='button';if(name)b.append(icon(name));if(label)b.append(el('span','',label));b.onclick=()=>run(fn);return b;}
  function iconButton(label,name,fn){const b=button('',fn,'discovery-icon-button',name);b.title=label;b.setAttribute('aria-label',label);return b;}
  const head=el('header','discovery-heading');head.append(el('h2','','找素材'));
  head.append(iconButton('查找历史','history',history),iconButton('新查找','plus',()=>commit(Q.empty(),'新查找',null)));
  const scope=el('select','discovery-scope');scope.id='discoveryScope';scope.setAttribute('aria-label','查找范围');scope.title='本地项目仓库';
  scope.onchange=()=>run(async()=>{if(loading)return;scope.disabled=true;try{await c.activate(scope.value);await refresh();}finally{scope.disabled=false;}});
  const messages=el('div','discovery-messages');messages.setAttribute('role','log');messages.setAttribute('aria-label','查找对话');
  const suggestions=el('div','discovery-suggestions');for(const label of ['只看已确认','横屏','图片'])suggestions.append(button(label,()=>submit(label)));
  const composer=el('form','discovery-composer'),input=el('textarea');input.id='discoveryInput';input.rows=3;input.maxLength=500;input.placeholder='找什么素材？';input.setAttribute('aria-label','查找素材');input.title='搜索名称、标签或说明；可继续输入“横屏”“只看已确认”等条件';
  const tools=el('div','discovery-compose-tools'),imageButton=button('以图找',()=>similar(),'','image'),filterButton=button('筛选',filters,'','filter'),commandsButton=button('/ 命令',commands),send=iconButton('查找','send',()=>submit(input.value));
  imageButton.title='按本地图片的颜色与构图相似度排序';send.classList.add('primary');tools.append(imageButton,filterButton,commandsButton,send);composer.append(input,tools);
  composer.onsubmit=e=>{e.preventDefault();run(()=>submit(input.value));};
  input.onkeydown=e=>{if(e.isComposing)return;if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();run(()=>submit(input.value));}else if(e.key==='/'&&!input.value){e.preventDefault();commands();}};
  chat.append(head,scope,messages,suggestions,status,composer);
  const resultHead=el('header','discovery-result-heading'),crumb=el('span','discovery-crumb'),back=button('退回上轮',undo,'','undo');resultHead.append(crumb,back);
  const chips=el('div','discovery-chips');chips.setAttribute('aria-label','查找条件');
  const bar=el('div','discovery-result-tools'),count=el('strong'),allLabel=el('label','discovery-select-all'),all=el('input');all.type='checkbox';all.setAttribute('aria-label','全选当前结果');allLabel.append(all,el('span','','全选'));
  all.onchange=()=>{const rows=filtered().filter(selectable);if(all.checked&&new Set([...selected,...rows.map(i=>i.id)]).size>200){all.checked=false;notify('请先缩小到 200 项以内',true);return;}for(const row of rows)all.checked?selected.add(row.id):selected.delete(row.id);save();paint();};
  const sort=el('select');sort.setAttribute('aria-label','结果排序');sort.append(new Option('相关度','relevance'),new Option('名称','name'),new Option('最近修改','recent'));sort.onchange=paint;
  const density=iconButton('切换网格密度','grid',()=>{grid.classList.toggle('dense');density.setAttribute('aria-pressed',String(grid.classList.contains('dense')));});density.setAttribute('aria-pressed','false');
  bar.append(count,allLabel,el('span','discovery-spacer'),sort,density);
  const scroll=el('div','discovery-scroll'),grid=el('div','discovery-grid'),empty=el('div','discovery-empty'),more=button('显示更多',()=>{limit+=60;paint();},'discovery-more');scroll.append(grid,empty,more);
  const tray=el('footer','discovery-tray'),thumbs=el('div','discovery-selection-thumbs'),picked=el('span'),clear=button('取消选择',()=>{selected.clear();save();paint();}),compareButton=button('对比',compare,'','compare'),add=button('加入候选组 →',addGroup,'primary');tray.append(thumbs,picked,clear,el('span','discovery-spacer'),compareButton,add);
  results.append(resultHead,chips,bar,scroll,tray);
  const selectable=i=>!i.missing&&i.kind!=='sequence';
  const source=(row,type='thumb')=>`yimu://canvas/${boardId}/${row.id}/${type}?v=${row.modified||0}`;
  function image(row){const img=el('img');img.alt='';img.loading='lazy';img.decoding='async';img.src=source(row);img.onerror=()=>{img.hidden=true;};return img;}
  function save(){if(!boardId||!state)return;try{localStorage.setItem(key(),JSON.stringify({...state,ranked,selected:[...selected]}));}catch{notify('查找记录未保存；当前选择仍保留',true);}}
  function load(){state=fresh();selected.clear();ranked=null;limit=60;try{const saved=JSON.parse(localStorage.getItem(key()));if(saved){state.query=Q.normalize(saved.query);state.messages=(saved.messages||[]).filter(m=>typeof m.text==='string'&&['user','assistant'].includes(m.role)).slice(-40);state.history=(saved.history||[]).slice(-30).map(h=>({query:Q.normalize(h.query),label:String(h.label).slice(0,500),at:h.at,ranked:Array.isArray(h.ranked)?h.ranked.filter(id=>typeof id==='string').slice(0,500):null}));ranked=Array.isArray(saved.ranked)?saved.ranked.filter(id=>typeof id==='string').slice(0,500):null;selected=new Set((saved.selected||[]).filter(id=>typeof id==='string').slice(0,200));}}catch{notify('上次查找记录无法读取，已新建查找',true);}}
  async function refresh(){
   const board=c.board();if(board?.id!==boardId){if(loading)await api.command('discoveryCancel');generation++;boardId=board?.id||null;load();input.value='';notify('');}
   if(!visible)return;const list=await api.command('list');scope.replaceChildren(...list.boards.map(b=>new Option(b.name,b.id)));if(boardId)scope.value=boardId;scope.disabled=loading||!boardId;
   if(!boardId)scope.append(new Option('选择项目仓库',''));paint();
  }
  function filtered(){if(!boardId)return [];let rows=Q.rows(c.board(),state.query);if(ranked){const order=new Map(ranked.map((id,index)=>[id,index]));rows=rows.filter(i=>order.has(i.id)).sort((a,b)=>order.get(a.id)-order.get(b.id));}if(sort.value==='name')rows.sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));else if(sort.value==='recent')rows.sort((a,b)=>b.modified-a.modified);else if(!ranked)rows.sort((a,b)=>b.added-a.added||a.name.localeCompare(b.name,'zh-CN'));return rows;}
  function paintMessages(){messages.replaceChildren();for(const m of state.messages)messages.append(el('div','discovery-message '+m.role,m.text));messages.scrollTop=messages.scrollHeight;}
  function paintChips(){
   chips.replaceChildren();const labels={kind:{image:'图片',video:'视频',audio:'音频',project:'工程',document:'文档',sequence:'序列'},status:{confirmed:'已确认',pending:'未确认'},orientation:{landscape:'横屏',portrait:'竖屏',square:'方图'}};
   for(const k of ['kind','status','orientation'])if(state.query[k])chips.append(button(labels[k][state.query[k]]+' ×',()=>{const next=Q.normalize(state.query);next[k]='';commit(next,'移除 '+labels[k][state.query[k]]);},'discovery-chip'));
   for(const k of ['terms','exclude'])for(const value of state.query[k])chips.append(button((k==='exclude'?'排除 ':'')+value+' ×',()=>{const next=Q.normalize(state.query);next[k]=next[k].filter(t=>t!==value);commit(next,'移除 '+value);},'discovery-chip'));
   if(ranked)chips.append(button('以图找 ×',()=>commit(state.query,'取消以图找',null),'discovery-chip'));
   chips.hidden=!chips.childElementCount;
  }
  function paint(){
   if(!state)state=fresh();const board=c.board(),rows=filtered(),current=new Set(rows.map(r=>r.id));
   for(const id of selected)if(!board?.items[id]||board.items[id].hiddenAt||board.items[id].missing)selected.delete(id);
   crumb.textContent=board?'项目画布 / '+board.name:'项目画布';count.textContent=rows.length+' 项';back.disabled=!state.history.length||loading;
   const possible=rows.filter(selectable);all.checked=!!possible.length&&possible.every(i=>selected.has(i.id));all.indeterminate=!all.checked&&possible.some(i=>selected.has(i.id));all.disabled=!possible.length||loading;
   for(const n of [input,send,imageButton,filterButton,commandsButton])n.disabled=loading||!board;root.setAttribute('aria-busy',String(loading));
   grid.replaceChildren();for(const row of rows.slice(0,limit)){
    const card=el('article','discovery-card');card.dataset.id=row.id;card.classList.toggle('selected',selected.has(row.id));
    const picture=button('',()=>preview(row.id),'discovery-picture');picture.setAttribute('aria-label','预览 '+row.name);picture.append(el('span','discovery-fallback',row.ext?.toUpperCase()||row.kind),image(row));
    const badge=el('span','discovery-badge',row.missing?'原件缺失':row.status==='confirmed'?'已确认':'待筛选');picture.append(badge);
    const check=el('input','discovery-check');check.type='checkbox';check.checked=selected.has(row.id);check.disabled=!selectable(row);check.setAttribute('aria-label','选择 '+row.name);if(row.kind==='sequence')check.title='序列请在画布中展开后选择帧';check.onchange=()=>toggle(row.id);
    const caption=el('div','discovery-caption');caption.append(el('span','',row.name),el('small','',row.ext?.toUpperCase()||''));caption.title=row.relative||row.name;card.append(picture,check,caption);grid.append(card);
   }
   empty.hidden=!!rows.length;empty.replaceChildren(el('strong','',board?'没有匹配素材':'选择项目仓库'));empty.append(button(board?'清除条件':'打开项目仓库',()=>board?commit(Q.empty(),'清除条件',null):c.choose()));
   more.hidden=rows.length<=limit;tray.hidden=!selected.size;thumbs.replaceChildren(...[...selected].slice(0,3).map(id=>image(board.items[id])));
   const hidden=[...selected].filter(id=>!current.has(id)).length;picked.textContent=`已选 ${selected.size} 项`+(hidden?` · ${hidden} 项来自上轮`:'');compareButton.disabled=selected.size<2||selected.size>4;compareButton.title='选择 2–4 项对比';add.disabled=loading;
   paintChips();paintMessages();
  }
  function toggle(id){if(selected.has(id))selected.delete(id);else if(selected.size>=200){notify('一次最多选择 200 项',true);return;}else selected.add(id);save();paint();}
  function commit(next,label,nextRank=ranked){if(!boardId||loading)return;state.history.push({query:Q.normalize(state.query),label:state.messages.filter(m=>m.role==='user').at(-1)?.text||'全部素材',at:Date.now(),ranked});state.history=state.history.slice(-30);state.query=Q.normalize(next);ranked=nextRank;limit=60;state.messages.push({role:'user',text:label},{role:'assistant',text:`找到 ${filtered().length} 项`});state.messages=state.messages.slice(-40);notify('');save();paint();}
  function submit(text){if(loading||!boardId)return;const next=Q.parse(text,state.query);commit(next,text,/清除条件|重新找|重新搜索|全部素材|清空条件/.test(text)?null:ranked);input.value='';input.focus();}
  function undo(){if(loading||!state.history.length)return;const prev=state.history.pop();state.query=Q.normalize(prev.query);ranked=prev.ranked||null;limit=60;state.messages.push({role:'assistant',text:'已退回上一轮'});state.messages=state.messages.slice(-40);save();paint();}
  function dialog(title,cls=''){
   const d=el('dialog','discovery-dialog '+cls),h=el('header');d.setAttribute('aria-labelledby','discovery-dialog-title-'+(++dialogCount));const t=el('h2','',title);t.id=d.getAttribute('aria-labelledby');h.append(t,button('×',()=>d.close(),'discovery-close'));h.lastChild.setAttribute('aria-label','关闭');d.append(h);document.body.append(d);const focus=document.activeElement;
   d.addEventListener('close',()=>{for(const media of d.querySelectorAll('video,audio')){media.pause();media.removeAttribute('src');media.load();}d.remove();if(focus?.isConnected)focus.focus();});return d;
  }
  function field(host,label,input){input.setAttribute('aria-label',label);const l=el('label','discovery-field');l.append(el('span','',label),input);host.append(l);return input;}
  function selectField(host,label,values,value){const s=el('select');s.append(...values.map(([v,l])=>new Option(l,v)));s.value=value;field(host,label,s);return s;}
  function filters(){if(!boardId)return;const d=dialog('筛选'),form=el('form'),q=state.query;
   const kind=selectField(form,'类型',[['','全部'],['image','图片'],['video','视频'],['audio','音频'],['project','工程'],['document','文档']],q.kind),orientation=selectField(form,'画幅',[['','全部'],['landscape','横屏'],['portrait','竖屏'],['square','方图']],q.orientation),confirmation=selectField(form,'状态',[['','全部'],['confirmed','已确认'],['pending','未确认']],q.status);
   const exclude=field(form,'排除关键词',el('input'));exclude.value=q.exclude.join(' ');exclude.placeholder='用空格分隔';exclude.maxLength=240;
   const actions=el('footer');actions.append(button('清除',()=>{commit(Q.empty(),'清除条件',null);d.close();}),button('应用',()=>{const next=Q.normalize({...q,kind:kind.value,orientation:orientation.value,status:confirmation.value,exclude:exclude.value.split(/\s+/)});commit(next,'筛选');d.close();},'primary'));form.onsubmit=e=>{e.preventDefault();actions.lastChild.click();};form.append(actions);d.append(form);d.showModal();
  }
  function history(){const d=dialog('查找历史'),list=el('div','discovery-history');if(!state?.history.length)list.append(el('p','','暂无记录'));else for(const [index,h]of [...state.history.entries()].reverse()){const b=button(h.label,()=>{commit(h.query,'恢复：'+h.label,h.ranked||null);d.close();});b.append(el('small','',new Date(h.at).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})));list.append(b);}d.append(list);d.showModal();}
  function commands(){const d=dialog('命令','discovery-command-dialog'),list=el('div','discovery-commands');for(const [label,fn]of [['以图找',()=>similar()],['筛选',filters],['查找历史',history],['退回上轮',undo],['清除条件',()=>commit(Q.empty(),'清除条件',null)],['对比所选',compare],['加入候选组',addGroup]]){const b=button(label,()=>{d.close();return fn();});if(label==='对比所选')b.disabled=selected.size<2||selected.size>4;if(label==='加入候选组')b.disabled=!selected.size;if(label==='退回上轮')b.disabled=!state.history.length;list.append(b);}d.append(list);d.showModal();}
  async function similar(id){
   if(loading||!boardId)return;const originalId=boardId,token=++generation;loading=true;paint();notify('正在查找相似图片…');const cancel=button('取消',()=>api.command('discoveryCancel'));status.append(cancel);
   try{const result=await api.command('discoverySimilar',originalId,state.query,id);if(token!==generation||originalId!==boardId)return;loading=false;if(result){commit(state.query,'以图找',result.ids);if(result.skipped)notify(`${result.skipped} 张图片无法读取`);}else notify('');}
   finally{if(token===generation){loading=false;paint();}}
  }
  function media(row,host){
   if(row.missing){host.append(el('p','','原文件缺失'));return;}
   let n;if(['image','sequence'].includes(row.kind)){n=el('img');n.alt=row.name;}else if(['video','audio'].includes(row.kind)){n=el(row.kind);n.controls=true;n.preload='metadata';}else{host.append(image(row),button('打开原文件',()=>api.command('open',boardId,row.id)));return;}
   let fallback=false;n.onerror=()=>{if(!n.isConnected)return;if(!fallback){fallback=true;n.src=source(row,'preview');}else{n.hidden=true;host.append(el('p','','无法预览'),button('打开原文件',()=>api.command('open',boardId,row.id)));}};n.src=source(row,'file');host.append(n);
  }
  function preview(id){
   const row=c.board()?.items[id];if(!row)return;if(row.kind==='sequence')return c.preview(id);
   const d=dialog(row.name,'discovery-preview'),stage=el('div','discovery-preview-stage');media(row,stage);const footer=el('footer'),check=button(selected.has(id)?'取消选择':'选入候选',()=>{toggle(id);check.querySelector('span').textContent=selected.has(id)?'取消选择':'选入候选';});check.disabled=row.missing;
   const nearby=filtered(),index=nearby.findIndex(i=>i.id===id),prev=button('←',()=>{d.close();preview(nearby[index-1].id);}),next=button('→',()=>{d.close();preview(nearby[index+1].id);});prev.setAttribute('aria-label','上一项');next.setAttribute('aria-label','下一项');prev.disabled=index<=0;next.disabled=index<0||index>=nearby.length-1;
   footer.append(prev,next,el('span','discovery-spacer'),check);if(row.kind==='image'&&!row.missing)footer.append(button('以这张图找',()=>{d.close();return similar(id);}));footer.append(button('加入候选组',()=>{if(!selected.has(id))toggle(id);d.close();addGroup();},'primary'));footer.lastChild.disabled=row.missing;
   d.append(stage,footer);d.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select,video,audio'))return;if(e.key==='ArrowLeft'&&!prev.disabled)prev.click();if(e.key==='ArrowRight'&&!next.disabled)next.click();});d.showModal();
  }
  function compare(){if(selected.size<2||selected.size>4){notify('选择 2–4 项对比');return;}const d=dialog('对比所选','discovery-comparison'),list=el('div','discovery-compare-grid');for(const id of selected){const row=c.board().items[id],item=el('section'),stage=el('div','discovery-compare-media');media(row,stage);item.append(stage,el('p','',row.name));list.append(item);}const footer=el('footer');footer.append(button('加入候选组',()=>{d.close();addGroup();},'primary'));d.append(list,footer);d.showModal();}
  function addGroup(){if(!selected.size)return;const d=dialog('加入候选组'),form=el('form'),name=field(form,'组名',el('input'));name.value='候选素材';name.maxLength=80;name.required=true;const previews=el('div','discovery-group-thumbs');previews.append(...[...selected].slice(0,8).map(id=>image(c.board().items[id])));const feedback=el('p','error');feedback.setAttribute('role','alert');const footer=el('footer'),submit=button('加入 '+selected.size+' 项',async()=>{if(!name.reportValidity())return;submit.disabled=true;try{await c.add([...selected],name.value);selected.clear();save();d.close();}catch(e){feedback.textContent=e.message;}finally{submit.disabled=false;}},'primary');footer.append(button('取消',()=>d.close()),submit);form.onsubmit=e=>{e.preventDefault();submit.click();};form.append(previews,feedback,footer);d.append(form);d.showModal();name.select();}
  return {async show(value){visible=value;root.hidden=!value;if(value){await refresh();input.focus();}else if(loading){generation++;await api.command('discoveryCancel');loading=false;notify('');}},refresh:()=>{if(visible)run(refresh);},focus:()=>input.focus(),isActive:()=>visible};
 }};
})();
