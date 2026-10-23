const fs=require('node:fs/promises');
// Windows scanners/indexers can briefly hold a just-written file or directory.
// Do not retry structural errors, and never turn an exhausted retry into success.
async function renameRetry(source,target,rename=fs.rename,wait=ms=>new Promise(r=>setTimeout(r,ms))){
 for(let attempt=0;;attempt++){
  try{return await rename(source,target);}
  catch(e){if(attempt===5||!['EPERM','EACCES','EBUSY'].includes(e.code))throw e;await wait(50*2**attempt);}
 }
}
module.exports={renameRetry};
