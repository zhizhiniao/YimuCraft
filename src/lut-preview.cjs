const fs=require('node:fs');
const clamp=x=>Math.max(0,Math.min(1,x));
function parse(text){
 if(Buffer.byteLength(text)>32*1024*1024)throw Error('CUBE 超过 32 MB 预览上限');
 let size=0,dimension=0,title='',minimum=[0,0,0],maximum=[1,1,1];const values=[];
 for(const raw of text.replace(/^\uFEFF/,'').split(/\r?\n/)){
  const line=raw.replace(/#.*$/,'').trim();if(!line)continue;
  if(/^TITLE\s/.test(line)){title=line.slice(5).trim().replace(/^"|"$/g,'');continue;}
  const parts=line.split(/\s+/),name=parts.shift();
  if(name==='LUT_3D_SIZE'||name==='LUT_1D_SIZE'){if(size)throw Error('暂不支持组合或重复的 CUBE 尺寸');dimension=name==='LUT_3D_SIZE'?3:1;size=Number(parts[0]);if(parts.length!==1||!Number.isInteger(size)||size<2||size>(dimension===3?65:65536))throw Error('CUBE 尺寸不支持');continue;}
  if(name==='DOMAIN_MIN'||name==='DOMAIN_MAX'){const v=parts.map(Number);if(v.length!==3||!v.every(Number.isFinite))throw Error('CUBE 输入范围无效');if(name==='DOMAIN_MIN')minimum=v;else maximum=v;continue;}
  const row=[name,...parts].map(Number);if(row.length!==3||!row.every(Number.isFinite))throw Error('CUBE 含不支持的指令或数值');values.push(...row);
 }
 if(!size||values.length!==Math.pow(size,dimension)*3)throw Error('CUBE 数据行数与尺寸不符');
 if(minimum.some((v,i)=>v>=maximum[i]))throw Error('CUBE 输入范围无效');
 return {size,dimension,title,minimum,maximum,values:Float32Array.from(values)};
}
function sample(lut,rgb){
 const {size,dimension,minimum,maximum,values}=lut,pos=rgb.map((v,i)=>clamp((v-minimum[i])/(maximum[i]-minimum[i]))*(size-1)),low=pos.map(Math.floor),high=low.map(v=>Math.min(size-1,v+1)),fraction=pos.map((v,i)=>v-low[i]);
 if(dimension===1)return pos.map((_,c)=>values[low[c]*3+c]*(1-fraction[c])+values[high[c]*3+c]*fraction[c]);
 const out=[0,0,0];for(let b=0;b<2;b++)for(let g=0;g<2;g++)for(let r=0;r<2;r++){const index=((b?high[2]:low[2])*size*size+(g?high[1]:low[1])*size+(r?high[0]:low[0]))*3,weight=(r?fraction[0]:1-fraction[0])*(g?fraction[1]:1-fraction[1])*(b?fraction[2]:1-fraction[2]);for(let c=0;c<3;c++)out[c]+=values[index+c]*weight;}return out;
}
async function render(file,destination,imageFile){
 const st=await fs.promises.stat(file);if(st.size>32*1024*1024)throw Error('CUBE 超过 32 MB 预览上限');const lut=parse(await fs.promises.readFile(file,'utf8'));
 const {createCanvas,loadImage}=require('@napi-rs/canvas');let width=320,height=180,image;
 if(imageFile){if((await fs.promises.stat(imageFile)).size>32*1024*1024)throw Error('参考图片超过 32 MB');image=await loadImage(imageFile);if(image.width*image.height>40000000)throw Error('参考图片超过 4000 万像素');const ratio=Math.min(1,480/image.width,360/image.height);width=Math.max(1,Math.round(image.width*ratio));height=Math.max(1,Math.round(image.height*ratio));}
 const canvas=createCanvas(width*2,height),ctx=canvas.getContext('2d');if(image)ctx.drawImage(image,0,0,width,height);else{const pixels=ctx.createImageData(width,height);for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=(y*width+x)*4;pixels.data[i]=Math.round(x/(width-1)*255);pixels.data[i+1]=Math.round(y/(height-1)*255);pixels.data[i+2]=Math.round((1-x/(width-1))*255);pixels.data[i+3]=255;}ctx.putImageData(pixels,0,0);}
 const pixels=ctx.getImageData(0,0,width,height);for(let i=0;i<pixels.data.length;i+=4){const rgb=sample(lut,[pixels.data[i]/255,pixels.data[i+1]/255,pixels.data[i+2]/255]);for(let c=0;c<3;c++)pixels.data[i+c]=Math.round(clamp(rgb[c])*255);}ctx.putImageData(pixels,width,0);await fs.promises.writeFile(destination,canvas.toBuffer('image/png'));return {title:lut.title,dimension:lut.dimension,size:lut.size};
}
module.exports={parse,sample,render};
