param([long]$Handle, [string]$Out)
$ErrorActionPreference = 'Stop'
# Bring a foreign application window to the front without touching its content.
# Used before a drag test so the target application is the window under the
# pointer; the drop itself is cancelled by the caller if the pointer still
# resolves to another process.
Add-Type @'
using System;using System.Runtime.InteropServices;
public static class Raise{
[DllImport("user32.dll")]public static extern bool ShowWindowAsync(IntPtr h,int c);
[DllImport("user32.dll")]public static extern bool SetForegroundWindow(IntPtr h);
[DllImport("user32.dll")]public static extern bool BringWindowToTop(IntPtr h);
[DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h,out uint p);
[DllImport("user32.dll")]public static extern bool IsIconic(IntPtr h);
[DllImport("user32.dll")]public static extern bool SetWindowPos(IntPtr h,IntPtr after,int x,int y,int cx,int cy,uint flags);
}
'@
$h = [IntPtr]$Handle
$wasMinimized = [Raise]::IsIconic($h)
if ($wasMinimized) { [void][Raise]::ShowWindowAsync($h, 9) }   # SW_RESTORE
Start-Sleep -Milliseconds 200
[void][Raise]::BringWindowToTop($h)
[void][Raise]::SetForegroundWindow($h)
Start-Sleep -Milliseconds 300
$fg = [uint32]0
[void][Raise]::GetWindowThreadProcessId([Raise]::GetForegroundWindow(), [ref]$fg)
$result = [ordered]@{ handle = $Handle; wasMinimized = $wasMinimized; foregroundPid = $fg }
$json = $result | ConvertTo-Json -Compress
if ($Out) { [IO.File]::WriteAllText($Out, $json, [Text.UTF8Encoding]::new($false)) }
Write-Output $json
