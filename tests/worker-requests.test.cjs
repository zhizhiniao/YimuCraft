const test=require('node:test'),assert=require('node:assert/strict'),{Worker}=require('node:worker_threads');
const {WorkerRequests}=require('../src/worker-requests.cjs');
for(const body of ['process.exit(0)','throw Error("fixture crash")'])test('worker exit rejects current and future requests: '+body,async()=>{
 const worker=new Worker('const {parentPort}=require("node:worker_threads");parentPort.on("message",()=>{'+body+'});',{eval:true});
 const pending=new Map();let errors=0;const channel=new WorkerRequests(worker,pending,()=>errors++);
 try{await assert.rejects(channel.send('mutate'));await assert.rejects(channel.send('query'));assert.equal(pending.size,0);assert.equal(errors,1);}
 finally{await worker.terminate();}
});
test('serialization failure leaves no pending request; healthy worker still responds',async()=>{
 const worker=new Worker('const {parentPort}=require("node:worker_threads");parentPort.on("message",m=>parentPort.postMessage({id:m.id,result:m.args[0]}));',{eval:true});
 const pending=new Map(),channel=new WorkerRequests(worker,pending);
 worker.on('message',m=>{const request=pending.get(m.id);pending.delete(m.id);request.resolve(m.result);});
 try{await assert.rejects(channel.send('bad',()=>{}));assert.equal(pending.size,0);assert.equal(await channel.send('echo','真实往返'), '真实往返');assert.equal(pending.size,0);}
 finally{await worker.terminate();}
});
