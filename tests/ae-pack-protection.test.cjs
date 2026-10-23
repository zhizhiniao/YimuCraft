const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('AE panel refuses unsaved changes before closing or copying the user project',()=>{
 let receipt,mutations=0;function File(name){this.name=path.basename(name);this.open=()=>true;this.write=s=>{receipt=JSON.parse(s);};this.close=()=>{};this.rename=()=>true;}
 const project={file:{fsName:'C:/user/project.aep',copy(){mutations++;}},numItems:3,dirty:true,close(){mutations++;}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../src/adobe-host.jsx'),'utf8'),{YIMU_REQUEST:{id:'guard',operation:'collectCurrent',isolated:false,payload:{},receipt:'receipt.json'},File,app:{project,version:'test-double',open(){mutations++;}},$:{writeln(){}}});
 assert.equal(receipt.ok,false);assert.match(receipt.error,/先保存/);assert.equal(mutations,0);
});
