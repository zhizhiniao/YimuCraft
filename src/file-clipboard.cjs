const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
// Windows Explorer consumes the standard FileDropList as a copy operation.
async function copyFiles(files){
  if(process.platform!=='win32')throw Error('文件剪贴板目前仅支持 Windows');
  const directory=await fs.promises.mkdtemp(path.join(os.tmpdir(),'YimuCraft-clipboard-')),payload=path.join(directory,'files.json');
  try{await fs.promises.writeFile(payload,JSON.stringify(files),'utf8');
  const script=`$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Windows.Forms
$items=New-Object System.Collections.Specialized.StringCollection
$paths=ConvertFrom-Json (Get-Content -LiteralPath $env:YIMU_CLIPBOARD_PAYLOAD -Raw -Encoding UTF8)
foreach($item in $paths){[void]$items.Add([string]$item)}
[Windows.Forms.Clipboard]::SetFileDropList($items)`;
  await new Promise((resolve,reject)=>{const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-STA','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,env:{...process.env,YIMU_CLIPBOARD_PAYLOAD:payload}});let error='';child.stderr.on('data',b=>error+=b);child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('无法复制文件：'+error)));});
  }finally{await fs.promises.rm(directory,{recursive:true,force:true});}
}
async function readFiles(){
 if(process.platform!=='win32')return [];
 const script="$ErrorActionPreference='Stop';Add-Type -AssemblyName System.Windows.Forms;[Console]::OutputEncoding=[Text.Encoding]::UTF8;ConvertTo-Json -Compress -InputObject @([Windows.Forms.Clipboard]::GetFileDropList())";
 return new Promise((resolve,reject)=>{const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-STA','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true});let output='',error='',done=false;const finish=(e,value)=>{if(done)return;done=true;clearTimeout(timer);e?reject(e):resolve(value);};const timer=setTimeout(()=>{child.kill();finish(Error('读取文件剪贴板超时'));},10000);child.stdout.on('data',b=>{output+=b.toString('utf8');if(Buffer.byteLength(output)>32*1024*1024){child.kill();finish(Error('剪贴板文件列表过大'));}});child.stderr.on('data',b=>{error=(error+b).slice(-2000);});child.on('error',e=>finish(e));child.on('close',code=>{if(code!==0)return finish(Error('无法读取文件剪贴板：'+error));try{const files=JSON.parse(output.trim()||'[]');if(!Array.isArray(files)||files.some(f=>typeof f!=='string'||!path.isAbsolute(f)))throw Error('文件剪贴板内容无效');finish(null,files);}catch(e){finish(e);}});});
}
module.exports={copyFiles,readFiles};
