const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
// Keep fixtures inside the workspace and avoid the host's short-name temp path,
// which FFmpeg cannot write to on this machine. Each run gets its own folder.
const root=path.resolve(__dirname,'..');fs.mkdirSync(path.join(root,'work'),{recursive:true});
const temporary=fs.mkdtempSync(path.join(root,'work','core-temp-'));
const tests=fs.readdirSync(path.join(root,'tests')).filter(name=>name.endsWith('.test.cjs')).sort().map(name=>path.join(root,'tests',name));
const result=spawnSync(process.execPath,['--test','--test-reporter=tap',...tests],{cwd:root,env:{...process.env,TEMP:temporary,TMP:temporary,TMPDIR:temporary},stdio:'inherit',windowsHide:true});
if(result.error)console.error(result.error);
process.exitCode=result.status??1;
