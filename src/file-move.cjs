const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
// Hard links provide no-overwrite semantics. The temporary link keeps bytes
// recoverable while Windows performs a case-only rename.
async function moveNoReplace(source,target){
 if(source===target)return;
 const sameKey=source.toLowerCase()===target.toLowerCase();
 if(!sameKey){await fs.link(source,target);try{await fs.unlink(source);}catch(e){await fs.unlink(target);throw e;}return;}
 const siblings=await fs.readdir(path.dirname(source));
 if(siblings.includes(path.basename(target)))throw Error('同名文件已存在');
 const backup=path.join(path.dirname(source),'.yimu-rename-'+crypto.randomUUID());
 await fs.link(source,backup);let removed=false,created=false;
 try{await fs.unlink(source);removed=true;await fs.link(backup,target);created=true;await fs.unlink(backup);}
 catch(e){try{if(created)await fs.unlink(target);if(removed)await fs.link(backup,source);await fs.unlink(backup);}catch(recovery){throw Error('重命名恢复失败，文件保留于 '+backup+'：'+recovery.message);}throw e;}
}
module.exports={moveNoReplace};
