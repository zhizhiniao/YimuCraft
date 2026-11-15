const fs=require('node:fs'),path=require('node:path');
class OnboardingStore{
 constructor(directory){this.file=path.join(directory,'onboarding.json');}
 get(){try{const x=JSON.parse(fs.readFileSync(this.file,'utf8'));if(x.version===1&&['completed','skipped'].includes(x.status))return x;}catch{}return {version:1,status:'new'};}
 finish(status){if(!['completed','skipped'].includes(status))throw Error('无效引导状态');const next={version:1,status,updated:Date.now()};fs.mkdirSync(path.dirname(this.file),{recursive:true});fs.writeFileSync(this.file+'.tmp',JSON.stringify(next));fs.renameSync(this.file+'.tmp',this.file);return next;}
}
module.exports={OnboardingStore};
