const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFile}=require('node:child_process'),{promisify}=require('node:util');
const run=promisify(execFile);
const digest=s=>crypto.createHash('sha256').update(s||'').digest('hex');
const read=file=>fs.existsSync(file)?fs.readFileSync(file,'utf8'):null;
function json(text){try{const d=JSON.parse((text||'{}').replace(/^\uFEFF/,''));if(!d||Array.isArray(d)||typeof d!=='object')throw 0;return d;}catch{throw Error('现有配置不是有效 JSON，未覆盖；请先在客户端修复');}}
function commit(file,before,after){if(read(file)!==before)throw Error('客户端刚刚修改了配置，请刷新后重试');fs.mkdirSync(path.dirname(file),{recursive:true});let backup=null;if(before!==null){backup=file+'.yimu-backup-'+Date.now()+'-'+crypto.randomBytes(3).toString('hex');fs.writeFileSync(backup,before,{mode:0o600});}const temp=file+'.yimu-tmp';fs.writeFileSync(temp,after,{mode:0o600});if(read(file)!==before){fs.unlinkSync(temp);throw Error('配置有并发修改，未覆盖');}fs.renameSync(temp,file);return backup;}
function mergeJSON(text,entry){const d=json(text);if(d.mcpServers!==undefined&&(!d.mcpServers||Array.isArray(d.mcpServers)||typeof d.mcpServers!=='object'))throw Error('mcpServers 格式不正确，未覆盖');d.mcpServers ||= {};const old=d.mcpServers.yimucraft;if(old&&!String(JSON.stringify(old)).includes('agent-mcp.cjs'))throw Error('已有同名 yimucraft 配置，未覆盖');d.mcpServers.yimucraft=entry;return JSON.stringify(d,null,2)+'\n';}
function mergeHarness(text,entry){const yaml=require('js-yaml');let rows;try{rows=text?yaml.load(text):[];}catch{throw Error('Harness 配置含特殊 YAML 或脚本，请手动合并，未覆盖');}if(!Array.isArray(rows))throw Error('Harness 配置不是补丁列表，未覆盖');const row={insert:[{id:'yimucraft-mcp',name:'@deepseek-ai/dsh-mcp-client',config:{serverName:'yimucraft',transport:'stdio',...entry}}]};if(rows.some(r=>r.insert?.some(x=>x.id==='yimucraft-mcp'))){const old=rows.flatMap(r=>r.insert||[]).find(x=>x.id==='yimucraft-mcp');if(JSON.stringify(old)===JSON.stringify(row.insert[0]))return text;throw Error('Harness 已有同名配置，请先核对，未覆盖');}return (text||'').trimEnd()+'\n'+yaml.dump([row],{lineWidth:-1,noRefs:true});}
class ClientConnect{
 constructor({home,appData,entry,enable,env=process.env}){Object.assign(this,{home,appData,entry,enable,env});this.busy=false;}
 clients(){const h=this.home,a=this.appData;return [
  {id:'codex',name:'Codex',icon:'⌘',file:path.join(this.env.CODEX_HOME||path.join(h,'.codex'),'config.toml'),kind:'codex',cli:path.join(a,'npm/node_modules/@openai/codex/bin/codex.js')},
  {id:'claude-code',name:'Claude Code',icon:'✳',file:path.join(h,'.claude.json'),detect:path.join(h,'.claude'),kind:'json'},
  {id:'claude-desktop',name:'Claude Desktop',icon:'✳',file:path.join(a,'Claude/claude_desktop_config.json'),kind:'json'},
  {id:'cursor',name:'Cursor',icon:'↗',file:path.join(h,'.cursor/mcp.json'),kind:'json'},
  {id:'workbuddy',name:'WorkBuddy',icon:'W',file:path.join(h,'.workbuddy/mcp.json'),kind:'json'},
  {id:'kimi-code',name:'Kimi Code',icon:'K',file:path.join(this.env.KIMI_CODE_HOME||path.join(h,'.kimi-code'),'mcp.json'),kind:'json'},
  {id:'harness',name:'DeepSeek Harness',icon:'D',file:path.join(this.env.DSH_HOME||path.join(h,'.dsh'),'cordis.patch.yml'),kind:'harness'},
  {id:'qwen-code',name:'Qwen Code',file:path.join(h,'.qwen/settings.json'),kind:'json'}
 ];}
 list(){return this.clients().map(c=>{let configured=false,error=false;try{const text=read(c.file);configured=c.kind==='json'?!!json(text).mcpServers?.yimucraft:c.kind==='codex'?/\[mcp_servers\.(?:"yimucraft"|yimucraft)\]/.test(text||''):(text||'').includes('yimucraft-mcp');}catch{error=true;}return {id:c.id,name:c.name,icon:c.icon,detected:fs.existsSync(c.detect||path.dirname(c.file)),configured,error,file:c.file};});}
 async configure(id){if(this.busy)throw Error('正在配置客户端，请稍后');const c=this.clients().find(c=>c.id===id);if(!c)throw Error('未知客户端');if(!this.list().find(x=>x.id===id).detected)throw Error('未发现客户端配置目录，请先安装并启动一次');this.busy=true;let backup;
  try{const entry=this.entry();const before=read(c.file);
   if(c.kind==='codex'){
    if(!fs.existsSync(c.cli))throw Error('未找到 Codex CLI，暂不能自动写入');
    if(/\[mcp_servers\.(?:"yimucraft"|yimucraft)\]/.test(before||'')){
     const r=await run(process.execPath,[c.cli,'mcp','get','yimucraft','--json'],{env:{...this.env,ELECTRON_RUN_AS_NODE:'1'},windowsHide:true,timeout:20000,maxBuffer:1024*1024});
     const old=JSON.parse(r.stdout).transport;if(!JSON.stringify(old.args).includes('agent-mcp.cjs'))throw Error('已有其他同名配置，未覆盖');
    }
    if(before!==null){backup=c.file+'.yimu-backup-'+Date.now();fs.writeFileSync(backup,before,{mode:0o600});}
    try{await run(process.execPath,[c.cli,'mcp','add','yimucraft','--env','ELECTRON_RUN_AS_NODE=1','--',entry.command,...entry.args],{env:{...this.env,ELECTRON_RUN_AS_NODE:'1'},windowsHide:true,timeout:20000,maxBuffer:1024*1024});
     const r=await run(process.execPath,[c.cli,'mcp','get','yimucraft','--json'],{env:{...this.env,ELECTRON_RUN_AS_NODE:'1'},windowsHide:true,timeout:20000,maxBuffer:1024*1024});const t=JSON.parse(r.stdout).transport;if(t.command!==entry.command||JSON.stringify(t.args)!==JSON.stringify(entry.args))throw Error('mismatch');
    }catch{throw Error('Codex 配置或回读校验失败；原配置备份已保留');}
   }else{const after=c.kind==='harness'?mergeHarness(before,entry):mergeJSON(before,entry);backup=after===before?null:commit(c.file,before,after);}
   await this.enable();let verified=false;try{await this.probe(entry);verified=true;}catch{}
   return {id,file:c.file,backup,verified,message:verified?'配置已写入，一幕接口验证通过；请在客户端刷新 MCP 或重新启动。':'配置已写入，但接口验证失败；请检查一幕是否运行，再重新配置。'};
  }finally{this.busy=false;}
 }
 async probe(entry){const {Client}=require('@modelcontextprotocol/sdk/client/index.js'),{StdioClientTransport}=require('@modelcontextprotocol/sdk/client/stdio.js');const client=new Client({name:'yimucraft-connection-check',version:'1.0'}),transport=new StdioClientTransport({...entry,env:{...this.env,...entry.env},stderr:'pipe'});try{await client.connect(transport,{timeout:10000});const result=await client.callTool({name:'yimu_status',arguments:{}},undefined,{timeout:10000});if(result.isError)throw Error('连接失败');return true;}finally{await client.close();}}
}
module.exports={ClientConnect,mergeJSON,mergeHarness,commit,digest};
