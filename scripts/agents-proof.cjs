const fs=require('fs'),path=require('path'),crypto=require('crypto'),asar=require('@electron/asar');
const out='evidence/agents-models-20261023',read=name=>fs.readFileSync(path.join(out,name),'utf8').split('\n').filter(Boolean).map(JSON.parse);
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const original=asar.extractFile(path.join(process.env.LOCALAPPDATA,'Programs/WorkBuddy/resources/app.asar'),'cli\\dist\\codebuddy-lite-wb.mjs');
const w=read('workbuddy-settings.jsonl'),k=read('1792765139567/kimi.jsonl'),h=read('harness-search-key.jsonl');
const wc=w.flatMap(r=>r.message?.content||[]).filter(c=>c.type==='tool_use');
const wr=w.flatMap(r=>r.message?.content||[]).filter(c=>c.type==='tool_result').flatMap(c=>c.content||[]).find(c=>c.text?.includes('"libraryId"'));
const report={workbuddyInstalledEngineIdentical:hash(original)===hash(fs.readFileSync('work/workbuddy-runtime/cli/dist/codebuddy-lite-wb.mjs')),engineHash:hash(original),workbuddyCalls:wc,workbuddySearch:JSON.parse(wr.text),harnessCall:h.find(r=>r.type==='tool_call'),kimiCalls:k.find(r=>r.tool_calls).tool_calls};
report.workbuddySearch.items=report.workbuddySearch.items.map(({id,name})=>({id,name}));
const cat=JSON.parse(fs.readFileSync(path.join(process.env.APPDATA,'Nomi/model-catalog.json'),'utf8'));const decrypt=require('../src/model-nomi-secret.cjs').decryptNomi;
const secrets=['kimi','kimi-code','minimax'].map(x=>decrypt(process.env.USERPROFILE,cat.apiKeysByVendor[x].apiKey));const ce=JSON.parse(fs.readFileSync(path.join(process.env.USERPROFILE,'.claude/settings.json'),'utf8')).env;secrets.push(ce.ANTHROPIC_AUTH_TOKEN||ce.ANTHROPIC_API_KEY);
report.secretMatches=[];for(const dir of [out,'src','scripts','tests'])for(const f of fs.readdirSync(dir,{recursive:true})){const full=path.join(dir,f);if(!fs.statSync(full).isFile()||! /\.(jsonl?|log|txt|md|cjs|js|html|toml)$/.test(f))continue;const text=fs.readFileSync(full,'utf8');if(secrets.some(s=>s&&text.includes(s)))report.secretMatches.push(full);}
fs.writeFileSync(path.join(out,'host-proof.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({engineIdentical:report.workbuddyInstalledEngineIdentical,workbuddySearch:report.workbuddySearch,secretMatches:report.secretMatches}));
