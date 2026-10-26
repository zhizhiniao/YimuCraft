// Read-only acceptance through the installed WorkBuddy engine; no credential copying.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const {ClientConnect}=require('../src/client-connect.cjs');
(async()=>{
 const out=path.resolve('evidence/workbuddy-recheck-'+Date.now());fs.mkdirSync(out,{recursive:true});
 const file=path.join(process.env.USERPROFILE,'.workbuddy/mcp.json'),before=fs.readFileSync(file);
 const entry=JSON.parse(before).mcpServers.yimucraft;
 const engine=path.resolve('work/workbuddy-runtime/cli/dist/codebuddy-lite-wb.mjs');
 const original=require('@electron/asar').extractFile(path.join(process.env.LOCALAPPDATA,'Programs/WorkBuddy/resources/app.asar'),path.join('cli','dist','codebuddy-lite-wb.mjs'));
 const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
 if(hash(original)!==hash(fs.readFileSync(engine)))throw Error('Installed engine differs');
 await new ClientConnect({home:process.env.USERPROFILE,appData:process.env.APPDATA,entry:()=>entry}).probe(entry);
 const config=path.join(out,'mcp.json');fs.writeFileSync(config,JSON.stringify({mcpServers:{yimucraft:entry}},null,2));
 const stdout=fs.openSync(path.join(out,'host.jsonl'),'w'),stderr=fs.openSync(path.join(out,'stderr.log'),'w');
 const prompt='只读集成验收：只调用 yimucraft 的 yimu_search，参数 q 为 Logo、limit 为 3。报告实际 total 和前三条 id、name。不执行命令，不读其他文件，不修改数据；无法调用则明确说明，禁止编造。';
 const args=[engine,'-p',prompt,'--output-format','stream-json','--verbose','--model','custom-local:kimi-k2.6','--settings',path.resolve('work/wb-search-settings.json'),'--mcp-config',config,'--strict-mcp-config','--no-session-persistence','--max-turns','5'];
 const child=spawn(process.execPath,args,{cwd:path.resolve('work'),env:process.env,windowsHide:true,stdio:['ignore',stdout,stderr]});
 const timer=setTimeout(()=>child.kill(),180000);
 const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',resolve);});clearTimeout(timer);fs.closeSync(stdout);fs.closeSync(stderr);
 const rows=fs.readFileSync(path.join(out,'host.jsonl'),'utf8').split('\n').filter(Boolean).flatMap(x=>{try{return [JSON.parse(x)];}catch{return [];}});
 const content=rows.flatMap(r=>r.message?.content||[]),calls=content.filter(c=>c.type==='tool_use');
 const result=content.filter(c=>c.type==='tool_result'&&!c.is_error).flatMap(c=>Array.isArray(c.content)?c.content:[]).find(c=>c.text?.includes('"libraryId"'));
 const data=result?JSON.parse(result.text):null;
 const report={out,code,engineIdentical:true,interfaceProbe:true,configurationUnchanged:before.equals(fs.readFileSync(file)),calls,search:data?{total:data.total,items:data.items.map(({id,name})=>({id,name}))}:null,desktopUI:false};
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 if(!data||code!==0||!report.configurationUnchanged)process.exitCode=1;
})().catch(e=>{console.error(e.message);process.exitCode=1;});
