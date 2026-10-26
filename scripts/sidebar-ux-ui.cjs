const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {electron}=require('./test-app.cjs'),close=require('./close-test-app.cjs');
const root=path.resolve('work','sidebar-ux-'+Date.now()),out=path.resolve('evidence/sidebar-ux-20261023',path.basename(root));fs.mkdirSync(root,{recursive:true});fs.mkdirSync(out,{recursive:true});
const report={root,out,executable:process.env.YIMU_TEST_EXE||'source',checks:[],errors:[]};
(async()=>{let app;
try{
 const {Library}=require('../src/library.cjs'),lib=new Library(path.join(root,'db'));
 const parent=await lib.createFolder('','父级文件夹');const child=await lib.createFolder(parent.path,'子级文件夹');await lib.createFolder(child.path,'孙级文件夹');const sibling=await lib.createFolder('','同级文件夹');lib.close();
 const env={...process.env,YIMU_DATA_DIR:path.join(root,'db')};delete env.ELECTRON_RUN_AS_NODE;
 const launch=async()=>{app=await electron.launch({...(process.env.YIMU_TEST_EXE?{executablePath:process.env.YIMU_TEST_EXE,args:[]}:{args:['.']}),cwd:process.cwd(),env});const p=await app.firstWindow();p.setDefaultTimeout(30000);p.on('pageerror',e=>report.errors.push(e.message));await p.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('就绪'));return p;};
 let page=await launch();
 await page.waitForFunction(()=>document.querySelectorAll('#folders .folder-row').length===4);
 report.rowsExpanded=await page.locator('#folders .folder-row').count();

 // Removed top filter/section labels and the freed sidebar height.
 const removed=await page.evaluate(()=>['unclassified','typeShortcuts','collections','addCollection'].filter(id=>document.getElementById(id)));
 assert.deepEqual(removed,[]);
 const labels=await page.evaluate(()=>[...document.querySelectorAll('.sidebar>.section-label')].map(e=>e.childNodes[0].textContent.trim()));
 assert.equal(labels.length,1);
 assert.equal(labels[0],'文件夹');
 const names=await page.evaluate(()=>[...document.querySelectorAll('#folders .folder')].map(e=>e.querySelector('span:not(.tree-icon):not(.folder-count)')?.textContent));
 assert.deepEqual(names,['父级文件夹','子级文件夹','孙级文件夹','同级文件夹']);
 const foldersBox=await page.locator('#folders').boundingBox();report.foldersHeight=Math.round(foldersBox.height);
 assert.ok(foldersBox.height>600,'folder pane should receive the freed sidebar height');
 report.checks.push('sidebar keeps only 全部素材 and 文件夹; 未分类/类型/分类 labels and collection list removed; folder pane '+report.foldersHeight+'px');

 // Intercept native menus so the real template can be inspected and invoked.
 await app.evaluate(({Menu})=>{const build=Menu.buildFromTemplate.bind(Menu);Menu.buildFromTemplate=template=>{const menu=build(template);menu.popup=()=>{globalThis.__lastMenu=menu;};return menu;};});
 const menuLabels=()=>app.evaluate(()=>globalThis.__lastMenu.items.map(i=>i.type==='separator'?'-':i.label));
 const choose=label=>app.evaluate((_,label)=>{const item=globalThis.__lastMenu.items.find(i=>i.label===label);if(!item)throw Error('menu item missing: '+label);item.click();},label);
 const waitMenu=async()=>{for(let i=0;i<120;i++){if(await app.evaluate(()=>!!globalThis.__lastMenu))return;await new Promise(r=>setTimeout(r,50));}throw Error('native menu was not captured');};
 const openBlankMenu=async()=>{await app.evaluate(()=>{globalThis.__lastMenu=null;});await page.locator('#folders').click({button:'right',position:{x:120,y:Math.min(300,foldersBox.height-20)}});await waitMenu();};
 await openBlankMenu();
 const blankMenu=await menuLabels();report.blankMenu=blankMenu;
 assert.deepEqual(blankMenu,['展开全部文件夹','折叠全部文件夹','-','新建文件夹']);
 await choose('折叠全部文件夹');
 await page.waitForFunction(()=>state.collapsed.size===2&&document.querySelectorAll('#folders .folder-row').length===2);
 report.rowsCollapsed=await page.locator('#folders .folder-row').count();
 await openBlankMenu();
 await choose('展开全部文件夹');
 await page.waitForFunction(()=>state.collapsed.size===0&&document.querySelectorAll('#folders .folder-row').length===4);
 report.rowsReopened=await page.locator('#folders .folder-row').count();
 await page.screenshot({path:path.join(out,'sidebar-folders.png')});
 report.checks.push('blank-area context menu collapses all folders in one click (4→2 rows) and expands all (2→4 rows)');

 // Folder-row context menu keeps its previous entries.
 await app.evaluate(()=>{globalThis.__lastMenu=null;});
 await page.locator('#folders .folder').last().click({button:'right'});
 await waitMenu();
 const rowMenu=await menuLabels();report.rowMenu=rowMenu;
 assert.deepEqual(rowMenu,['新建文件夹','-','重命名','图标与颜色…','在资源管理器中显示','-','移动到…','重新定位…','删除空文件夹']);
 report.checks.push('folder-row context menu unchanged');

 // Model quick switch: two local fixtures, persisted across reload.
 const saved=await page.evaluate(async()=>{const a=await window.yimu.command('modelSave',{name:'测试甲',baseUrl:'http://127.0.0.1:9/v1',protocol:'openai',model:'model-alpha'});const b=await window.yimu.command('modelSave',{name:'测试乙',baseUrl:'http://127.0.0.1:9/v1',protocol:'openai',model:'model-beta'});return {a:a.id,b:b.id};});
 await page.reload();
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('就绪'));
 await page.waitForFunction(()=>{const s=document.querySelector('#modelQuickSwitch');return s&&!s.hidden&&s.options.length===2;});
 const style=await page.evaluate(()=>{const el=document.getElementById('modelQuickSwitch'),s=getComputedStyle(el),box=el.getBoundingClientRect();return {region:s.getPropertyValue('-webkit-app-region'),appearance:s.appearance,backgroundImage:s.backgroundImage,backgroundPosition:s.backgroundPosition,backgroundSize:s.backgroundSize,paddingRight:s.paddingRight,width:box.width,height:box.height,hit:document.elementFromPoint(box.x+box.width-12,box.y+box.height/2)?.id};});
 report.quickSwitchStyle=style;
 assert.equal(style.region,'no-drag','header drag region must not swallow the select');
 assert.match(style.backgroundImage,/svg/);
 assert.equal(style.paddingRight,'30px');
 assert.equal(style.hit,'modelQuickSwitch');
 assert.ok(style.width>=120&&style.height>=24);
 const box=await page.locator('#modelQuickSwitch').boundingBox();
 await page.evaluate(()=>{window.__switchDown=0;document.getElementById('modelQuickSwitch').addEventListener('mousedown',()=>window.__switchDown++);});
 await page.mouse.click(box.x+box.width-10,box.y+box.height/2);
 await page.waitForTimeout(300);
 const opened=await page.evaluate(()=>({down:window.__switchDown,open:document.getElementById('modelQuickSwitch').matches(':open'),focus:document.activeElement?.id}));
 report.quickSwitchClick=opened;
 assert.equal(opened.down,1,'click must reach the select inside the drag region');
 assert.equal(opened.open,true,'clicking the arrow must open the model picker');
 assert.equal(opened.focus,'modelQuickSwitch');
 await page.keyboard.press('Escape');
 await page.locator('#modelQuickSwitch').selectOption(saved.b);
 await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('当前模型'));
 const active=await page.evaluate(()=>window.yimu.command('modelInfo').then(i=>i.active));
 assert.equal(active,saved.b);
 await page.locator('#appBar').screenshot({path:path.join(out,'model-quick-switch.png')});
 await page.screenshot({path:path.join(out,'main.png')});
 report.checks.push('header model select is no-drag, keeps a 30px right inset for its 10px-inset chevron, and switching persists to the selected provider');

 assert.deepEqual(report.errors,[]);report.passed=true;await close(app);app=null;
}catch(e){report.passed=false;report.error=e.stack;process.exitCode=1;}finally{await close(app).catch(()=>{});fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}})();
