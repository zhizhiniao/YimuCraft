const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {DatabaseSync} = require('node:sqlite');
const {electron} = require('./test-app.cjs');
const close = require('./close-test-app.cjs');
const {Library} = require('../src/library.cjs');
const {attach} = require('../src/existing-library.cjs');

const run = fs.mkdtempSync(path.resolve('work/folder-tree-ui-'));
const profile = path.join(run, 'index');
const linked = path.join(run, '示例.library');
const sourceName = '526种AE内置插件效果';
const parentName = 'AE预设';
const childName = '光效';
const root = path.join(linked, 'source');
const source = path.join(root, sourceName), target = path.join(root, parentName);
const child = path.join(source, childName);
const dbFile = path.join(linked, 'data', 'aetodo.db');
const report = {run, checks:[], errors:[]};
let app, page;

async function fixture() {
  fs.mkdirSync(path.dirname(dbFile), {recursive:true});
  const db = new DatabaseSync(dbFile);
  db.exec("CREATE TABLE ae_tree(id,pid,title); CREATE TABLE ae_tag(id,title); CREATE TABLE ae_tag_relation(source_id,tag_id); CREATE TABLE ae_tree_relation(source_id,term_id); CREATE TABLE ae_source(id,uuid,termId,filename,ext,filetype,star,favorite,ctime,mtime,isDeleted,tag,url,note,atime);");
  const folders = [source, child, target];
  for (const [i, folder] of folders.entries()) {
    fs.mkdirSync(folder, {recursive:true});
    fs.writeFileSync(path.join(folder, '预设.ffx'), 'fx-'+i);
    db.prepare('INSERT INTO ae_tree VALUES(?,?,?)').run(i+1,i===1?1:0,path.basename(folder));
    db.prepare("INSERT INTO ae_source VALUES(?,?,?,'预设','ffx','ffx',0,0,1,1,0,'[]','','',1)").run(i+1,'fixture-'+i,i+1);
  }
  db.close();
  const lib = new Library(profile);
  try {
    await attach(lib,linked);
    lib.setFolderAppearance(target,{icon:'type-ae',color:'#759cde'});
    lib.db.exec('DROP TABLE folder_tree_names; DROP TABLE folder_tree_parents; PRAGMA user_version=2');
  } finally {lib.close();}
}

async function launch() {
  const env = {...process.env,YIMU_DATA_DIR:profile,YIMU_AE_CONNECTION_FILE:path.join(run,'ae.json'),YIMU_PR_BRIDGE_DIR:path.join(run,'pr')};
  delete env.ELECTRON_RUN_AS_NODE;
  const executablePath=process.env.YIMU_TEST_EXE;
  app=await electron.launch({...(executablePath?{executablePath,args:[]}:{args:['.']}), env});
  page=await app.firstWindow();
  page.on('pageerror',e=>report.errors.push(e.message));
  await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('就绪'));
}

const button = folder => page.locator('#folders').getByTitle(folder,{exact:true});
async function mouseDrag(from,to,beforeUp) {
  const rect=await from.boundingBox(), dest=await to.boundingBox();
  assert.ok(rect && dest);
  await page.mouse.move(rect.x+rect.width/2,rect.y+rect.height/2);
  await page.mouse.down();
  await page.mouse.move(dest.x+dest.width/2,dest.y+dest.height/2,{steps:12});
  if (beforeUp) await beforeUp();
  await page.mouse.up();
}
const rows = folder => button(folder).locator('..');
async function depth(folder) {
  return rows(folder).evaluate(row=>row.style.paddingLeft);
}
async function nested() {
  await page.waitForFunction(([source,target])=> {
    const rows=[...document.querySelectorAll('#folders .folder')];
    const childRow=rows.find(n=>n.title===source)?.parentElement;
    const targetRow=rows.find(n=>n.title===target)?.parentElement;
    return childRow && targetRow && parseInt(childRow.style.paddingLeft)>parseInt(targetRow.style.paddingLeft);
  },[source,target]);
}

// Exercise the real row's context menu. Select its native action without opening an OS popup in CI.
async function renameMenu(folder,activate=true) {
  await app.evaluate(({Menu})=>{
    const original=Menu.buildFromTemplate;
    globalThis.folderRenameMenu=null;
    Menu.buildFromTemplate=function(template){
      Menu.buildFromTemplate=original;
      const menu=original.call(Menu,template);
      menu.popup=({callback})=>{
        const item=menu.items.find(item=>item.label==='重命名');
        globalThis.folderRenameMenu={enabled:item.enabled,choose:()=>{item.click();callback();},cancel:callback};
      };
      return menu;
    };
  });
  await button(folder).click({button:'right'});
  const enabled=await app.evaluate(async()=>{
    for(let i=0;i<40 && !globalThis.folderRenameMenu;i++)await new Promise(resolve=>setTimeout(resolve,25));
    return globalThis.folderRenameMenu.enabled;
  });
  if(activate){assert.ok(enabled);await app.evaluate(()=>globalThis.folderRenameMenu.choose());}
  else await app.evaluate(()=>globalThis.folderRenameMenu.cancel());
  return enabled;
}

