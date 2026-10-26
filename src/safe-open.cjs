const path=require('node:path');
// Only formats used as documents/media are delegated to OS file associations.
// Scripts and unknown formats remain reachable through Reveal in Explorer.
const allowed=new Set(('png jpg jpeg webp gif bmp svg avif psd psb tif tiff exr dpx tga ai pdf hdr dds jp2 j2k jpf jpx '+
 'mp4 webm mov m4v mkv avi mxf wav mp3 ogg flac m4a aac '+
 'aep aepx prproj mogrt cube obj stl glb gltf fbx ttf otf woff woff2 txt md csv json '+
 'cr2 cr3 nef nrw arw dng raf orf rw2 pef srw').split(/\s+/));
function assertSafeOpen(file){
 if(typeof file!=='string'||!allowed.has(path.extname(file).slice(1).toLowerCase()))throw Error('此文件类型不支持直接打开，请先在文件夹中检查；AE 脚本请使用发送到 AE 并确认执行');
}
module.exports={assertSafeOpen};
