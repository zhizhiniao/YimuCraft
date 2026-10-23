// Playwright can retain its close promise after Electron has already exited.
// Bound teardown to this test's own process; never enumerate or stop user apps.
module.exports=async function closeTestApp(app){
 if(!app)return;
 let timer;
 try{await Promise.race([app.close(),new Promise((resolve,reject)=>{timer=setTimeout(()=>{const child=app.process();if(child.exitCode!==null||child.signalCode!==null)resolve();else{child.kill();reject(Error('Test application did not close within 10 seconds'));}},10000);})]);}
 finally{clearTimeout(timer);}
};
