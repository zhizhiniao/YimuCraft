// Standalone stdio adapter. stdout is reserved for MCP JSON-RPC.
const fs=require('node:fs');
const {Server}=require('@modelcontextprotocol/sdk/server/index.js');
const {StdioServerTransport}=require('@modelcontextprotocol/sdk/server/stdio.js');
const {ListToolsRequestSchema,CallToolRequestSchema}=require('@modelcontextprotocol/sdk/types.js');
const {tools}=require('./agent-tools.cjs');
async function request(file,name,args){
 let connection;try{connection=JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw Error('请打开一幕，在“工具 → 智能体接入”开启连接');}
 if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(connection.endpoint)||!/^[a-f0-9]{64}$/.test(connection.token))throw Error('一幕连接信息无效，请重新开启接入');
 let response;try{response=await fetch(connection.endpoint+'/v1/call',{method:'POST',headers:{Authorization:'Bearer '+connection.token,'Content-Type':'application/json'},body:JSON.stringify({name,arguments:args}),signal:AbortSignal.timeout(30000),redirect:'error'});}catch{throw Error('一幕未响应；请确认软件已打开。写入请求超时时请先查询结果，不要假定失败。');}
 const data=await response.json();if(!response.ok)throw Error(data.error||'一幕调用失败');return data.result;
}
async function main(){const index=process.argv.indexOf('--connection'),file=index>=0?process.argv[index+1]:null;if(!file)throw Error('缺少 --connection，请使用一幕生成的 MCP 配置');const server=new Server({name:'yimucraft',version:require('../package.json').version},{capabilities:{tools:{}}});server.setRequestHandler(ListToolsRequestSchema,()=>({tools}));server.setRequestHandler(CallToolRequestSchema,async req=>{try{const result=await request(file,req.params.name,req.params.arguments||{});return {content:[{type:'text',text:JSON.stringify(result)}],structuredContent:result};}catch(e){return {isError:true,content:[{type:'text',text:e.message}]};}});await server.connect(new StdioServerTransport());}
if(require.main===module)main().catch(e=>{process.stderr.write(e.message+'\n');process.exitCode=1;});
module.exports={request};
