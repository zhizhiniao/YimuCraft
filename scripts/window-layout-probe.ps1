param([int]$X, [int]$Y, [string]$Out)
$ErrorActionPreference = 'Stop'
Add-Type @'
using System;using System.Text;using System.Collections.Generic;using System.Runtime.InteropServices;
public static class Wins{
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [StructLayout(LayoutKind.Sequential)] public struct RECT{public int Left,Top,Right,Bottom;}
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc p, IntPtr l);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern int GetWindowTextW(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern int GetClassNameW(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern IntPtr GetWindowLongPtrW(IntPtr h, int i);
  [DllImport("user32.dll")] public static extern IntPtr WindowFromPoint(POINT p);
  [StructLayout(LayoutKind.Sequential)] public struct POINT{public int X,Y;}
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetThreadDpiAwarenessContext(IntPtr c);
  public static List<string> List(){
    var found = new List<string>();
    EnumWindows((h,l)=>{
      if(!IsWindowVisible(h)) return true;
      RECT r; if(!GetWindowRect(h, out r)) return true;
      uint pid; GetWindowThreadProcessId(h, out pid);
      var t = new StringBuilder(256); GetWindowTextW(h, t, 256);
      var c = new StringBuilder(256); GetClassNameW(h, c, 256);
      long ex = (long)GetWindowLongPtrW(h, -20);
      bool topmost = (ex & 0x8) != 0;
      found.Add(pid + "|" + r.Left + "," + r.Top + "," + r.Right + "," + r.Bottom + "|" + topmost + "|" + c + "|" + t);
      return true;
    }, IntPtr.Zero);
    return found;
  }
}
'@
[void][Wins]::SetThreadDpiAwarenessContext([IntPtr](-4))
$p = New-Object Wins+POINT
$p.X = $X; $p.Y = $Y
$hit = [Wins]::WindowFromPoint($p)
$hitPid = [uint32]0
[void][Wins]::GetWindowThreadProcessId($hit, [ref]$hitPid)
$fg = [Wins]::GetForegroundWindow()
$fgPid = [uint32]0
[void][Wins]::GetWindowThreadProcessId($fg, [ref]$fgPid)
$rows = @()
foreach ($line in [Wins]::List()) {
  $parts = $line -split '\|'
  $b = $parts[1] -split ','
  $inside = ([int]$b[0] -le $X -and [int]$b[2] -ge $X -and [int]$b[1] -le $Y -and [int]$b[3] -ge $Y)
  $rows += [ordered]@{ pid = [int]$parts[0]; rect = $parts[1]; topmost = $parts[2]; cls = $parts[3]; title = $parts[4]; containsPoint = $inside }
}
$result = [ordered]@{
  point = @{ x = $X; y = $Y }
  windowFromPointHwnd = $hit.ToString()
  windowFromPointPid = $hitPid
  foregroundPid = $fgPid
  windowsCoveringPoint = @($rows | Where-Object { $_.containsPoint })
  windowCount = $rows.Count
}
$json = $result | ConvertTo-Json -Depth 6
if ($Out) { [IO.File]::WriteAllText($Out, $json, [Text.UTF8Encoding]::new($false)) }
Write-Output $json
