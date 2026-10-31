// Read-only validation of the installed UI against the immediate pre-upgrade canvas snapshot.
const {electron}=require('./test-app.cjs'),close=require('./close-test-app.cjs'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const run=path.resolve('work/canvas-groups-live-'+Date.now());fs.mkdirSync(run,{recursive:true});
(async()=>{let app,page;const report={run,errors:[]};try{
 const env={...process.env};delete env.ELECTRON_RUN_AS_NODE;delete env.YIMU_DATA_DIR;
 app=await electron.launch({executablePath:process.env.YIMU_TEST_EXE,args:[],env});page=await app.firstWindow();page.on('pageerror',e=>report.errors.push(e.message));
 const before=JSON.parse(fs.readFileSync(process.argv[2]));await page.locator('#canvasTab').waitFor();report.previousWorkspace=before.workspace;if(before.workspace==='library'){assert.equal(await page.locator('#canvasTab').getAttribute('aria-selected'),'false');await page.locator('#canvasTab').click();}
 await page.waitForSelector('#projectCanvas:not([hidden])[data-ready=true]',{timeout:120000});report.version=await page.locator('#appVersion').innerText();assert.ok(report.version.includes(require('../package.json').version));report.profile=await app.evaluate(({app})=>app.getPath('userData'));
 const b=await page.evaluate(async()=>{const l=await yimuCanvas.command('list');return yimuCanvas.command('refresh',l.active);});
 const previous=before.boards.find(i=>i.id===b.id);assert.ok(previous);
 for(const i of Object.values(previous.items)){assert.ok(b.items[i.id]);for(const key of ['x','y','width','height','status','hiddenAt','parentId','text','collapsed','admitted'])assert.equal(b.items[i.id][key],i[key],i.id+':'+key);assert.deepEqual(b.items[i.id].tags,i.tags);}
 assert.deepEqual(b.links,previous.links);report.retainedRecords=Object.keys(previous.items).length;report.root=b.root;assert.equal(await page.locator('#canvasFilter:visible,#canvasSelect,#canvasPan,#canvasConnect').count(),0);
 await page.waitForFunction(()=>{const s=document.querySelector('#canvasStage').getBoundingClientRect();return [...document.querySelectorAll('.canvas-card img')].some(i=>{const r=i.getBoundingClientRect();return i.complete&&i.naturalWidth>0&&r.left>s.left&&r.right<s.right-55&&r.top>s.top&&r.bottom<s.bottom-100;});},null,{timeout:60000});
 const id=await page.evaluate(()=>{const s=document.querySelector('#canvasStage').getBoundingClientRect();for(const i of document.querySelectorAll('.canvas-card img')){const r=i.getBoundingClientRect();if(i.naturalWidth&&r.left>s.left&&r.right<s.right-55&&r.top>s.top&&r.bottom<s.bottom-100)return i.closest('.canvas-card').dataset.id;}}),card=page.locator('.canvas-card[data-id="'+id+'"]');
 await card.click();let r=await card.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);assert.equal(await page.locator('.canvas-port:visible').count(),0);
 await page.mouse.move(r.x+r.width+18,r.y+r.height*.6);await page.locator('.canvas-port:visible').waitFor();assert.equal(await page.locator('.canvas-port:visible').count(),1);report.visiblePorts=1;await page.screenshot({path:path.join(run,'project.png')});
 await card.click({button:'right'});report.menu=await page.locator('.canvas-context [role=menuitem]').allTextContents();assert.ok(report.menu.includes('复制文件路径'));assert.ok(!report.menu.includes('管理标签…'));await page.screenshot({path:path.join(run,'menu.png')});await page.keyboard.press('Escape');
 assert.deepEqual(report.errors,[]);report.ok=true;
 }catch(e){report.error=e.stack;if(page)await page.screenshot({path:path.join(run,'failure.png')}).catch(()=>{});}finally{if(app)await close(app).catch(()=>{});}
 fs.writeFileSync(path.join(run,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exit(report.ok?0:1);
})();
