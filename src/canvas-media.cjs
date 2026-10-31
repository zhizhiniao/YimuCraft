const path=require('node:path');
async function dimensions(file,kind='image'){try{if(kind==='video'){const m=await require('./media-metadata.cjs').inspect(file);return m.width&&m.height?{pixelWidth:m.width,pixelHeight:m.height}:{};}const m=await require('sharp')(file,{limitInputPixels:200000000}).metadata();const rotate=[5,6,7,8].includes(m.orientation);return m.width&&m.height?{pixelWidth:rotate?m.height:m.width,pixelHeight:rotate?m.width:m.height}:{};}catch{return {};}}
function fitted(i){if(!i.pixelWidth||!i.pixelHeight)return {width:256,height:190};const s=256/Math.max(i.pixelWidth,i.pixelHeight);return {width:Math.max(8,i.pixelWidth*s),height:Math.max(8,i.pixelHeight*s)};}
function sequenceKey(i,b){if(i.kind!=='image'||!/^(png|jpg|jpeg|webp|tif|tiff|exr|bmp)$/i.test(i.ext))return null;const m=path.basename(i.relative).match(/^(.*?)(\d{2,})(\.[^.]+)$/);if(!m||/(?:v|ver|version|版本)[_ .-]*$/i.test(m[1]))return null;const source=b?.sources.find(s=>s.id===i.sourceId),directory=source?(source.type==='file'?path.dirname(source.path):path.dirname(path.resolve(source.path,i.relative))):i.sourceId+'|'+path.dirname(i.relative);return {key:[directory.toLowerCase(),m[1].toLowerCase(),m[2].length,m[3].toLowerCase()].join('|'),number:Number(m[2]),prefix:m[1]};}
function reconcileSequences(b){
 const buckets=new Map();for(const i of Object.values(b.items)){delete i.sequenceId;const s=sequenceKey(i,b);if(!s||i.missing)continue;const a=buckets.get(s.key)||[];a.push({item:i,...s});buckets.set(s.key,a);}
 for(const s of Object.values(b.items).filter(i=>i.kind==='sequence'))s.missing=true;
 for(const [key,rows] of buckets){rows.sort((a,b)=>a.number-b.number);let s=Object.values(b.items).find(i=>i.kind==='sequence'&&i.sequenceKey===key);const consecutive=rows.every((r,i)=>!i||r.number===rows[i-1].number+1);if(!s&&(rows.length<3||!consecutive))continue;
  if(!s){s={...rows[0].item,id:require('node:crypto').randomUUID(),kind:'sequence',name:rows[0].prefix+'[序列]',sequenceKey:key,frameIds:[],collapsed:true,fps:24,history:[],hiddenAt:null,tags:[],status:'pending'};delete s.identity;delete s.relative;delete s.sourceId;b.items[s.id]=s;}
  s.frameIds=rows.map(r=>r.item.id);s.missing=false;s.gaps=!consecutive;s.admitted=rows.some(r=>r.item.admitted);s.modified=Math.max(...rows.map(r=>r.item.modified));for(const {item} of rows)item.sequenceId=s.id;
 }
}
module.exports={dimensions,fitted,sequenceKey,reconcileSequences};
