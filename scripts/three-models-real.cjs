const fs=require('fs'),path=require('path'),{electron}=require('./test-app.cjs'),close=require('./close-test-app.cjs');
const out=path.resolve('evidence/agents-models-20261023/models-'+Date.now());fs.mkdirSync(out,{recursive:true});
(async()=>{let app;const report={out,results:[]};try{
 const env={...process.env};if(!process.env.YIMU_FORMAL)env.YIMU_DATA_DIR=path.resolve('work/three-models-'+Date.now());else delete env.YIMU_DATA_DIR;delete env.ELECTRON_RUN_AS_NODE;
 const launch=()=>electron.launch({...process.env.YIMU_TEST_EXE?{executablePath:process.env.YIMU_TEST_EXE,args:[]}:{args:['.']},env});
 app=await launch();const p=await app.firstWindow();await p.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('就绪'));
 await p.locator('#modelsEntry').click();
 for(const provider of ['deepseek','kimi','minimax']){
  await p.locator('[data-provider="'+provider+'"]').click();await p.waitForFunction(()=>!document.querySelector('#modelTest').disabled);
  await p.locator('#modelPrompt').fill('计算 137 + 286，只输出结果数字。');const started=Date.now();await p.locator('#modelTest').click();await p.waitForFunction(()=>!document.querySelector('#modelTest').disabled,{},{timeout:60000});
  const r={provider,model:await p.locator('#modelId').inputValue(),reply:await p.locator('#modelReply').textContent(),feedback:await p.locator('#modelsFeedback').textContent(),elapsed:Date.now()-started};report.results.push(r);
 }
 await p.locator('#modelsClose').click();const info=await p.evaluate(()=>window.yimu.command('modelInfo'));for(const x of info.providers){await p.locator('#modelQuickSwitch').selectOption(x.id);await p.waitForFunction(id=>document.querySelector('#modelQuickSwitch').value===id,x.id);}
 await p.locator('#modelQuickSwitch').selectOption(info.providers.find(x=>x.model==='deepseek-v4-pro').id);
 await p.screenshot({path:path.join(out,'toolbar.png')});report.info=await p.evaluate(()=>window.yimu.command('modelInfo'));
 await p.locator('#modelsEntry').click();await p.locator('#modelsDialog').evaluate(e=>e.scrollTop=0);report.logos=await p.locator('#providerPresets img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0));await p.locator('#modelsDialog').screenshot({path:path.join(out,'models.png')});await p.locator('#modelsAgent').click();report.clientLogos=await p.locator('#clientCards img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0));await p.locator('#agentDialog').screenshot({path:path.join(out,'clients.png')});
 await close(app);app=null;app=await launch();const p2=await app.firstWindow();await p2.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('就绪'));report.restart=await p2.evaluate(()=>window.yimu.command('modelInfo'));report.passed=report.results.every(r=>r.reply.includes('423'))&&report.info.active===report.restart.active&&report.logos&&report.clientLogos;
 }catch(e){report.error=e.message;}finally{await close(app);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}})();
