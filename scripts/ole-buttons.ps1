param([string]$Receipt,[string]$Trigger,[int]$SourcePid,[long]$SourceHandle)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;using System.Runtime.InteropServices;
public static class YimuStationaryInput{
[StructLayout(LayoutKind.Sequential)]public struct POINT{public int X,Y;}
[DllImport("user32.dll")]public static extern bool GetCursorPos(out POINT p);
[DllImport("user32.dll")]public static extern IntPtr WindowFromPoint(POINT p);
[DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr w,out uint pid);
[DllImport("user32.dll")]public static extern void mouse_event(uint f,uint x,uint y,uint d,UIntPtr e);
[DllImport("user32.dll")]public static extern bool SetProcessDPIAware();
[DllImport("user32.dll")]public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
[DllImport("user32.dll")]public static extern bool SetWindowPos(IntPtr h,IntPtr after,int x,int y,int cx,int cy,uint flags);
}
'@
[void][YimuStationaryInput]::SetThreadDpiAwarenessContext([IntPtr](-4))
$p=New-Object YimuStationaryInput+POINT
[void][YimuStationaryInput]::GetCursorPos([ref]$p)
$sourceOwner=[uint32]0
[void][YimuStationaryInput]::GetWindowThreadProcessId([IntPtr]$SourceHandle,[ref]$sourceOwner)
if($sourceOwner -ne $SourcePid){throw 'Wrong owned window'}
[void][YimuStationaryInput]::SetWindowPos([IntPtr]$SourceHandle,[IntPtr](-1),($p.X-200),($p.Y-300),960,700,0)
Start-Sleep -Milliseconds 100
$owner=[uint32]0
[void][YimuStationaryInput]::GetWindowThreadProcessId([YimuStationaryInput]::WindowFromPoint($p),[ref]$owner)
if($owner -ne $SourcePid){throw 'Cursor is not over the owned test application; no input sent'}
try{[YimuStationaryInput]::mouse_event(2,0,0,0,[UIntPtr]::Zero);'down'|Set-Content -LiteralPath $Trigger;Start-Sleep -Milliseconds 2200}finally{[YimuStationaryInput]::mouse_event(4,0,0,0,[UIntPtr]::Zero)}
