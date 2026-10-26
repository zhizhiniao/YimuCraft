const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const keys=['pr','ae','ps','audio'];
function validate(key){if(!keys.includes(key))throw Error('未知文件夹入口');}
function read(root){try{const data=JSON.parse(fs.readFileSync(path.join(root,'folder-shortcuts.json'),'utf8'));return Object.fromEntries(keys.filter(k=>typeof data[k]==='string'&&path.isAbsolute(data[k])).map(k=>[k,data[k]]));}catch(e){if(e.code==='ENOENT')return {};throw Error('文件夹入口配置无法读取，请保留配置文件并检查');}}
async function write(root,key,folder){validate(key);const data=read(root);if(folder)data[key]=path.resolve(folder);else delete data[key];const file=path.join(root,'folder-shortcuts.json'),tmp=file+'.'+crypto.randomUUID()+'.tmp';try{await fs.promises.writeFile(tmp,JSON.stringify(data,null,2));await fs.promises.rename(tmp,file);}finally{await fs.promises.rm(tmp,{force:true});}return data;}
module.exports={read,write,validate};
