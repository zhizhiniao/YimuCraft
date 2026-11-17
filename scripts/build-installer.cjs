// In this Windows environment electron-builder 26.15.3's NSIS generation
// stub times out even with its inherited environment restored. Use the same
// built-in static UninstallerReader used upstream on macOS, narrowly scoped to
// this product's generation stub. It extracts the already compiled uninstaller;
// it does not run an installer or modify vendor files or application code.
if(process.platform==='win32'){
 const path=require('node:path');
 const {WineVmManager}=require('app-builder-lib/out/vm/WineVm.js');
 const {UninstallerReader}=require('app-builder-lib/out/targets/nsis/nsisUtil.js');
 const helperName='YimuCraft Setup '+require('../package.json').version+'.exe';
 const original=WineVmManager.prototype.execWine;
 WineVmManager.prototype.execWine=function(input){
  if(path.basename(input.file)===helperName&&input.options?.env?.__COMPAT_LAYER==='RunAsInvoker'&&!(input.appArgs||[]).length){
   const output=path.join(path.dirname(input.file),path.basename(input.file,'exe')+'__uninstaller.exe');
   return UninstallerReader.exec(input.file,output);
  }
  return original.call(this,{...input,options:{...input.options,env:{...process.env,...input.options?.env}}});
 };
}
require('electron-builder/cli.js');
