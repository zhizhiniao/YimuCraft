(function(){
 function status(t){document.getElementById('status').textContent=t;}
 try{
 var nodeRequire=window.cep_node&&window.cep_node.require||require, nodeProcess=window.cep_node&&window.cep_node.process||process;
 var fs=nodeRequire('fs'),path=nodeRequire('path'),base=decodeURI(window.__adobe_cep__.getSystemPath('myDocuments').replace(/^file:\/\/\//,''));
 var directory=path.join(base,'YimuCraft','premiere-bridge');fs.mkdirSync(directory,{recursive:true});var busy=false,stopped=false;
 if(window.__yimuStopPolling)window.__yimuStopPolling();
 status('一幕面板 0.5.0 · 正在建立连接');
 function write(file,data){var temporary=file+'.tmp';fs.writeFileSync(temporary,JSON.stringify(data));fs.renameSync(temporary,file);}
 var timer=setInterval(function(){if(stopped)return;try{write(path.join(directory,'heartbeat.json'),{version:'0.5.0',time:Date.now(),host:'Premiere Pro',directory:directory});if(busy)return;
  var files=fs.readdirSync(directory).filter(function(f){return /\.request\.json$/.test(f);}).sort();if(!files.length){status('已连接 · 等待一幕操作');return;}
  var file=path.join(directory,files[0]),request;
  try{request=JSON.parse(fs.readFileSync(file,'utf8'));if(!/^[a-f0-9-]{36}$/.test(request.id))throw Error('Invalid request ID');if(Date.now()-request.time>120000||request.time>Date.now()+5000)throw Error('请求已过期，未执行');if(['inspect','import','mogrt','lut','lutAdjustment','collectCurrent','openProject','fixture'].indexOf(request.operation)<0)throw Error('Unsupported operation');}
  catch(e){write(file.replace('.request.','.response.'),{id:path.basename(file,'.request.json'),ok:false,error:String(e)});fs.unlinkSync(file);return;}
  fs.renameSync(file,file+'.executing');busy=true;status('正在执行 '+request.operation);
  var script='$._yimuBridge.dispatch('+JSON.stringify(request).replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+')';
  window.__adobe_cep__.evalScript(script,function(result){try{var receipt=JSON.parse(result);receipt.id=request.id;write(file.replace('.request.','.response.'),receipt);status(receipt.ok?'已完成 '+request.operation:receipt.error);}catch(e){write(file.replace('.request.','.response.'),{id:request.id,ok:false,uncertain:true,error:'PR 回执解析失败：'+result});}finally{try{fs.unlinkSync(file+'.executing');}finally{busy=false;}}});
 }catch(tickError){status('连接失败：'+String(tickError)+'\n目录：'+directory);}},500);
 window.__yimuStopPolling=function(){stopped=true;clearInterval(timer);};
 window.addEventListener('beforeunload',window.__yimuStopPolling,{once:true});
 }catch(startError){status('面板启动失败：'+String(startError));}
})();
