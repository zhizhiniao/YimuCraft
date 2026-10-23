param([int]$FromX,[int]$FromY,[int]$ToX,[int]$ToY,[long]$WindowHandle)
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
}
'@
[void][YimuDragInput]::SetProcessDPIAware();$original=New-Object YimuDragInput+POINT;[void][YimuDragInput]::GetCursorPos([ref]$original)
try{[void][YimuDragInput]::SetForegroundWindow([IntPtr]$WindowHandle);Start-Sleep -Milliseconds 250;[void][YimuDragInput]::SetCursorPos($FromX,$FromY);Start-Sleep -Milliseconds 150;$actual=New-Object YimuDragInput+POINT;[void][YimuDragInput]::GetCursorPos([ref]$actual);$rect=New-Object YimuDragInput+RECT;[void][YimuDragInput]::GetWindowRect([IntPtr]$WindowHandle,[ref]$rect);$under=[YimuDragInput]::WindowFromPoint($actual);$owner=[uint32]0;[void][YimuDragInput]::GetWindowThreadProcessId($under,[ref]$owner);@{cursor=$actual;window=$rect;under=[long]$under;owner=$owner}|ConvertTo-Json -Compress;[YimuDragInput]::mouse_event(2,0,0,0,[UIntPtr]::Zero);for($step=1;$step -le 40;$step++){[void][YimuDragInput]::SetCursorPos([int]($FromX+($ToX-$FromX)*$step/40),[int]($FromY+($ToY-$FromY)*$step/40));Start-Sleep -Milliseconds 50};Start-Sleep -Milliseconds 300}finally{[YimuDragInput]::mouse_event(4,0,0,0,[UIntPtr]::Zero);[void][YimuDragInput]::SetCursorPos($original.X,$original.Y)}
