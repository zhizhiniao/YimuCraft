const fs=require('node:fs'),path=require('node:path');
async function receive(lib,report=()=>{}){
 const inbox=path.join(lib.folder,'ae-inbox'),base=path.join(lib.folder,'managed','ae');if(!fs.existsSync(inbox))return {count:0};
 const {inside}=require('./library.cjs');let count=0;const errors=[];
 for(const name of fs.readdirSync(inbox).filter(n=>/^ae-\d+-\d+\.json$/.test(n))){
  const file=path.join(inbox,name);try{
   const r=JSON.parse(fs.readFileSync(file,'utf8'));if(r.id!==name.slice(0,-5)||r.operation!=='collectCurrent')throw Error('打包回执无效');if(!r.ok)throw Error(r.error||'AE 打包失败');
   const output=path.join(base,r.id),project=r.result?.project;
   if(!project||!inside(output,project)||!fs.existsSync(project)||!inside(fs.realpathSync(output),fs.realpathSync(project)))throw Error('工程不在当前库的打包目录');
   if(r.result.after?.missing?.length||!Array.isArray(r.result.after?.files))throw Error('打包依赖尚未验证');
   for(const dep of r.result.after.files){if(!dep.path||!inside(output,dep.path)||!fs.existsSync(dep.path)||!inside(fs.realpathSync(output),fs.realpathSync(dep.path)))throw Error('打包仍有外部或缺失依赖');}
   const imported=await lib.importPaths([project],report);if(imported.errors.length)throw Error(imported.errors[0].error);
   const row=lib.db.prepare('SELECT id FROM assets WHERE path_key=?').get(path.resolve(project).toLowerCase());lib.db.prepare('UPDATE assets SET bundle_folder=? WHERE id=?').run(output,row.id);
   fs.renameSync(file,file+'.received');count++;
  }catch(e){errors.push({file:name,error:e.message});fs.renameSync(file,file+'.failed');}
 }
 return {count,errors,message:count?'AE 工程已打包回库 · '+count+' 项':errors.length?errors[0].error:''};
}
module.exports={receive};
