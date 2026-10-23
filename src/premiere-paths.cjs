const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const decode=s=>s.replace(/&#x([0-9a-f]+);|&#([0-9]+);|&(amp|lt|gt|quot|apos);/gi,(_m,hex,decimal,named)=>hex?String.fromCodePoint(parseInt(hex,16)):decimal?String.fromCodePoint(Number(decimal)):({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'"})[named.toLowerCase()]);
const encode=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&apos;');
// Only normalize newly collected copies. Never modify an input/user project.
async function normalizeCollected(file,relocate=false){
 const bytes=await fs.promises.readFile(file),compressed=bytes[0]===31&&bytes[1]===139;
 if(bytes.length>256*1024*1024)throw Error('PR 工程超过路径迁移处理上限');
 const xml=(compressed?zlib.gunzipSync(bytes,{maxOutputLength:256*1024*1024}):bytes).toString('utf8');if(!xml.includes('<PremiereData')||/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('不支持此 PR 工程结构');
 const root=path.dirname(file),{inside}=require('./library.cjs');let count=0;
 const next=xml.replace(/<Media\s[^>]*>[\s\S]*?<\/Media>/g,block=>{const match=block.match(/<FilePath>([^<]*)<\/FilePath>/);if(!match)return block;const relativeMatch=block.match(/<RelativePath>([^<]*)<\/RelativePath>/);const target=path.resolve(relocate&&relativeMatch?path.join(root,decode(relativeMatch[1])):decode(match[1]).replace(/^\\\\\?\\/,''));if(!inside(root,target)||!fs.existsSync(target)||!fs.lstatSync(target).isFile()||fs.lstatSync(target).isSymbolicLink()||!inside(fs.realpathSync(root),fs.realpathSync(target)))throw Error('收集副本仍引用未收集的文件：'+target);const relative='.\\'+path.relative(root,target).split(path.sep).join('\\');count++;for(const [tag,value]of [['FilePath',target],['RelativePath',relative],['ActualMediaFilePath',target]]){const element='<'+tag+'>'+encode(value)+'</'+tag+'>';const pattern=new RegExp('<'+tag+'>[^<]*<\\/'+tag+'>');block=pattern.test(block)?block.replace(pattern,()=>element):block.replace('</Media>',element+'\n</Media>');}return block;});
 if(next!==xml){const temporary=file+'.paths.tmp';await fs.promises.writeFile(temporary,compressed?zlib.gzipSync(next):next,{flag:'wx'});await fs.promises.rename(temporary,file);}
 return {media:count};
}
module.exports={normalizeCollected};
