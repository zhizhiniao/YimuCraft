const fs=require('node:fs'),path=require('node:path');
const target=path.join(__dirname,'../src/third-party/canvas');fs.mkdirSync(target,{recursive:true});
for(const [source,name] of [
 ['@panzoom/panzoom/dist/panzoom.min.js','panzoom.min.js'],['@panzoom/panzoom/MIT-License.txt','PANZOOM-LICENSE.txt'],
 ['interactjs/dist/interact.min.js','interact.min.js'],['interactjs/LICENSE','INTERACT-LICENSE.txt']
])fs.copyFileSync(path.join(__dirname,'../node_modules',source),path.join(target,name));
console.log('Project canvas vendor files ready');
