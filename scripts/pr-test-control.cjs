// Test-only CDP adapter. It is never included in the shipped application.
async function evaluate(expression){
 const tabs=await(await fetch('http://127.0.0.1:18817/json')).json(),target=tabs.find(t=>t.url.endsWith('/com.yimucraft.bridge/index.html'));
 if(!target)throw Error('Independent YimuCraft CEP panel debugger is not available');
 return new Promise((resolve,reject)=>{const ws=new WebSocket(target.webSocketDebuggerUrl),timer=setTimeout(()=>{ws.close();reject(Error('Own CEP evaluation timed out'));},15000);ws.onopen=()=>ws.send(JSON.stringify({id:1,method:'Runtime.evaluate',params:{expression,returnByValue:true,awaitPromise:true}}));ws.onerror=e=>{clearTimeout(timer);reject(Error('Own CEP connection failed'));};ws.onmessage=e=>{const r=JSON.parse(e.data);if(r.id!==1)return;clearTimeout(timer);ws.close();if(r.error||r.result.exceptionDetails)reject(Error(JSON.stringify(r.error||r.result.exceptionDetails)));else resolve(r.result.result.value);};});
}
async function host(script){const result=await evaluate('new Promise(function(resolve){window.__adobe_cep__.evalScript('+JSON.stringify(script)+',resolve);})');if(typeof result==='string'&&/^EvalScript error/.test(result))throw Error(result);return result;}
module.exports={evaluate,host};
