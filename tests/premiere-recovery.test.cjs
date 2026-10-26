const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {PremiereBridge}=require('../src/premiere-bridge.cjs');
function fixture(){const root=fs.mkdtempSync(path.resolve('work/pr-recovery-')),directory=path.join(root,'YimuCraft','premiere-bridge');let tick,callback,dispatches=0;
 const context={clearInterval:()=>{},setInterval:fn=>{tick=fn;},document:{getElementById:()=>({textContent:''})},window:{addEventListener:()=>{},cep_node:{require,process},__adobe_cep__:{getSystemPath:()=>root,evalScript:(_script,cb)=>{dispatches++;callback=cb;}}}};
 vm.runInNewContext(fs.readFileSync('src/premiere-panel/panel.js','utf8'),context);tick();return {directory,tick:()=>tick(),reply:r=>callback(r),count:()=>dispatches};}
test('late receipt never replays a timed-out operation, including a new bridge instance',async()=>{
 const f=fixture(),bridge=new PremiereBridge(f.directory,{timeout:30,poll:5});const first=bridge.run('import',{paths:['fixture']});f.tick();await assert.rejects(first,/锁定/);assert.equal(f.count(),1);
 const restarted=new PremiereBridge(f.directory);await assert.rejects(restarted.run('import'),/待确认/);assert.throws(()=>restarted.resolvePending(),/未知/);
 f.reply(JSON.stringify({ok:true,result:{imported:1}}));assert.equal(restarted.pending().receipt.result.imported,1);await assert.rejects(restarted.run('import'),/待确认/);
 const result=restarted.resolvePending();assert.equal(result.receipt.ok,true);assert.equal(restarted.pending(),null);assert.equal(f.count(),1);
 const next=restarted.run('inspect');f.tick();f.reply(JSON.stringify({ok:true,result:{items:1}}));assert.equal((await next).result.items,1);
});
test('unknown or malformed response stays locked until explicit host-closed recovery',async()=>{
 const f=fixture(),bridge=new PremiereBridge(f.directory,{timeout:5000,poll:5});const operation=bridge.run('import');f.tick();f.reply('EvalScript error.');await assert.rejects(operation,/无法确认/);
 assert.equal(bridge.pending().receipt,null);assert.throws(()=>bridge.resolvePending(),/未知/);bridge.resolvePending({hostClosed:true});assert.equal(bridge.pending(),null);assert.equal(f.count(),1);
});
test('two clients cannot publish concurrent operations and queued timeout is cancelled',async()=>{
 const f=fixture(),a=new PremiereBridge(f.directory,{timeout:25,poll:5}),b=new PremiereBridge(f.directory);const first=a.run('inspect');await assert.rejects(b.run('import'),/待确认/);await assert.rejects(first,/锁定/);
 f.tick();assert.equal(f.count(),0);a.resolvePending({hostClosed:true});assert.equal(fs.readdirSync(f.directory).filter(n=>n.endsWith('.request.json')).length,0);
});
test('receipt must have exact ID and a boolean outcome',async()=>{
 const f=fixture(),bridge=new PremiereBridge(f.directory,{timeout:5000,poll:5});const first=bridge.run('import'),pending=bridge.pending();fs.writeFileSync(path.join(f.directory,pending.id+'.response.json'),JSON.stringify({ok:true}));await assert.rejects(first,/无法确认/);assert.ok(new PremiereBridge(f.directory).pending());
});
