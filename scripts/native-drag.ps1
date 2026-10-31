param([int]$FromX,[int]$FromY,[int]$ToX,[int]$ToY,[long]$WindowHandle,[int]$SourcePid,[long]$TargetWindowHandle,[int]$TargetPid,[switch]$ClientCoordinates,[switch]$MeasureOnly)
$ErrorActionPreference='Stop'
Add-Type @'
using System;using System.Runtime.InteropServices;
public static class YimuDragInput {
 [StructLayout(LayoutKind.Sequential)] public struct POINT { public int X;public int Y; }
 [DllImport("user32.dll")] public static extern bool SetCursorPos(int x,int y);
 [DllImport("user32.dll")] public static extern bool GetCursorPos(out POINT point);
 [DllImport("user32.dll")] public static extern void mouse_event(uint flags,uint x,uint y,uint data,UIntPtr extra);
 [StructLayout(LayoutKind.Sequential)] public struct RECT {public int L,T,R,B;}
 [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr w,out RECT r);
 [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(POINT p);
 [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr w,out uint pid);
 [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
 [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr window);
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll")] public static extern short GetAsyncKeyState(int key);
 [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr window);
 [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr window,ref POINT point);
 [DllImport("user32.dll")] public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr context);
 public delegate bool EnumProc(IntPtr h,IntPtr p);
 [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc callback,IntPtr p);
 public static IntPtr Find(uint pid){IntPtr found=IntPtr.Zero;EnumWindows((h,p)=>{uint owner;RECT r;GetWindowThreadProcessId(h,out owner);GetWindowRect(h,out r);if(owner==pid&&r.R-r.L>800&&r.B-r.T>400){found=h;return false;}return true;},IntPtr.Zero);return found;}
}
'@
[void][YimuDragInput]::SetThreadDpiAwarenessContext([IntPtr](-4))
if(!$WindowHandle -and $SourcePid){$WindowHandle=[long][YimuDragInput]::Find([uint32]$SourcePid)}
if(!$WindowHandle){throw 'Source window unavailable'}
$srcRect=New-Object YimuDragInput+RECT;$dstRect=New-Object YimuDragInput+RECT
[void][YimuDragInput]::GetWindowRect([IntPtr]$WindowHandle,[ref]$srcRect)
if($TargetWindowHandle){[void][YimuDragInput]::GetWindowRect([IntPtr]$TargetWindowHandle,[ref]$dstRect)}
if($ClientCoordinates){
 $from=New-Object YimuDragInput+POINT;$s=[YimuDragInput]::GetDpiForWindow([IntPtr]$WindowHandle)/96.0;$from.X=[int]($FromX*$s);$from.Y=[int]($FromY*$s);[void][YimuDragInput]::ClientToScreen([IntPtr]$WindowHandle,[ref]$from);$FromX=$from.X;$FromY=$from.Y
 $to=New-Object YimuDragInput+POINT;$s=[YimuDragInput]::GetDpiForWindow([IntPtr]$TargetWindowHandle)/96.0;$to.X=[int]($ToX*$s);$to.Y=[int]($ToY*$s);[void][YimuDragInput]::ClientToScreen([IntPtr]$TargetWindowHandle,[ref]$to);$ToX=$to.X;$ToY=$to.Y
}
@{sourceHandle=$WindowHandle;targetHandle=$TargetWindowHandle;sourceRect=$srcRect;targetRect=$dstRect;from=@($FromX,$FromY);to=@($ToX,$ToY)}|ConvertTo-Json -Compress
if($MeasureOnly){return}
if(([YimuDragInput]::GetAsyncKeyState(1)-band 0x8000)-ne 0){throw 'Mouse is already held; no input sent'}
$original=New-Object YimuDragInput+POINT;[void][YimuDragInput]::GetCursorPos([ref]$original);$down=$false
try{
 [void][YimuDragInput]::SetForegroundWindow([IntPtr]$WindowHandle);Start-Sleep -Milliseconds 150
 [void][YimuDragInput]::SetCursorPos($FromX,$FromY);$actual=New-Object YimuDragInput+POINT;[void][YimuDragInput]::GetCursorPos([ref]$actual);$owner=[uint32]0;[void][YimuDragInput]::GetWindowThreadProcessId([YimuDragInput]::WindowFromPoint($actual),[ref]$owner)
 if($actual.X-ne $FromX-or $actual.Y-ne $FromY-or ($SourcePid-and $owner-ne $SourcePid)){throw 'Source point belongs to another window; no input sent'}
 [YimuDragInput]::mouse_event(2,0,0,0,[UIntPtr]::Zero);$down=$true;Start-Sleep -Milliseconds 150
 for($step=1;$step -le 40;$step++){if(([YimuDragInput]::GetAsyncKeyState(0x1B)-band 0x8000)-ne 0){throw 'User cancelled drag'};[void][YimuDragInput]::SetCursorPos([int]($FromX+($ToX-$FromX)*$step/40),[int]($FromY+($ToY-$FromY)*$step/40));Start-Sleep -Milliseconds 50}
 Start-Sleep -Milliseconds 250
 [void][YimuDragInput]::GetCursorPos([ref]$actual);[void][YimuDragInput]::GetWindowThreadProcessId([YimuDragInput]::WindowFromPoint($actual),[ref]$owner)
 if($TargetPid-and $owner-ne $TargetPid){[void][YimuDragInput]::SetCursorPos($FromX,$FromY);throw 'Drop point belongs to another application; returned to source'}
 @{dropOwner=$owner;released=$true}|ConvertTo-Json -Compress
}finally{if($down){[YimuDragInput]::mouse_event(4,0,0,0,[UIntPtr]::Zero);Start-Sleep -Milliseconds 150};@{buttonReleased=(([YimuDragInput]::GetAsyncKeyState(1)-band 0x8000)-eq 0)}|ConvertTo-Json -Compress;[void][YimuDragInput]::SetCursorPos($original.X,$original.Y)}
