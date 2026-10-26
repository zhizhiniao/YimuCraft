const fs=require('node:fs'),path=require('node:path');
function localClaude(home){
 const file=path.join(home,'.claude/settings.json');if(!fs.existsSync(file))return null;
 let env;try{env=JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'')).env;}catch{return null;}
 if(!env)return null;const key=env.ANTHROPIC_API_KEY||env.ANTHROPIC_AUTH_TOKEN;if(typeof key!=='string'||!key.trim())return null;
 let url;try{url=new URL(env.ANTHROPIC_BASE_URL||'https://api.anthropic.com');}catch{return null;}
 const providers={'api.anthropic.com':['anthropic','Anthropic'],'api.deepseek.com':['deepseek','DeepSeek'],'api.moonshot.cn':['kimi','Kimi'],'api.moonshot.ai':['kimi','Kimi']};
 const provider=providers[url.hostname];if(!provider||url.protocol!=='https:'||url.port||url.username||url.password||url.search||url.hash)return null;
 let baseUrl=url.href.replace(/\/+$/,'');if(!baseUrl.endsWith('/v1'))baseUrl+='/v1';
 return {source:'claude-code',provider:provider[0],name:provider[1]+'（本机 Claude Code）',baseUrl,protocol:'anthropic',model:env.ANTHROPIC_MODEL||env.ANTHROPIC_DEFAULT_SONNET_MODEL||'',key};
}
function nomi(home,includeSecret=false,vault){
 let data;try{data=JSON.parse(fs.readFileSync(path.join(home,'AppData/Roaming/Nomi/model-catalog.json'),'utf8'));}catch{return [];}
 const rows=[];
 for(const [provider,model,hosts] of [['kimi','kimi-k3',['api.moonshot.cn','api.moonshot.ai']],['minimax','MiniMax-M3',['api.minimax.cn','api.minimaxi.com','api.minimax.io']]]){
  const vendor=data.vendors?.find(v=>v.key===provider),record=data.apiKeysByVendor?.[provider];
  if(!vendor||record?.enc!=='safeStorage'||!record.apiKey)continue;
  let url;try{url=new URL(vendor.baseUrlHint);}catch{continue;}
  if(!hosts.includes(url.hostname)||url.protocol!=='https:'||url.port||url.username||url.password||url.search||url.hash||!['','/','/v1'].includes(url.pathname))continue;
  const p={source:'nomi-'+provider,provider,name:(provider==='kimi'?'Kimi':'MiniMax')+'（本机 Nomi）',baseUrl:url.origin+'/v1',protocol:'openai',model};
  if(includeSecret){p.key=require('./model-nomi-secret.cjs').decryptNomi(home,record.apiKey);if(!p.key)continue;}
  rows.push(p);
 }return rows;
}
function discover(home){const p=localClaude(home);return [...(p?[(({key,...safe})=>safe)(p)]:[]),...nomi(home)];}
function importLocal(home,service,source){const p=source==='claude-code'?localClaude(home):nomi(home,true,service.vault).find(p=>p.source===source);if(!p)throw Error('未找到可复用的官方 API 配置；登录订阅不能当作 API Key 导入');const existing=service.info().providers.find(x=>x.baseUrl===p.baseUrl&&x.protocol===p.protocol&&x.model===p.model);return service.save({...p,id:existing?.id});}
module.exports={discover,importLocal};
