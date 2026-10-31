// Records hashes/counts only. Never prints credentials, names or model settings.
const fs=require('fs'),path=require('path'),crypto=require('crypto'),{DatabaseSync}=require('node:sqlite');
const folder=path.join(process.env.APPDATA,'YimuCraft');
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const files=['library-config.json','preferences.json','model-providers.json','agent/settings.json'];
const config=JSON.parse(fs.readFileSync(path.join(folder,'library-config.json'),'utf8'));
const db=new DatabaseSync(path.join(config.library,'library.sqlite'),{readOnly:true});
const tables=db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r=>r.name);
const result={files:{},tables:{}};
for(const file of files){const p=path.join(folder,file);if(fs.existsSync(p))result.files[file]=hash(fs.readFileSync(p));}
for(const name of ['assets','collections','asset_collections','folder_preferences'].filter(t=>tables.includes(t))){const rows=db.prepare('SELECT * FROM '+name).all();const serialized=rows.map(r=>JSON.stringify(r)).sort();result.tables[name]={count:rows.length,sha256:hash(serialized.join('\n'))};}
db.close();fs.writeFileSync(process.argv[2],JSON.stringify(result,null,2));console.log(JSON.stringify({report:process.argv[2],counts:Object.fromEntries(Object.entries(result.tables).map(([name,v])=>[name,v.count]))}));
