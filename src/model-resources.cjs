const fs=require('node:fs'),path=require('node:path');
async function resources(file){
 const ext=path.extname(file).toLowerCase();if(ext==='.obj')return objResources(file);if(!['.gltf','.glb'].includes(ext))return [];
 const stat=await fs.promises.stat(file);if(stat.size>64*1024*1024)throw Error('模型超过 64 MB');const bytes=await fs.promises.readFile(file);let json;
 if(ext==='.gltf')json=JSON.parse(bytes.toString('utf8'));
 else{if(bytes.length<20||bytes.readUInt32LE(0)!==0x46546c67||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(16)!==0x4e4f534a||20+bytes.readUInt32LE(12)>bytes.length)throw Error('GLB 文件结构无效');json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString('utf8'));}
 const uris=[...new Set([...(json.buffers||[]),...(json.images||[])].map(v=>v.uri).filter(v=>typeof v==='string'&&!/^data:/i.test(v)))];if(uris.length>1000)throw Error('模型外部资源超过 1000 项');const root=path.dirname(file),realRoot=await fs.promises.realpath(root),{inside}=require('./library.cjs'),result=[];let total=0;
 for(const uri of uris){if(/[?#]/.test(uri)||/^[a-z][a-z0-9+.-]*:|^[/\\]/i.test(uri))throw Error('模型仅支持同目录内的相对资源：'+uri);let relative;try{relative=decodeURIComponent(uri);}catch{throw Error('模型资源路径编码无效');}const resource=path.resolve(root,relative);if(!inside(root,resource))throw Error('模型资源越出模型目录');const st=await fs.promises.lstat(resource);if(!st.isFile()||st.isSymbolicLink()||!inside(realRoot,await fs.promises.realpath(resource)))throw Error('模型资源不是目录内的普通文件');total+=st.size;if(total>256*1024*1024)throw Error('模型外部资源超过 256 MB');result.push({uri,path:resource,size:st.size});}
 return result;
}
async function objResources(file){
 const root=path.dirname(file),realRoot=await fs.promises.realpath(root),{inside}=require('./library.cjs'),result=[],seen=new Set();let total=0;
 if((await fs.promises.stat(file)).size>64*1024*1024)throw Error('模型超过 64 MB');
 const text=await fs.promises.readFile(file,'utf8'),libraries=[...text.matchAll(/^\s*mtllib[ \t]+(.+?)\s*$/gm)].map(m=>m[1].replaceAll('\\','/'));
 async function add(uri){uri=path.posix.normalize(uri);if(seen.has(uri))return;seen.add(uri);if(seen.size>1000||/^[a-z][a-z0-9+.-]*:|^[/\\]/i.test(uri))throw Error('OBJ 材质路径无效');const resource=path.resolve(root,uri);if(!inside(root,resource))throw Error('模型资源越出模型目录');const st=await fs.promises.lstat(resource);if(!st.isFile()||st.isSymbolicLink()||!inside(realRoot,await fs.promises.realpath(resource)))throw Error('模型资源不是目录内的普通文件');total+=st.size;if(total>256*1024*1024)throw Error('模型外部资源超过 256 MB');result.push({uri,path:resource,size:st.size});return resource;}
 for(const uri of libraries){const material=await add(uri);if(!material)continue;const mtl=await fs.promises.readFile(material,'utf8');for(const line of mtl.split(/\r?\n/)){const match=line.trim().match(/^(?:map_k[adse]|map_d|map_bump|bump|norm|disp)\s+(.+)$/i);if(!match)continue;const words=match[1].trim().split(/\s+/);for(const [flag,count]of [['-bm',1],['-mm',2],['-s',3],['-o',3]]){const index=words.indexOf(flag);if(index>=0)words.splice(index,count+1);}const texture=words.join(' ').replaceAll('\\','/');await add(path.posix.join(path.posix.dirname(uri),texture));}}
 return result;
}
module.exports={resources};
