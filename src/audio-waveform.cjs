const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawn}=require('child_process');
const jobs=new Map(),waiting=[],children=new Set();let running=0;
function schedule(fn){return new Promise((resolve,reject)=>{waiting.push({fn,resolve,reject});drain();});}
function drain(){while(running<2&&waiting.length){const job=waiting.shift();running++;job.fn().then(job.resolve,job.reject).finally(()=>{running--;drain();});}}
function decode(file){return new Promise((resolve,reject)=>{
 const rate=22050,child=spawn(require('./media-preview.cjs').executable(),['-hide_banner','-nostdin','-v','error','-i',file,'-map','0:a:0','-ac','1','-ar',String(rate),'-f','s16le','pipe:1'],{windowsHide:true,stdio:['ignore','pipe','pipe']});children.add(child);
 let bins=[],span=128,count=0,peak=0,total=0,carry=null,error='',timedOut=false;
 const timer=setTimeout(()=>{timedOut=true;child.kill();},5*60*1000);
 child.stderr.on('data',b=>{error=(error+b).slice(-2000);});
 child.stdout.on('data',buffer=>{let data=carry===null?buffer:Buffer.concat([Buffer.from([carry]),buffer]);carry=data.length%2?data[data.length-1]:null;for(let i=0;i+1<data.length;i+=2){peak=Math.max(peak,Math.abs(data.readInt16LE(i))/32768);count++;total++;if(count===span){bins.push(peak);peak=0;count=0;if(bins.length===2048){const merged=[];for(let j=0;j<bins.length;j+=2)merged.push(Math.max(bins[j],bins[j+1]));bins=merged;span*=2;}}}});
 child.once('error',e=>{clearTimeout(timer);children.delete(child);reject(e);});child.once('close',code=>{clearTimeout(timer);children.delete(child);if(code!==0||!total)return reject(Error(timedOut?'音频波形分析超时':'音频波形分析失败：'+error));if(count)bins.push(peak);const peaks=[];for(let i=0;i<240;i++){const start=Math.floor(i*total/240/span),end=Math.min(bins.length-1,Math.floor(Math.max(0,(i+1)*total/240-1)/span));let value=0;for(let j=start;j<=end;j++)value=Math.max(value,bins[j]);peaks.push(value);}resolve({peaks,duration:total/rate});});
});}
async function waveform(file,directory){const stat=await fs.promises.stat(file),key=crypto.createHash('sha256').update(JSON.stringify([file,stat.size,stat.mtimeMs,1])).digest('hex'),cache=path.join(directory,key+'.json');if(jobs.has(cache))return jobs.get(cache);const job=(async()=>{try{const value=JSON.parse(await fs.promises.readFile(cache,'utf8'));if(value.peaks?.length===240&&value.peaks.every(n=>Number.isFinite(n)&&n>=0&&n<=1)&&value.duration>0)return value;}catch{}const value=await schedule(()=>decode(file));await fs.promises.mkdir(directory,{recursive:true});const temporary=cache+'.'+crypto.randomUUID()+'.tmp';try{await fs.promises.writeFile(temporary,JSON.stringify(value));await fs.promises.rename(temporary,cache);}finally{await fs.promises.rm(temporary,{force:true});}return value;})();jobs.set(cache,job);try{return await job;}finally{jobs.delete(cache);}}
function dispose(){for(const child of children)child.kill();for(const job of waiting.splice(0))job.reject(Error('应用正在退出'));}
module.exports={waveform,dispose};
