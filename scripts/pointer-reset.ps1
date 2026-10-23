param([string]$Out)
$ErrorActionPreference = 'Stop'
# Test-harness hygiene: a previous interrupted drag can leave the left button
# logically held or a stale pointer script running, which silently swallows the
# next press. This resets both before a drag test starts. It touches only the
# project's own synthetic-input scripts and the left button state.
Add-Type @'
using System;using System.Runtime.InteropServices;
public static class YimuReset{
[DllImport("user32.dll")]public static extern void mouse_event(uint f,uint x,uint y,uint d,UIntPtr e);
[DllImport("user32.dll")]public static extern short GetAsyncKeyState(int vKey);
[DllImport("user32.dll")]public static extern bool ClipCursor(IntPtr r);
}
'@
$stopped = @()
Get-CimInstance Win32_Process -Filter "Name='powershell.exe'" |
  Where-Object { $_.CommandLine -match 'ole-card-pointer\.ps1|ole-buttons\.ps1|ole-card-input\.ps1' } |
  ForEach-Object {
    $stopped += $_.ProcessId
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }
Start-Sleep -Milliseconds 150
# Release the left button twice: harmless when already up.
[YimuReset]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero)
Start-Sleep -Milliseconds 80
[YimuReset]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero)
# An interrupted OLE drag or a closed window can leave a cursor clip rectangle
# behind, which makes every later SetCursorPos settle at an offset. Clearing it is
# a no-op when no clip exists.
[void][YimuReset]::ClipCursor([IntPtr]::Zero)
$state = [YimuReset]::GetAsyncKeyState(1)
$result = [ordered]@{ stoppedPids = $stopped; leftButtonDown = (($state -band 0x8000) -ne 0); clipCleared = $true }
$json = $result | ConvertTo-Json -Compress
if ($Out) { [IO.File]::WriteAllText($Out, $json, [Text.UTF8Encoding]::new($false)) }
Write-Output $json
