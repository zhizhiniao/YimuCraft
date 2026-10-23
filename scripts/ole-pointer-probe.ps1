param([int]$X,[int]$Y,[int]$SourcePid,[string]$Out)
$ErrorActionPreference='Stop'
Add-Type @'
using System;using System.Runtime.InteropServices;
public static class YimuProbe{
[StructLayout(LayoutKind.Sequential)]public struct POINT{public int X,Y;}
[StructLayout(LayoutKind.Sequential)]public struct RECT{public int Left,Top,Right,Bottom;}
[DllImport("user32.dll")]public static extern bool GetCursorPos(out POINT p);
[DllImport("user32.dll")]public static extern bool SetCursorPos(int x,int y);
[DllImport("user32.dll")]public static extern IntPtr WindowFromPoint(POINT p);
[DllImport("user32.dll")]public static extern IntPtr GetAncestor(IntPtr h,uint f);
[DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr w,out uint pid);
[DllImport("user32.dll")]public static extern bool GetWindowRect(IntPtr h,out RECT r);
[DllImport("user32.dll")]public static extern bool GetClientRect(IntPtr h,out RECT r);
[DllImport("user32.dll")]public static extern bool ClientToScreen(IntPtr h,ref POINT p);
[DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll")]public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr c);
}
'@
[void][YimuProbe]::SetThreadDpiAwarenessContext([IntPtr](-4))
$before=New-Object YimuProbe+POINT;[void][YimuProbe]::GetCursorPos([ref]$before)
[void][YimuProbe]::SetCursorPos($X,$Y)
Start-Sleep -Milliseconds 120
$after=New-Object YimuProbe+POINT;[void][YimuProbe]::GetCursorPos([ref]$after)
$hwnd=[YimuProbe]::WindowFromPoint($after)
$root=[YimuProbe]::GetAncestor($hwnd,2)
$owner=[uint32]0;[void][YimuProbe]::GetWindowThreadProcessId($hwnd,[ref]$owner)
$rootOwner=[uint32]0;[void][YimuProbe]::GetWindowThreadProcessId($root,[ref]$rootOwner)
$r=New-Object YimuProbe+RECT;[void][YimuProbe]::GetWindowRect($root,[ref]$r)
$fg=[YimuProbe]::GetForegroundWindow();$fgPid=[uint32]0;[void][YimuProbe]::GetWindowThreadProcessId($fg,[ref]$fgPid)
$o=[ordered]@{
  requested=@{x=$X;y=$Y}
  cursorBefore=@{x=$before.X;y=$before.Y}
  cursorAfter=@{x=$after.X;y=$after.Y}
  hwndAtPoint=$hwnd.ToString()
  rootHwnd=$root.ToString()
  pidAtPoint=$owner
  rootPid=$rootOwner
  expectedPid=$SourcePid
  rootRect=@{left=$r.Left;top=$r.Top;right=$r.Right;bottom=$r.Bottom}
  foregroundPid=$fgPid
}
$json=$o|ConvertTo-Json -Compress
[IO.File]::WriteAllText($Out,$json,[Text.UTF8Encoding]::new($false))
Write-Output $json
