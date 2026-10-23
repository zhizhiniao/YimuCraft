const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const {inspect}=require('../src/media-metadata.cjs'),{Library}=require('../src/library.cjs'),{unzip}=require('../src/archive.cjs'),{transform}=require('../src/aetodopack.cjs');
test('real JPEG, video and audio header metadata survives package export',async()=>{
 const root=path.resolve('work/media-metadata-'+Date.now());fs.mkdirSync(root,{recursive:true});
 const ffmpeg=require('../src/media-preview.cjs').executable(),run=args=>execFileSync(ffmpeg,['-hide_banner','-loglevel','error',...args],{windowsHide:true});
 const jpg=path.join(root,'图片.jpg'),video=path.join(root,'视频.mp4'),audio=path.join(root,'声音.wav');
 run(['-f','lavfi','-i','color=red:s=320x180','-frames:v','1',jpg]);
 run(['-f','lavfi','-i','color=blue:s=640x360:r=25','-t','1.6','-c:v','libx264',video]);
 run(['-f','lavfi','-i','sine=frequency=440:duration=1.6',audio]);
 const lib=new Library(path.join(root,'library'));
 try{assert.deepEqual(await inspect(jpg),{width:320,height:180,duration:0});assert.deepEqual(await inspect(video),{width:640,height:360,duration:1.6});assert.deepEqual(await inspect(audio),{width:0,height:0,duration:1.6});
 await lib.importManaged([jpg,video,audio]);const pack=path.join(root,'media.aetodopack');await lib.exportAetodo(lib.query().items.map(a=>a.id),pack);const extracted=path.join(root,'extracted');await unzip(pack,extracted);const metadata=JSON.parse(transform(fs.readFileSync(path.join(extracted,'metadata'),'utf8'))).source;
 assert.equal(metadata.find(a=>a.ext==='jpg').width,320);assert.equal(metadata.find(a=>a.ext==='mp4').duration,1.6);assert.equal(metadata.find(a=>a.ext==='wav').duration,1.6);
 }finally{lib.close();}
});
