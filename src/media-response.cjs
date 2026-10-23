const fs=require('node:fs'),path=require('node:path'),{Readable}=require('node:stream');
const types={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',svg:'image/svg+xml',avif:'image/avif',bmp:'image/bmp',mp4:'video/mp4',m4v:'video/mp4',mov:'video/quicktime',webm:'video/webm',wav:'audio/wav',mp3:'audio/mpeg',ogg:'audio/ogg',flac:'audio/flac',m4a:'audio/mp4',aac:'audio/aac',ttf:'font/ttf',otf:'font/otf',woff:'font/woff',woff2:'font/woff2',pdf:'application/pdf',gltf:'model/gltf+json',glb:'model/gltf-binary'};
async function mediaResponse(file,request){
 const stat=await fs.promises.stat(file);if(!stat.isFile())return new Response('Not found',{status:404});
 const headers=new Headers({'Content-Type':types[path.extname(file).slice(1).toLowerCase()]||'application/octet-stream','Content-Length':String(stat.size),'Accept-Ranges':'bytes','Access-Control-Allow-Origin':'*','Cache-Control':'no-store','Last-Modified':stat.mtime.toUTCString()});
 if(request.method==='HEAD')return new Response(null,{status:200,headers});
 if(request.method!=='GET')return new Response(null,{status:405,headers:{Allow:'GET, HEAD'}});
 let start=0,end=stat.size-1,status=200;const range=request.headers.get('range');
 if(range){const m=/^bytes=(\d*)-(\d*)$/.exec(range);let valid=!!m&&!!(m[1]||m[2])&&stat.size>0;
  if(valid){if(!m[1]){const suffix=Number(m[2]);valid=Number.isSafeInteger(suffix)&&suffix>0;start=Math.max(0,stat.size-suffix);}else{start=Number(m[1]);end=m[2]?Number(m[2]):end;valid=Number.isSafeInteger(start)&&Number.isSafeInteger(end)&&start>=0&&start<stat.size&&end>=start;end=Math.min(end,stat.size-1);}}
  if(!valid){headers.set('Content-Range','bytes */'+stat.size);headers.set('Content-Length','0');return new Response(null,{status:416,headers});}
  status=206;headers.set('Content-Range',`bytes ${start}-${end}/${stat.size}`);headers.set('Content-Length',String(end-start+1));
 }
 const body=stat.size?Readable.toWeb(fs.createReadStream(file,{start,end})):null;
 return new Response(body,{status,headers});
}
module.exports={mediaResponse};
