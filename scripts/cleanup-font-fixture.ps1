$ErrorActionPreference='Stop'
$receipt=(Get-Content -LiteralPath 'evidence/font-install-ui.json' -Raw | ConvertFrom-Json).receipt
if(-not $receipt -or $receipt.registryName -notmatch '^YimuCraftValidation\d+ \(TrueType\)$'){throw 'No owned font fixture receipt'}
$fontRoot=[IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'Microsoft\Windows\Fonts'))
$target=[IO.Path]::GetFullPath($receipt.path)
if([IO.Path]::GetDirectoryName($target) -ne $fontRoot -or [IO.Path]::GetFileName($target) -notmatch '^YimuCraft-[0-9a-f]{64}\.ttf$'){throw 'Unexpected font fixture path'}
$registry='HKCU:\Software\Microsoft\Windows NT\CurrentVersion\Fonts'
if((Get-Item -LiteralPath $registry).GetValue($receipt.registryName) -ne $target){throw 'Font registration changed; not removing'}
Add-Type @'
using System;using System.Runtime.InteropServices;
public static class YimuFontCleanup {
 [DllImport("gdi32.dll",CharSet=CharSet.Unicode)] public static extern bool RemoveFontResourceEx(string file,uint flags,IntPtr reserved);
 [DllImport("user32.dll")] public static extern IntPtr SendMessageTimeout(IntPtr window,uint message,UIntPtr wParam,IntPtr lParam,uint flags,uint timeout,out UIntPtr result);
}
'@
[void][YimuFontCleanup]::RemoveFontResourceEx($target,0,[IntPtr]::Zero)
Remove-ItemProperty -LiteralPath $registry -Name $receipt.registryName
Remove-Item -LiteralPath $target
$result=[UIntPtr]::Zero
[void][YimuFontCleanup]::SendMessageTimeout([IntPtr]0xffff,0x001d,[UIntPtr]::Zero,[IntPtr]::Zero,2,500,[ref]$result)
@{removed=$true;path=$target;registryName=$receipt.registryName}|ConvertTo-Json -Compress|Set-Content -LiteralPath 'evidence/font-fixture-cleanup.json' -Encoding utf8
