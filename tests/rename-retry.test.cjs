const {test}=require('node:test'),assert=require('node:assert/strict'),{renameRetry}=require('../src/rename-retry.cjs');
test('transient Windows rename locks recover; persistent and structural failures stay errors',async()=>{
 let calls=0;const waits=[];await renameRetry('owned-stage','destination',async(a,b)=>{assert.equal(a,'owned-stage');assert.equal(b,'destination');if(++calls<3)throw Object.assign(Error('locked'),{code:'EPERM'});},async ms=>waits.push(ms));assert.equal(calls,3);assert.deepEqual(waits,[50,100]);
 calls=0;await assert.rejects(renameRetry('a','b',async()=>{calls++;throw Object.assign(Error('still locked'),{code:'EACCES'});},async()=>{}),/still locked/);assert.equal(calls,6);
 calls=0;await assert.rejects(renameRetry('a','b',async()=>{calls++;throw Object.assign(Error('exists'),{code:'EEXIST'});},async()=>{throw Error('must not wait');}),/exists/);assert.equal(calls,1);
});
test('failed package finalization removes owned staging and leaves source and index intact',async()=>{
 const fs=require('node:fs'),path=require('node:path'),{Library}=require('../src/library.cjs'),retry=require('../src/rename-retry.cjs');const root=path.resolve('work/rename-exhausted-'+Date.now());fs.mkdirSync(path.join(root,'source'),{recursive:true});const file=path.join(root,'source','sample.txt');fs.writeFileSync(file,'original bytes');const lib=new Library(path.join(root,'library')),saved=retry.renameRetry;
 try{await lib.importPaths([file]);retry.renameRetry=async()=>{throw Object.assign(Error('persistent Windows lock'),{code:'EPERM'});};await assert.rejects(lib.exportPackage([lib.query().items[0].id],path.join(root,'output')),/persistent Windows lock/);assert.equal(fs.readdirSync(root).some(n=>n.startsWith('output')),false);assert.equal(fs.readFileSync(file,'utf8'),'original bytes');assert.equal(lib.query().total,1);}finally{retry.renameRetry=saved;lib.close();}
});
