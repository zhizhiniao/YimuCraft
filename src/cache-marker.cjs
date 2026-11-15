const fs=require('node:fs'),path=require('node:path');
const MARKER='.yimucraft-cache.json',roots=new Set(),key=p=>path.resolve(p).toLowerCase();
function inside(root,file){const rel=path.relative(key(root),key(file));return rel===''||(!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel));}
function isCacheDirectory(folder){if(roots.has(key(folder)))return true;try{const file=path.join(folder,MARKER),st=fs.lstatSync(file);if(!st.isFile()||st.isSymbolicLink()||st.size>4096)return false;const m=JSON.parse(fs.readFileSync(file,'utf8'));return m.app==='YimuCraft'&&['library','canvas'].includes(m.kind);}catch{return false;}}
function isCachePath(file){return [...roots].some(root=>inside(root,file));}
function managedFile(file){if(isCachePath(file))return true;for(let dir=path.dirname(file),i=0;i<32;i++){if(isCacheDirectory(dir))return true;const parent=path.dirname(dir);if(parent===dir)break;dir=parent;}return false;}
module.exports={MARKER,isCacheDirectory,isCachePath,managedFile,register:folder=>roots.add(key(folder))};
