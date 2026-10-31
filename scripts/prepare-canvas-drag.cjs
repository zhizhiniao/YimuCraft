// Launches two isolated test processes. Use Computer Use to drag the visible
// card's native export handle to the receiver area at the bottom of the window.
const {electron}=require('./test-app.cjs'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const close=require('./close-test-app.cjs');
const root=path.resolve('work/canvas-drag-'+Date.now());fs.mkdirSync(root,{recursive:true});
const source=path.join(root,'K01_测试');fs.mkdirSync(source);const file=path.join(source,'画布原文件 中文.png');
fs.copyFileSync('E:/20261025未知君AI动画/Data/定稿资产/C01_抽象女性角色/C01_柔光半聚合_单正面_v08.png',file);
const marker=path.join(root,'started'),receipt=path.join(root,'drop.json'),report={root,file};
const env={...process.env,YIMU_DATA_DIR:path.join(root,'library'),YIMU_AE_CONNECTION_FILE:path.join(root,'ae.json'),YIMU_PR_BRIDGE_DIR:path.join(root,'pr'),YIMU_RECEIPT:receipt};delete env.ELECTRON_RUN_AS_NODE;
let app,receiver;
(async()=>{try{
 app=await electron.launch({...(process.env.YIMU_TEST_EXE?{executablePath:process.env.YIMU_TEST_EXE,args:[]}:{args:['.']}),env});const page=await app.firstWindow();await page.locator('#canvasTab').click();await page.locator('#canvasPath').fill(source);await page.locator('#canvasLink').click();await page.locator('.canvas-card').waitFor();
 await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.setBounds({x:40,y:40,width:1100,height:850});w.setTitle('一幕 · 项目画布拖放验收');w.show();w.focus();});
 await page.locator('#canvasFit').click();await page.locator('.canvas-card').click();await page.waitForFunction(()=>[...document.querySelectorAll('.canvas-card img')].some(i=>i.complete&&i.naturalWidth>0));
 await app.evaluate(async({BrowserWindow,ipcMain},{marker,receipt})=>{
   const wc=BrowserWindow.getAllWindows()[0].webContents,original=wc.startDrag.bind(wc),fs=process.mainModule.require('fs');
   const receiver=new BrowserWindow({x:80,y:600,width:980,height:200,frame:false,show:false,webPreferences:{nodeIntegration:true,contextIsolation:false}});
   await receiver.loadURL('data:text/html;charset=utf-8,'+encodeURIComponent('<meta charset="utf-8"><body style="background:#1f2430;color:white;font:24px sans-serif">原生文件接收区<script>const {ipcRenderer,webUtils}=require("electron");document.ondragover=e=>e.preventDefault();document.ondrop=e=>{e.preventDefault();const files=[...e.dataTransfer.files].map(f=>({path:webUtils.getPathForFile(f),name:f.name,size:f.size}));document.body.append("收到 "+files.length+" 个文件");ipcRenderer.send("canvas-test-drop",files);};</script></body>'));
   ipcMain.on('canvas-test-drop',(_e,files)=>fs.writeFileSync(receipt,JSON.stringify({files,count:files.length})));
   wc.startDrag=data=>{fs.writeFileSync(marker,JSON.stringify(data.files));receiver.setAlwaysOnTop(true,'screen-saver');receiver.showInactive();receiver.moveTop();return original(data);};
 },{marker,receipt});
 console.log(JSON.stringify({ready:true,root,destination:'下方画布区域，拖动后显示独立接收窗'}));
 const deadline=Date.now()+120000;
 while(Date.now()<deadline&&!fs.existsSync(receipt)){
  await new Promise(r=>setTimeout(r,40));
 }
 if(!fs.existsSync(receipt))throw Error('No native drop receipt');const received=JSON.parse(fs.readFileSync(receipt));report.receipt=received;report.nativeArgs=JSON.parse(fs.readFileSync(marker));
 const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');report.ok=received.files.length===1&&received.files[0].path===file&&hash(received.files[0].path)===hash(file);
 if(!report.ok)throw Error('Original path/bytes mismatch');
}catch(e){report.error=e.stack;process.exitCode=1;}finally{if(app)await close(app).catch(()=>{});if(receiver)await close(receiver).catch(()=>{});fs.writeFileSync(path.join(root,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));}})();
