// Native OS drag into an independent WebContentsView in the same HWND.
// This avoids the Computer Use driver's cross-window target restriction.
const {electron}=require('./test-app.cjs');
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const close=require('./close-test-app.cjs');
const run=path.resolve('work/canvas-native-'+Date.now());fs.mkdirSync(run,{recursive:true});
const source=path.join(run,'K01_测试');fs.mkdirSync(source);
const file=path.join(source,'画布原文件 中文.png');
fs.copyFileSync('E:/20261025未知君AI动画/Data/定稿资产/C01_抽象女性角色/C01_柔光半聚合_单正面_v08.png',file);
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const originalHash=hash(file),marker=path.join(run,'started.json'),receipt=path.join(run,'drop.json');
const env={...process.env,YIMU_DATA_DIR:path.join(run,'library'),YIMU_AE_CONNECTION_FILE:path.join(run,'ae.json'),YIMU_PR_BRIDGE_DIR:path.join(run,'pr')};delete env.ELECTRON_RUN_AS_NODE;
let app;const report={run,file};
(async()=>{try{
 app=await electron.launch({executablePath:process.env.YIMU_TEST_EXE,args:[],env});
 const page=await app.firstWindow();await page.locator('#canvasTab').click();await page.locator('#canvasPath').fill(source);await page.locator('#canvasLink').click();await page.locator('.canvas-card').waitFor();
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.setBounds({x:40,y:40,width:1150,height:900});w.setTitle('一幕 · 原生文件拖出验收');w.show();w.focus();});
 await page.evaluate(()=>document.querySelector('#canvasStage').style.marginBottom='260px');
 await page.locator('#canvasFit').click();await page.locator('.canvas-card').click();
 await app.evaluate(async({BrowserWindow,WebContentsView,ipcMain},{marker,receipt})=>{
  const fs=process.mainModule.require('fs'),w=BrowserWindow.getAllWindows()[0],wc=w.webContents,original=wc.startDrag.bind(wc);
  const view=new WebContentsView({webPreferences:{nodeIntegration:true,contextIsolation:false}});
  w.contentView.addChildView(view);view.setBounds({x:20,y:650,width:1100,height:200});
  await view.webContents.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent('<meta charset="utf-8"><body style="box-sizing:border-box;background:#142d28;color:#c6fff0;font:24px sans-serif;border:3px dashed #63d0ae;height:190px;margin:0;padding:25px">独立文件接收区：将上方“↗ 拖出文件”拖到这里<script>const {ipcRenderer,webUtils}=require("electron");document.ondragover=e=>{e.preventDefault();e.dataTransfer.dropEffect="copy"};document.ondrop=e=>{e.preventDefault();const files=[...e.dataTransfer.files].map(f=>({path:webUtils.getPathForFile(f),name:f.name,size:f.size}));document.body.textContent="已收到 "+files.length+" 个原文件";ipcRenderer.send("canvas-test-drop",files);};</script></body>'));
  ipcMain.on('canvas-test-drop',(_e,files)=>fs.writeFileSync(receipt,JSON.stringify({files})));
  wc.startDrag=data=>{fs.writeFileSync(marker,JSON.stringify(data.files));return original(data);};
 },{marker,receipt});
 console.log(JSON.stringify({ready:true,run}));
 const deadline=Date.now()+180000;while(Date.now()<deadline&&!fs.existsSync(receipt))await new Promise(r=>setTimeout(r,50));
 if(!fs.existsSync(receipt))throw Error('No native drop receipt');
 report.nativeArgs=JSON.parse(fs.readFileSync(marker));report.receipt=JSON.parse(fs.readFileSync(receipt));
 report.ok=report.receipt.files.length===1&&report.receipt.files[0].path===file&&hash(file)===originalHash;
 if(!report.ok)throw Error('Original file path/bytes mismatch');
 await page.screenshot({path:path.join(run,'source.png')});
}catch(e){report.error=e.stack;process.exitCode=1;}
finally{if(app)await close(app).catch(()=>{});fs.writeFileSync(path.join(run,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}})();
