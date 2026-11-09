// Read the normal installed profile and show the new page; never add user candidates.
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const run=path.resolve(process.argv[2]||'output/playwright/discovery-install-20261106-r01');
(async()=>{const report={run};try{
 const browser=await chromium.connectOverCDP('http://127.0.0.1:9354');const page=browser.contexts()[0].pages().find(p=>p.url().includes('index.html'));if(!page)throw Error('Installed app page missing');
 await page.locator('#discoveryTab').waitFor();report.version=await page.locator('#appVersion').innerText();assert.match(report.version,/0\.7\.72/);
 await page.locator('#discoveryTab').click();await page.waitForSelector('#canvasDiscovery:not([hidden])');await page.waitForFunction(()=>document.querySelectorAll('.discovery-card').length>0,null,{timeout:60000});
 await page.getByRole('button',{name:'图片',exact:true}).click();
 await page.waitForFunction(()=>[...document.querySelectorAll('.discovery-card img')].some(i=>i.complete&&i.naturalWidth>0),null,{timeout:60000});
 await page.evaluate(()=>yimuCanvas.command('list'));const before=JSON.parse(fs.readFileSync(path.join(run,'projects-before.json'))),after=JSON.parse(fs.readFileSync(path.join(process.env.APPDATA,'YimuCraft/project-canvases/projects.json')));
 report.preservedItems=0;report.preservedBoards=0;report.sourceDimensionUpdates=[];
 for(const old of before.boards){const current=after.boards.find(b=>b.id===old.id);assert.ok(current);report.preservedBoards++;assert.deepEqual(current.viewport,old.viewport);for(const [id,item]of Object.entries(old.items)){assert.ok(current.items[id]);for(const key of ['x','y','width','height','parentId','tags','status','hiddenAt','admitted']){const next=current.items[id];if(['width','height'].includes(key)&&next[key]!==item[key]&&item.sizeMode==='intrinsic'&&next.modified!==item.modified){assert.equal(next[key],require('../src/canvas-media.cjs').fitted(next)[key]);report.sourceDimensionUpdates.push({id,field:key,before:item[key],after:next[key]});}else assert.deepEqual(next[key],item[key]);}report.preservedItems++;}}
 report.resultCount=await page.locator('.discovery-result-tools strong').innerText();report.drawnCards=await page.locator('.discovery-card').count();report.pageVisible=await page.locator('#canvasDiscovery').isVisible();report.workspace=after.workspace;report.activeProjectUnchanged=before.active===after.active;assert.ok(report.activeProjectUnchanged);assert.equal(after.workspace,'discovery');
 await page.screenshot({path:path.join(run,'installed-live.png')});report.ok=true;
 }catch(e){report.error=e.stack;process.exitCode=1;}finally{fs.writeFileSync(path.join(run,'live.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));process.exit(report.ok?0:1);}})();
