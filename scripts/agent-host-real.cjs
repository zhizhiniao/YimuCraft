// Real installed clients call Yimu MCP. Credentials remain in process memory.
const {app,safeStorage}=require('electron'),fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
app.whenReady().then(async()=>{
 const out=path.resolve('evidence/agents-models-20261023',String(Date.now()));fs.mkdirSync(out,{recursive:true});
 const home=process.env.USERPROFILE,env={...process.env};delete env.ELECTRON_RUN_AS_NODE;
 const prompt='只读集成验收：只调用 yimucraft 的 yimu_search 工具，参数 q 为 Logo，limit 为 3。报告实际 total 和前三条 id、name。不执行命令，不读其他文件，不修改数据；不能调用就明确说明，禁止编造。';
 async function run(name,exe,args,vars){return new Promise(resolve=>{const stdout=fs.openSync(path.join(out,name+'.jsonl'),'w'),stderr=fs.openSync(path.join(out,name+'-stderr.log'),'w');const child=spawn(exe,args,{env:{...env,...vars},cwd:path.resolve('work'),windowsHide:true,stdio:['ignore',stdout,stderr]});const timer=setTimeout(()=>child.kill(),180000);child.on('error',()=>{});child.on('close',code=>{clearTimeout(timer);fs.closeSync(stdout);fs.closeSync(stderr);resolve({name,code});});});}
 const claude=JSON.parse(fs.readFileSync(path.join(home,'.claude/settings.json'),'utf8')).env;
 // Launch shipped CLI manager through Node, avoiding cmd quoting of task text.
 const runtime=path.join(process.env.LOCALAPPDATA,'Programs/DeepSeek Harness/resources/runtime');
 const launcher=fs.readFileSync(path.join(runtime,'cli/bin/dsh.cmd'),'utf8');
 fs.writeFileSync(path.join(out,'launcher.txt'),launcher);
 const cat=JSON.parse(fs.readFileSync(path.join(process.env.APPDATA,'Nomi/model-catalog.json'),'utf8'));
 const kh=path.resolve('work/kimi-real-'+Date.now());fs.mkdirSync(kh,{recursive:true});
 fs.copyFileSync(path.join(home,'.kimi-code/mcp.json'),path.join(kh,'mcp.json'));
 fs.writeFileSync(path.join(kh,'config.toml'),'default_model = "yimu/kimi"\nmerge_all_available_skills = false\n[providers.yimu]\ntype = "kimi"\nbase_url = "https://api.moonshot.cn/v1"\napi_key = '+JSON.stringify(require("../src/model-nomi-secret.cjs").decryptNomi(home,cat.apiKeysByVendor["kimi"].apiKey))+'\n[models."yimu/kimi"]\nprovider = "yimu"\nmodel = "kimi-k3"\nmax_context_size = 262144\ncapabilities = ["thinking", "tool_use"]\n[[permission.rules]]\ndecision = "allow"\npattern = "mcp__yimucraft__yimu_search"\n');
 const result=await run('kimi',path.join(home,'.kimi-code/bin/kimi.exe'),['-p',prompt,'--output-format','stream-json'],{KIMI_CODE_HOME:kh,YIMU_KIMI_KEY:require('../src/model-nomi-secret.cjs').decryptNomi(home,cat.apiKeysByVendor['kimi'].apiKey)});
 const configFile=path.join(kh,'config.toml');fs.writeFileSync(configFile,fs.readFileSync(configFile,'utf8').replace(/^api_key = .*$/m,'api_key = ""'));
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({out,result}));console.log(JSON.stringify({out,result}));app.quit();
}).catch(e=>{console.error(e.message);app.exit(1);});
