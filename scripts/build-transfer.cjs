const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const framework=path.join(process.env.WINDIR||'C:\\Windows','Microsoft.NET','Framework64','v4.0.30319');
const output=path.join(__dirname,'..','src','native','YimuTransfer.exe');fs.mkdirSync(path.dirname(output),{recursive:true});
execFileSync(path.join(framework,'csc.exe'),['/nologo','/nowarn:0649','/target:exe','/platform:x64','/out:'+output,'/r:System.Web.Extensions.dll','/r:System.Windows.Forms.dll','/r:System.Drawing.dll','/r:Accessibility.dll',path.join(__dirname,'..','src','native','YimuTransfer.cs')],{stdio:'inherit',windowsHide:true});
console.log('Built YimuTransfer.exe');
