const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

function baseUrl(value) {
  let url; try { url = new URL(String(value).trim()); } catch { throw Error('请输入完整的 API 地址'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) throw Error('远程 API 必须使用 HTTPS；本机服务可使用 HTTP');
  if (url.username || url.password || url.search || url.hash) throw Error('API 地址不能包含账号、密钥、查询参数或片段');
  if (/\/(chat\/completions|messages|responses)\/?$/.test(url.pathname)) throw Error('请填写基础地址（如 https://服务商/v1），不要填写生成端点');
  return url.href.replace(/\/+$/, '');
}
const clean = (value, max) => typeof value === 'string' && value.trim().length <= max && !/[\x00-\x1f]/.test(value) ? value.trim() : '';
class ModelService {
  constructor({file, vault, fetcher = fetch}) { this.file = file; this.vault = vault; this.fetcher = fetcher; this.busy = false; this.data = {providers: [], active: ''};
    if (fs.existsSync(file)) { this.data = JSON.parse(fs.readFileSync(file, 'utf8')); if (!Array.isArray(this.data.providers)) throw Error('模型配置损坏，请恢复备份'); }
  }
  persist(next) { fs.mkdirSync(path.dirname(this.file), {recursive:true}); fs.writeFileSync(this.file+'.tmp', JSON.stringify(next,null,2), {mode:0o600}); fs.renameSync(this.file+'.tmp', this.file); this.data = next; }
  info() { return {active:this.data.active, providers:this.data.providers.map(({secret,...p})=>({...p,hasKey:!!secret})), busy:this.busy}; }
  get(id) { const p=this.data.providers.find(p=>p.id===id); if (!p) throw Error('服务商不存在'); return p; }
  save(input) {
    if (this.busy) throw Error('请求进行中，请稍后保存');
    const old=input.id ? this.get(input.id) : null;
    const name=clean(input.name,80), model=clean(input.model,200), url=baseUrl(input.baseUrl);
    if (!name) throw Error('请填写服务商名称（最多 80 字）');
    if (!['openai','anthropic'].includes(input.protocol)) throw Error('请选择支持的接口协议');
    const key=clean(input.key||'',4096);
    if (input.key && !key) throw Error('API Key 格式无效');
    let secret=old?.secret||'';
    if (old && (old.baseUrl!==url || old.protocol!==input.protocol)) secret='';
    if (input.clearKey) secret='';
    if (key) { if (!this.vault.isEncryptionAvailable()) throw Error('系统加密不可用，未保存密钥'); secret=this.vault.encryptString(key).toString('base64'); }
    const p={id:old?.id||crypto.randomUUID(),name,model,baseUrl:url,protocol:input.protocol,secret,verifiedAt:0};
    if (old && old.baseUrl===url && old.protocol===p.protocol && old.model===model && old.secret===secret) p.verifiedAt=old.verifiedAt||0;
    const providers=this.data.providers.filter(x=>x.id!==p.id);providers.push(p);
    if (providers.length>30) throw Error('最多保存 30 个服务商');
    this.persist({providers,active:this.data.active||p.id});return {id:p.id,...this.info()};
  }
  select(id) { this.get(id);this.persist({...this.data,active:id});return this.info(); }
  remove(id) { if(this.busy)throw Error('请求进行中，请稍后删除');this.get(id);const providers=this.data.providers.filter(p=>p.id!==id);this.persist({providers,active:this.data.active===id?providers[0]?.id||'':this.data.active});return this.info(); }
  async request(id, kind, prompt) {
    if (this.busy) throw Error('已有模型请求进行中');
    const p=this.get(id);baseUrl(p.baseUrl);
    if(kind==='test'&&!p.model)throw Error('先选择或填写模型 ID');
    if(kind==='test'&&(typeof prompt!=='string'||!prompt.trim()||prompt.length>4000))throw Error('试用文字须为 1–4000 字');
    let key='';try {if(p.secret)key=this.vault.decryptString(Buffer.from(p.secret,'base64'));}catch{throw Error('密钥无法解密，请重新填写');}
    this.busy=true;const controller=new AbortController();this.controller=controller;const timer=setTimeout(()=>controller.abort(),45000);
    try {
      const headers={'Content-Type':'application/json'};
      if(p.protocol==='anthropic'){headers['anthropic-version']='2023-06-01';if(key)headers['x-api-key']=key;}else if(key) headers.Authorization='Bearer '+key;
      const endpoint=kind==='models'?'models':p.protocol==='anthropic'?'messages':'chat/completions';
      const body=kind==='models'?undefined:JSON.stringify({model:p.model,messages:[{role:'user',content:prompt}],max_tokens:256,stream:false});
      const response=await this.fetcher(p.baseUrl+'/'+endpoint,{method:body?'POST':'GET',headers,body,redirect:'error',signal:controller.signal});
      if(!response.ok){await response.body?.cancel();throw Error('HTTP '+response.status+({401:' · 密钥或鉴权方式不正确',403:' · 没有访问权限',404:' · 地址或模型不存在',429:' · 限流或额度不足'}[response.status]||' · 服务商请求失败'));}
      const reader=response.body.getReader();const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>2*1024*1024){await reader.cancel();throw Error('API 响应超过 2 MB');}chunks.push(Buffer.from(value));}
      let json;try{json=JSON.parse(Buffer.concat(chunks).toString());}catch{throw Error('API 返回的不是有效 JSON');}
      if(kind==='models'){if(!Array.isArray(json.data))throw Error('无法读取模型列表，请手动填写模型 ID');return {models:[...new Set(json.data.map(x=>clean(x.id,200)).filter(Boolean))].slice(0,1000)};}
      let text=p.protocol==='anthropic'?json.content?.filter(x=>x.type==='text').map(x=>x.text).join('\n'):json.choices?.[0]?.message?.content;
      if(typeof text!=='string'||!text.trim())throw Error('请求已完成但没有文本回复；请检查模型和协议');
      if(key)text=text.split(key).join('[密钥已隐藏]');
      const verifiedAt=Date.now();this.persist({...this.data,providers:this.data.providers.map(x=>x.id===id?{...x,verifiedAt}:x)});
      return {text:text.slice(0,16000),verifiedAt};
    } catch(error) { if(kind==='test')this.persist({...this.data,providers:this.data.providers.map(x=>x.id===id?{...x,verifiedAt:0}:x)}); if(controller.signal.aborted)throw Error('请求已取消或超过 45 秒；服务商可能仍计费');if(error.message.startsWith('HTTP ')||/API |模型|文本回复/.test(error.message))throw error;throw Error('连接失败，请检查 API 地址、网络和接口协议'); }
    finally {clearTimeout(timer);this.busy=false;this.controller=null;}
  }
  cancel() {this.controller?.abort();}
}
module.exports={ModelService,baseUrl};
