/* Shared local search rules. These filter metadata; they do not infer image meaning. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.YimuDiscoveryQuery=api;})(globalThis,()=>{
 'use strict';
 const empty=()=>({terms:[],exclude:[],kind:'',status:'',orientation:''});
 const kinds={图片:'image',照片:'image',视频:'video',音频:'audio',音乐:'audio',工程:'project',文档:'document'};
 const stop=new Set('找 找到 找些 找点 找一下 搜索 查找 搜 看 看看 只 只看 仅 要 想要 我 帮我 一些 些 点 的 素材 画面 请 再 继续 保留 优先 更 一点 还有 和 与 并且 同时'.split(' '));
 const segmenter=new Intl.Segmenter('zh-CN',{granularity:'word'});
 function words(text){return [...segmenter.segment(text.toLowerCase())].filter(s=>s.isWordLike&&!stop.has(s.segment)).map(s=>s.segment);}
 function normalize(input={}){const out=empty();for(const key of ['terms','exclude']){if(!Array.isArray(input[key]||[]))throw Error('搜索词无效');out[key]=[...new Set((input[key]||[]).map(s=>{if(typeof s!=='string'||s.length>80)throw Error('搜索词最多 80 字');return s.trim().toLowerCase();}).filter(Boolean))];if(out[key].length>30)throw Error('搜索条件过多');}for(const [key,allowed]of Object.entries({kind:['','image','video','audio','project','document','sequence'],status:['','confirmed','pending'],orientation:['','landscape','portrait','square']})){out[key]=input[key]||'';if(!allowed.includes(out[key]))throw Error('搜索条件无效');}return out;}
 function parse(text,previous=empty()){
  if(typeof text!=='string'||!text.trim()||text.length>500)throw Error('请输入 1–500 字');
  let out=normalize(previous),q=text.trim();
  if(/清除条件|重新找|重新搜索|全部素材|清空条件/.test(q)){out=empty();q=q.replace(/清除条件|重新找|重新搜索|全部素材|清空条件/g,' ');}
  q=q.replace(/(?:不要|排除|不含|去掉)([^，,。;；]+)/g,(_,s)=>{out.exclude.push(...words(s));return ' ';});
  q=q.replace(/(已确认|未确认|待确认|待筛选)/g,m=>{out.status=m==='已确认'?'confirmed':'pending';return ' ';});
  q=q.replace(/横屏|横版|竖屏|竖版|正方形|方图/g,m=>{out.orientation=/横/.test(m)?'landscape':/竖/.test(m)?'portrait':'square';return ' ';});
  q=q.replace(/图片|照片|视频|音频|音乐|工程|文档/g,m=>{out.kind=kinds[m];return ' ';});
  out.terms.push(...words(q));return normalize(out);
 }
 function searchable(row){return [row.name,row.relative,row.text,...(row.tags||[]),...Object.keys(kinds).filter(k=>kinds[k]===row.kind),row.status==='confirmed'?'已确认':'未确认'].filter(Boolean).join(' ').toLowerCase();}
 function matches(row,query){
  if(!row||row.hiddenAt||row.referenceId||!['image','video','audio','project','document','sequence'].includes(row.kind))return false;
  if(query.kind&&row.kind!==query.kind)return false;if(query.status&&row.status!==query.status)return false;
  if(query.orientation){const w=row.pixelWidth,h=row.pixelHeight;if(!w||!h)return false;const ratio=w/h;if(query.orientation==='landscape'?ratio<=1.05:query.orientation==='portrait'?ratio>=.95:Math.abs(ratio-1)>.05)return false;}
  const value=searchable(row);return query.terms.every(t=>value.includes(t))&&!query.exclude.some(t=>value.includes(t));
 }
 function rows(board,query){return Object.values(board?.items||{}).filter(i=>matches(i,query)&&!(i.sequenceId&&board.settings.autoSequences&&board.items[i.sequenceId]?.collapsed)&&(i.kind!=='sequence'||board.settings.autoSequences&&i.collapsed&&!i.missing));}
 return {empty,normalize,parse,matches,rows};
});