(async()=>{
  try {
    await fixture();
    const original=fs.readFileSync(dbFile);
    await launch();
    assert.equal(await depth(source),await depth(target));
    if (process.env.YIMU_EXPECT_NO_FOLDER_RENAME) {
      assert.equal(await renameMenu(source,false),false);
      report.checks.push('0.7.73 disables Rename for a connected source folder');
    } else if (process.env.YIMU_EXPECT_NO_FOLDER_DRAG) {
      await mouseDrag(button(source).locator('span').filter({hasText:sourceName}),button(target));
      assert.equal(await depth(source),await depth(target));
      report.checks.push('0.7.72 same mouse gesture leaves both at root');
    } else {
      await mouseDrag(button(source).locator('.folder-icon'),button(target),async()=>{
      await page.waitForFunction(folder=>document.querySelector('.folder-drop-target .folder')?.title===folder,target);
        await page.screenshot({path:path.join(run,'hover.png')});
      });
      await nested();
      assert.equal(await page.locator('dialog[open]').count(),0);
      assert.equal(await button(target).locator('.folder-count').textContent(),'3');
      const heading=await page.locator('.folder-heading').boundingBox();
      const lastRow=await page.locator('#folders .folder-row').last().boundingBox();
      await page.screenshot({path:path.join(run,'organized-tree.png'),clip:{
        x:heading.x,y:heading.y,width:heading.width,height:lastRow.y+lastRow.height-heading.y
      }});
      report.checks.push('drag by icon into AE预设, keeps subtree and updates parent count');
      await button(target).click();
      await page.locator('#filterToggle').click();
      await page.locator('#recursive').check();
      await page.waitForFunction(()=>document.querySelector('#resultCount').textContent==='3 项');
      await page.locator('#recursive').uncheck();
      await page.waitForFunction(()=>document.querySelector('#resultCount').textContent==='1 项');
      await page.screenshot({path:path.join(run,'moved.png')});
      report.checks.push('parent filter shows 3 recursive assets and 1 direct asset');
      await close(app);app=null;await launch();await nested();
      report.checks.push('complete process restart retains the organized tree');
      await mouseDrag(button(target),button(child));
      await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('不能拖入'));
      await nested();
      await mouseDrag(button(source),page.locator('.folder-heading span'),()=>page.keyboard.press('Escape'));
      await nested();
      report.checks.push('descendant and cancelled drops leave the branch in place');
      await mouseDrag(button(source),page.locator('.folder-heading span'));
      await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('已移回'));
      assert.equal(await depth(source),await depth(target));
      assert.equal(await button(target).locator('.folder-count').textContent(),'1');
      report.checks.push('heading drop restores the root and original counts');
      await renameMenu(source);
      const input=page.locator('#folderName');
      assert.equal(await input.inputValue(),sourceName);
      await input.fill(parentName);await input.press('Enter');
      await page.locator('#folderError').filter({hasText:'同名'}).waitFor();
      await input.fill('AE效果合集');await input.press('Enter');
      await button(source).filter({hasText:'AE效果合集'}).waitFor();
      await page.waitForFunction(()=>document.querySelector('#location').textContent==='AE效果合集');
      await page.locator('#folderSearch').fill('效果合集');
      await button(child).waitFor();
      assert.equal(await button(target).count(),0);
      await page.locator('#folderSearch').fill('');
      await mouseDrag(button(source),button(target));await nested();
      await close(app);app=null;await launch();await nested();
      await button(source).filter({hasText:'AE效果合集'}).waitFor();
      await button(source).click();await page.keyboard.press('F2');
      await page.locator('#folderDialog[open]').waitFor();assert.equal(await page.locator('#folderName').inputValue(), 'AE效果合集');
      await page.locator('#folderName').fill(sourceName);await page.locator('#folderRename').click();
      await button(source).filter({hasText:sourceName}).waitFor();
      report.checks.push('connected folder context rename, duplicate rejection, search, drag, restart and restore');
    }
    assert.deepEqual(fs.readFileSync(dbFile),original);
    for (const [i,dir] of [source,child,target].entries()) assert.equal(fs.readFileSync(path.join(dir,'预设.ffx'),'utf8'),'fx-'+i);
    assert.deepEqual(report.errors,[]);
    report.checks.push('original database and three preset files retain identical bytes and paths');
    report.passed=true;
  } catch(e) {
    report.error=e.stack;process.exitCode=1;
    if(page)await page.screenshot({path:path.join(run,'failure.png')}).catch(()=>{});
  } finally {
    if(app)await close(app).catch(()=>{});
    fs.writeFileSync(path.join(run,'report.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  }
})();
