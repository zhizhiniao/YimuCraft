const fs=require('fs'),path=require('path'),crypto=require('crypto'),{spawn}=require('child_process');
async function install(file){if(process.platform!=='win32')throw Error('字体安装目前仅支持 Windows');const ext=path.extname(file).toLowerCase();if(!['.ttf','.otf'].includes(ext))throw Error('Windows 安装支持 TTF/OTF 字体');const stat=await fs.promises.stat(file);if(!stat.isFile()||stat.size>64*1024*1024)throw Error('字体文件无效或超过 64 MB');const font=require('fontkit').openSync(file);if(!font.fullName||!font.postscriptName)throw Error('无法读取字体名称');const hash=crypto.createHash('sha256').update(await fs.promises.readFile(file)).digest('hex'),targetName='YimuCraft-'+hash+ext,registryName=font.fullName+(ext==='.ttf'?' (TrueType)':' (OpenType)'),data=Buffer.from(JSON.stringify({file,targetName,registryName,hash})).toString('base64');
 const script=`$ErrorActionPreference='Stop'
$ProgressPreference='SilentlyContinue'
trap{[Console]::Error.WriteLine($_.Exception.Message);exit 1}
function Get-YimuDigest([string]$file){$stream=[IO.File]::OpenRead($file);$sha=[Security.Cryptography.SHA256]::Create();try{return [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-','').ToLower()}finally{$stream.Dispose();$sha.Dispose()}}
[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false)
$data=ConvertFrom-Json ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${data}')))
$directory=Join-Path $env:LOCALAPPDATA 'Microsoft\\Windows\\Fonts'
$target=Join-Path $directory $data.targetName
$registry='HKCU:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts'
New-Item -ItemType Directory -Path $directory -Force | Out-Null
if(-not(Test-Path -LiteralPath $registry)){New-Item -Path $registry -Force | Out-Null}
$key=Get-Item -LiteralPath $registry
$old=$key.GetValue($data.registryName)
if($old){if($old -eq $target -and (Test-Path -LiteralPath $target) -and ((Get-YimuDigest $target) -eq $data.hash)){@{installed=$true;existing=$true;path=$target;registryName=$data.registryName}|ConvertTo-Json -Compress;exit};throw '已有同名字体，请先在 Windows 字体设置中检查版本'}
$systemKey=Get-Item -LiteralPath 'HKLM:\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts'
if($systemKey.GetValue($data.registryName)){throw '系统已安装同名字体，请先在 Windows 字体设置中检查版本'}
if(Test-Path -LiteralPath $target){throw '字体目标文件已存在但未注册，请先在 Windows 字体设置中检查'}
Add-Type @'
using System;using System.Runtime.InteropServices;
public static class YimuFontAPI {
 [DllImport("gdi32.dll",CharSet=CharSet.Unicode)] public static extern int AddFontResourceEx(string file,uint flags,IntPtr reserved);
 [DllImport("gdi32.dll",CharSet=CharSet.Unicode)] public static extern bool RemoveFontResourceEx(string file,uint flags,IntPtr reserved);
 [DllImport("user32.dll")] public static extern IntPtr SendMessageTimeout(IntPtr window,uint message,UIntPtr wParam,IntPtr lParam,uint flags,uint timeout,out UIntPtr result);
}
'@
$copied=$false;$registered=$false;$added=0
try{[IO.File]::Copy($data.file,$target,$false);$copied=$true
 if((Get-YimuDigest $target) -ne $data.hash){throw '字体复制校验失败'}
 $added=[YimuFontAPI]::AddFontResourceEx($target,0,[IntPtr]::Zero);if($added -le 0){throw 'Windows 未能激活字体'}
 New-ItemProperty -LiteralPath $registry -Name $data.registryName -PropertyType String -Value $target -ErrorAction Stop | Out-Null;$registered=$true
 $result=[UIntPtr]::Zero;[void][YimuFontAPI]::SendMessageTimeout([IntPtr]0xffff,0x001d,[UIntPtr]::Zero,[IntPtr]::Zero,2,500,[ref]$result)
 @{installed=$true;existing=$false;path=$target;registryName=$data.registryName;resources=$added}|ConvertTo-Json -Compress
}catch{if($registered){Remove-ItemProperty -LiteralPath $registry -Name $data.registryName};if($added -gt 0){[void][YimuFontAPI]::RemoveFontResourceEx($target,0,[IntPtr]::Zero)};if($copied){Remove-Item -LiteralPath $target};throw}
`;
 return new Promise((resolve,reject)=>{const child=spawn('powershell.exe',['-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true});let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);child.on('error',reject);child.on('close',code=>{if(code)return reject(Error('字体安装失败：'+stderr.slice(-2000)));try{resolve({...JSON.parse(stdout.trim()),message:'字体已安装到当前 Windows 用户：'+font.fullName});}catch(e){reject(Error('字体安装回执无效：'+e.message));}});});
}
module.exports={install};
