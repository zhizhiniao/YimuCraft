// Isolated desktop smoke test; never connects to the user's media library.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {electron}=require('./test-app.cjs');
(async()=>{
  const executable=process.argv[2],out=path.resolve(process.argv[3]);
  fs.mkdirSync(out,{recursive:true});
  const library=path.join(out,'library');fs.mkdirSync(library,{recursive:true});
  let app;
  try{
    app=await electron.launch({executablePath:executable,args:[],env:{...process.env,YIMU_DATA_DIR:library,YIMU_AE_CONNECTION_FILE:path.join(out,'ae-library.json'),YIMU_PR_BRIDGE_DIR:path.join(out,'pr-bridge')},timeout:30000});
    const page=await app.firstWindow();await page.waitForFunction(()=>!!window.yimu,{timeout:30000});
    const result=await app.evaluate(({app,Menu})=>({version:app.getVersion(),adobeMenu:Menu.getApplicationMenu().items.find(x=>x.label==='Adobe').submenu.items.map(x=>x.label)}));
    assert.ok(result.adobeMenu.includes('刷新 AE 工程信息'));
    result.library=await page.evaluate(()=>window.yimu.command('stats'));
    assert.equal(result.library.total,0);
    result.passed=true;fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2));
    console.log(JSON.stringify({version:result.version,passed:true,report:path.join(out,'result.json')}));
  }finally{if(app)await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
