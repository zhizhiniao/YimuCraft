const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),sharp=require('sharp');
const {CanvasPreviewMedia}=require('../src/canvas-preview-media.cjs');
test('compatibility image cache deduplicates, validates source changes, preserves original and rejects invalid media',async()=>{
 const root=await fs.mkdtemp(path.resolve('work/canvas-preview-cache-')),file=path.join(root,'image.tiff'),cache=new CanvasPreviewMedia(path.join(root,'cache'));
 try{await sharp({create:{width:36,height:64,channels:3,background:'red'}}).tiff().toFile(file);const before=await fs.readFile(file),[a,b]=await Promise.all([cache.ensure(file,'image'),cache.ensure(file,'image')]);assert.equal(a,b);assert.equal((await sharp(a).metadata()).height,64);assert.deepEqual(await fs.readFile(file),before);
 await sharp({create:{width:72,height:128,channels:3,background:'blue'}}).tiff().toFile(file);const c=await cache.ensure(file,'image');assert.notEqual(c,a);assert.equal((await sharp(c).metadata()).width,72);
 await fs.writeFile(file,'broken');await assert.rejects(cache.ensure(file,'image'));await assert.rejects(cache.ensure(file,'project'));assert.ok((await fs.readdir(path.join(root,'cache'))).every(n=>n.endsWith('.png')));assert.equal(cache.jobs.size,0);
 await fs.unlink(file);await assert.rejects(cache.ensure(file,'image'));
 }finally{await cache.close();}
});
test('preview queue limits concurrency and shutdown rejects queued work',async()=>{
 const cache=new CanvasPreviewMedia('unused');let release;const gate=new Promise(r=>release=r);let starts=0;const first=cache.schedule(async()=>{starts++;await gate;}),second=cache.schedule(async()=>{starts++;await gate;});const queued=cache.schedule(async()=>{starts++;});const rejection=assert.rejects(queued,/应用正在退出/);assert.equal(starts,2);await cache.close();release();await Promise.all([first,second,rejection]);assert.equal(starts,2);await assert.rejects(cache.schedule(async()=>{}),/预览已关闭/);
});
test('PSD and PSB stored composites are rendered as images without altering layers',async()=>{
 const root=await fs.mkdtemp(path.resolve('work/canvas-preview-psd-')),cache=new CanvasPreviewMedia(path.join(root,'cache'));
 try{for(const version of [1,2]){const header=Buffer.alloc(version===1?40:44);header.write('8BPS');header.writeUInt16BE(version,4);header.writeUInt16BE(3,12);header.writeUInt32BE(2,14);header.writeUInt32BE(3,18);header.writeUInt16BE(8,22);header.writeUInt16BE(3,24);const input=path.join(root,version===1?'image.psd':'image.psb'),original=Buffer.concat([header,Buffer.from(Array.from({length:18},(_,n)=>n*10))]);await fs.writeFile(input,original);const output=await cache.ensure(input,'image'),meta=await sharp(output).metadata();assert.equal(meta.width,3);assert.equal(meta.height,2);assert.deepEqual(await fs.readFile(input),original);}}
 finally{await cache.close();}
});
test('cache eviction touches only completed generated files and keeps active output',async()=>{
 const root=await fs.mkdtemp(path.resolve('work/canvas-preview-prune-')),cache=new CanvasPreviewMedia(root),keep=path.join(root,'0'.repeat(64)+'.png');
 await Promise.all(Array.from({length:202},(_,i)=>fs.writeFile(path.join(root,i.toString(16).padStart(64,'0')+'.png'),'cache')));await fs.writeFile(path.join(root,'unrelated.txt'),'keep');await fs.writeFile(path.join(root,'pending.tmp'),'pending');await cache.prune(keep);assert.equal((await fs.readdir(root)).filter(n=>n.endsWith('.png')).length,200);assert.equal(await fs.readFile(keep,'utf8'),'cache');assert.equal(await fs.readFile(path.join(root,'unrelated.txt'),'utf8'),'keep');assert.equal(await fs.readFile(path.join(root,'pending.tmp'),'utf8'),'pending');await cache.close();
});
