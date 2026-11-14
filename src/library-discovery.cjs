const Q = require('./discovery-query.js');
const { dimensions } = require('./canvas-media.cjs');
const caches = new WeakMap();

async function search(library, options = {}, cancelled = () => false) {
  if(options.location!==undefined&&options.location!==library.folder)throw Error('素材库已切换，请重新查找');
  const query = Q.normalize(options.query);
  if (query.status) throw Error('确认状态用于项目画布，请切换到项目范围');
  const where = ['hidden=0'], args = [];
  const text = "lower(name||' '||path||' '||tags||' '||note)";
  for (const term of query.terms) {where.push('instr('+text+',?)>0');args.push(term);}
  for (const term of query.exclude) {where.push('instr('+text+',?)=0');args.push(term);}
  if (query.kind) {where.push('kind=?');args.push(query.kind);}
  if (query.orientation) where.push("kind IN ('image','video')");
  const ids = options.ids;
  if (ids != null) {
    if (!Array.isArray(ids)||ids.length>200||ids.some(id=>!Number.isSafeInteger(Number(id))||Number(id)<=0)) throw Error('搜索结果无效');
    where.push('id IN (SELECT value FROM json_each(?))');args.push(JSON.stringify(ids.map(Number)));
  }
 const order = options.sort==='recent'?'modified DESC,id':ids&&options.sort==='relevance'?'(SELECT key FROM json_each(\''+JSON.stringify(ids.map(Number))+'\') WHERE value=assets.id),id':'name COLLATE NOCASE,id';
  const clause = where.join(' AND ');
  const total = library.db.prepare('SELECT count(*) n FROM assets WHERE '+clause).get(...args).n;
  const offset = Number(options.offset||0), limit = Number(options.limit||60);
  if(!Number.isSafeInteger(offset)||offset<0||!Number.isSafeInteger(limit)||limit<1||limit>60)throw Error('分页参数无效');
  const rows = library.db.prepare('SELECT * FROM assets WHERE '+clause+' ORDER BY '+order+' LIMIT ? OFFSET ?')
    .all(...args,query.orientation?500:limit,offset);
  let cache = caches.get(library);
  if (!cache) {cache = new Map();caches.set(library,cache);}
  const items = [];
  let scanned = 0;const deadline=Date.now()+1500;
  for (const row of rows) {
    if (cancelled()) throw Error('已取消查找');
    scanned++;
    const item = {...row,id:String(row.id),tags:JSON.parse(row.tags),relative:row.path,text:row.note,
      cover:row.cover_override||row.cover,status:'',library:true};
    if (query.orientation) {
      const key = row.path+'|'+row.modified+'|'+row.size;
      if (!cache.has(key)) {
        if (cache.size>=5000) cache.delete(cache.keys().next().value);
        cache.set(key,await dimensions(row.path,row.kind));
      }
      Object.assign(item,cache.get(key));
      if (!Q.matches(item,{...Q.empty(),orientation:query.orientation})){if(Date.now()>deadline)break;continue;}
    }
    items.push(item);
    if (items.length===limit||Date.now()>deadline) break;
  }
  return {items,total:query.orientation?null:total,nextOffset:offset+scanned,
    hasMore:offset+scanned<total,location:library.folder};
}
module.exports = { search };
