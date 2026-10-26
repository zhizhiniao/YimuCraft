// User-authorized connection using the installed client's documented API field.
const fs=require('fs'),path=require('path'),{decryptNomi}=require('../src/model-nomi-secret.cjs');
const home=process.env.USERPROFILE,file=path.join(home,'.kimi-code/config.toml'),before=fs.readFileSync(file,'utf8');
if(before.includes('[providers.yimu_kimi]'))throw Error('Existing provider requires review');
const catalog=JSON.parse(fs.readFileSync(path.join(process.env.APPDATA,'Nomi/model-catalog.json'),'utf8'));
const key=decryptNomi(home,catalog.apiKeysByVendor.kimi.apiKey);
const next=before.replace(/^default_model\s*=.*$/m,'default_model = "yimu/kimi-k3"')+'\n[providers.yimu_kimi]\ntype = "kimi"\nbase_url = "https://api.moonshot.cn/v1"\napi_key = '+JSON.stringify(key)+'\n[models."yimu/kimi-k3"]\nprovider = "yimu_kimi"\nmodel = "kimi-k3"\nmax_context_size = 262144\ncapabilities = ["thinking", "tool_use"]\ndisplay_name = "Kimi K3 · 已有开放平台 API"\n[[permission.rules]]\ndecision = "allow"\npattern = "mcp__yimucraft__yimu_search"\n';
const backup=file+'.yimu-backup-'+Date.now();fs.copyFileSync(file,backup);if(fs.readFileSync(file,'utf8')!==before)throw Error('Configuration changed concurrently');fs.writeFileSync(file,next,{mode:0o600});console.log(JSON.stringify({configured:true,model:'kimi-k3',backup,credentialFormat:'client-native api_key; not copied into evidence'}));
