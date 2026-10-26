// Nomi's Chromium v10 envelope uses its own profile key. Windows DPAPI binds
// that key to the current OS user; plaintext stays in the main-process pipe.
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
function decryptNomi(home,cipher){
 if(process.platform!=='win32')throw Error('当前仅支持 Windows 本机 Nomi 导入');
 const state=JSON.parse(fs.readFileSync(path.join(home,'AppData/Roaming/Nomi/Local State'),'utf8'));
 const script=`$ErrorActionPreference='Stop'; try { $d=[Console]::In.ReadToEnd()|ConvertFrom-Json; $b=[Convert]::FromBase64String($d.wrapped); $k=[Security.Cryptography.ProtectedData]::Unprotect($b[5..($b.Length-1)],$null,[Security.Cryptography.DataProtectionScope]::CurrentUser); $c=[Convert]::FromBase64String($d.cipher); $p=New-Object byte[] ($c.Length-31); $a=[Security.Cryptography.AesGcm]::new($k,16); $a.Decrypt($c[3..14],$c[15..($c.Length-17)],$c[($c.Length-16)..($c.Length-1)],$p); [Console]::Out.Write([Text.Encoding]::UTF8.GetString($p)); $a.Dispose(); [Array]::Clear($k); [Array]::Clear($p) } catch { exit 1 }`;
 const r=spawnSync('pwsh.exe',['-NoLogo','-NoProfile','-NonInteractive','-Command',script],{input:JSON.stringify({wrapped:state.os_crypt?.encrypted_key,cipher}),encoding:'utf8',windowsHide:true,timeout:15000,maxBuffer:16384});
 if(r.status!==0||!r.stdout)throw Error('无法解密 Nomi 配置；需当前 Windows 用户及 PowerShell 7');return r.stdout;
}
module.exports={decryptNomi};
