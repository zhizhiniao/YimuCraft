(function(root){
  const icons={
    folder:['文件夹','<path fill="currentColor" opacity=".5" d="M2 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v2H2z"/><path fill="currentColor" d="M2 9h20v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"/>'],
    film:['影片','<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4M7 12h10"/>'],
    music:['音乐','<path d="M9 17V5l11-2v12M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="3"/><ellipse cx="17" cy="16" rx="3" ry="3"/>'],
    image:['图片','<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 18 6-6 4 4 3-3 5 5"/>'],
    type:['文字','<path d="M4 7V4h16v3M12 4v17M8 21h8"/>'],
    star:['星标','<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>'],
    heart:['喜欢','<path d="M12 21 3 12C-3 4 7-1 12 6 17-1 27 4 21 12z"/>'],
    layers:['图层','<path d="m12 2 10 6-10 6L2 8zM2 13l10 6 10-6M2 18l10 6 10-6"/>'],
    box:['素材包','<path d="m12 2 10 5v12l-10 5-10-5V7zM2 7l10 5 10-5M12 12v12M7 4.5l10 5V15"/>'],
    code:['代码','<path d="m7 5-6 7 6 7M17 5l6 7-6 7M14 3l-4 18"/>'],
    camera:['相机','<path d="M3 6h4l2-3h6l2 3h4v15H3z"/><circle cx="12" cy="13" r="4"/>'],
    palette:['调色','<path d="M12 2a10 10 0 1 0 0 20h2a3 3 0 0 0 0-6 2 2 0 0 1 0-4h4a4 4 0 0 0 4-4c0-4-5-6-10-6z"/><path d="M7 7h.01M12 5h.01M17 7h.01M5 12h.01"/>'],
    zap:['特效','<path d="m14 2-11 12h8l-1 8 11-12h-8z"/>'],
    briefcase:['项目','<rect x="2" y="7" width="20" height="15" rx="2"/><path d="M8 7V3h8v4M2 13l10 3 10-3M12 13v5"/>'],
    bookmark:['收藏','<path d="M5 3h14v19l-7-5-7 5z"/>'],
    grid:['版式','<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'],
    tag:['标签','<path d="M3 3h9l10 10-9 9L3 12z"/><circle cx="8" cy="8" r="1"/>'],
    play:['播放','<path d="m7 3 14 9-14 9z"/>']
  };
  const legacy={'▱':'folder','★':'star','♥':'heart','●':'grid','◆':'tag','♫':'music','▶':'play'};
  const colors=[['','默认'],['#D59663','杏橙'],['#D76C72','珊瑚'],['#C779AE','玫粉'],['#A28CD6','薰衣草'],['#759CDE','湖蓝'],['#5CAAB4','青绿'],['#82AB72','草绿'],['#C5AD5F','麦黄'],['#A09D98','石灰']];
  function normalize(value={}){
    const icon=legacy[value.icon]||value.icon||'folder',color=value.color||'';
    const one=typeof icon==='string'&&icon.length<=32&&[...new Intl.Segmenter('zh',{granularity:'grapheme'}).segment(icon)].length===1;
    if(!Object.hasOwn(icons,icon)&&!(one&&/\p{Extended_Pictographic}/u.test(icon)&&!/[<>\x00-\x1f]/.test(icon)))throw Error('请选择图标或输入一个 Emoji');
    if(typeof color!=='string'||(color&&!/^#[0-9a-f]{6}$/i.test(color)))throw Error('颜色无效');
    return {icon,color:color.toUpperCase()};
  }
  function element(value={}){
    let a;try{a=normalize(value);}catch{a={icon:'folder',color:''};}
    const span=document.createElement('span');span.className='tree-icon';span.style.setProperty('--tree-color',a.color||'var(--icon)');span.dataset.icon=a.icon;span.dataset.color=a.color;
    if(Object.hasOwn(icons,a.icon))span.innerHTML='<svg viewBox="0 0 24 26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[a.icon][1]+'</svg>';
    else{span.textContent=a.icon;span.classList.add('emoji');}return span;
  }
  const api={icons,colors,normalize,element};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.YimuAppearance=api;
})(typeof window==='undefined'?globalThis:window);
