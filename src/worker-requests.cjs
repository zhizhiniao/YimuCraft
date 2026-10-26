// A dead worker must reject both in-flight and future commands. Do not replay
// mutations automatically: a worker may have committed before losing its reply.
class WorkerRequests {
 constructor(worker,pending,onFailure=()=>{}) {
  this.worker=worker;this.pending=pending;this.sequence=0;this.failure=null;
  worker.on('error',error=>this.fail(error,onFailure));
  worker.on('exit',code=>this.fail(Error('素材库后台已停止（'+code+'）'),onFailure));
 }
 fail(error,onFailure) {
  if(this.failure)return;
  this.failure=error;
  for(const request of this.pending.values())request.reject(error);
  this.pending.clear();onFailure(error);
 }
 send(command,...args) {
  if(this.failure)return Promise.reject(this.failure);
  return new Promise((resolve,reject)=>{
   const id=++this.sequence;this.pending.set(id,{resolve,reject});
   try{this.worker.postMessage({id,command,args});}
   catch(error){this.pending.delete(id);reject(error);}
  });
 }
}
module.exports={WorkerRequests};
