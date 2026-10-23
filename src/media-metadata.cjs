const path=require('node:path'),{spawn}=require('node:child_process');
const extensions=new Set('png jpg jpeg webp gif bmp avif tif tiff exr dpx tga psd hdr dds jp2 j2k jpf jpx mp4 webm mov m4v mkv avi mxf wav mp3 ogg flac m4a aac'.split(' '));
// Inspect headers only. No output or media decode is requested.
function inspect(file){
 if(!extensions.has(path.extname(file).slice(1).toLowerCase()))return Promise.resolve({width:0,height:0,duration:0});
 return new Promise((resolve,reject)=>{
  const child=spawn(require('./media-preview.cjs').executable(),['-hide_banner','-nostdin','-protocol_whitelist','file,pipe','-i',file],{windowsHide:true,stdio:['ignore','ignore','pipe']});
  let log='',settled=false;const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);error?reject(error):resolve(value);};
  const timer=setTimeout(()=>{child.kill();finish(Error('读取媒体信息超时：'+path.basename(file)));},15000);
  child.stderr.on('data',b=>{log=(log+b).slice(-64000);});
  child.once('error',e=>finish(e));
  child.once('close',()=>{const video=log.split(/\r?\n/).find(l=>/Stream #.*Video:/.test(l)),size=video?.match(/(?:,|\s)(\d{1,6})x(\d{1,6})(?:[\s,\[]|$)/),time=log.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);finish(null,{width:size?Number(size[1]):0,height:size?Number(size[2]):0,duration:time?Number(time[1])*3600+Number(time[2])*60+Number(time[3]):0});});
 });
}
module.exports={inspect};
