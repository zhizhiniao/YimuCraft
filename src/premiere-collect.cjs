const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
async function collectCurrent(lib,project,directory,report=()=>{}){
 const output=path.join(lib.folder,'packages',crypto.randomUUID());await fs.promises.mkdir(output,{recursive:true});
 report({phase:'PR 正在收集工程与媒体'});
 try{
  const {PremiereBridge}=require('./premiere-bridge.cjs');const receipt=await new PremiereBridge(directory).run('collectCurrent',{expectedProject:project,output});
  const projects=[],files=[];async function scan(dir){for(const e of await fs.promises.readdir(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isSymbolicLink())throw Error('收集结果含链接');if(e.isDirectory())await scan(file);else if(e.isFile()){files.push(file);if(/\.prproj$/i.test(file))projects.push(file);}}}await scan(output);
  if(projects.length!==1)throw Error('PR 收集结果必须包含一个工程文件');
  const projectFile=projects[0],bundle=path.dirname(projectFile);if(files.some(f=>!require('./library.cjs').inside(bundle,f)))throw Error('PR 收集结果有位于工程目录外的依赖');
  await require('./premiere-paths.cjs').normalizeCollected(projectFile);
  lib.db.exec('BEGIN');try{const result=await lib.importPaths([projectFile],report);if(result.errors.length)throw Error(result.errors[0].error);const row=lib.db.prepare('SELECT id FROM assets WHERE path_key=?').get(projectFile.toLowerCase());lib.db.prepare('UPDATE assets SET bundle_folder=?,portable_pr=1 WHERE id=?').run(bundle,row.id);lib.db.exec('COMMIT');return {id:row.id,path:projectFile,dependencies:files.length-1,receipt:receipt.receipt,message:'PR 工程已收集入库 · '+(files.length-1)+' 个依赖文件'};}catch(e){if(lib.db.isTransaction)lib.db.exec('ROLLBACK');throw e;}
 }catch(e){e.message+='；未完成的收集结果保留于 '+output;throw e;}
}
module.exports={collectCurrent};
