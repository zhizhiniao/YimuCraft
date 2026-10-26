const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {createCanvas}=require('@napi-rs/canvas'),{Library}=require('../src/library.cjs'),{Semantic,REVISION}=require('../src/semantic.cjs');
const root=fs.mkdtempSync(path.resolve('work/review-ai-')),models=process.env.YIMU_MODEL_DIR||path.join(process.env.APPDATA,'YimuCraft','models');
const report={root,models,revision:REVISION,checks:[]};let lib,engine;
(async()=>{try{
 const source=path.join(root,'source');fs.mkdirSync(source);const canvas=createCanvas(64,64),ctx=canvas.getContext('2d');ctx.fillStyle='#ff0000';ctx.fillRect(0,0,64,64);fs.writeFileSync(path.join(source,'red.png'),canvas.toBuffer('image/png'));
 lib=new Library(path.join(root,'library'));await lib.importManaged([source]);engine=new Semantic(models);assert.equal(engine.status(lib).installed,true);
 const indexed=await engine.index(lib);assert.equal(indexed.errors.length,0);assert.equal(engine.status(lib).indexed,1);
 const found=await engine.search(lib,{text:'红色'});assert.equal(found.ids.length,1);report.checks.push('pinned local Chinese-CLIP decodes PNG, infers embeddings, persists and searches');
 await engine.dispose();lib.close();lib=null;fs.renameSync(source,source+'-offline');
 lib=new Library(path.join(root,'library'));engine=new Semantic(models);assert.equal(engine.status(lib).indexed,1);const after=await engine.search(lib,{text:'红色'});assert.deepEqual(after.ids,found.ids);report.checks.push('local-only model reload and persisted index work after source offline and library reopen');
 report.passed=true;
 }catch(e){report.passed=false;report.error=e.stack;process.exitCode=1;}finally{await engine?.dispose();lib?.close();fs.writeFileSync('evidence/engineering-review-20261023-r1/ai-local.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
})().catch(e=>{console.error(e);process.exitCode=1;});
