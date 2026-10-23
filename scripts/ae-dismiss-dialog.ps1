param([string]$Out)
$ErrorActionPreference = 'Stop'
# Closes After Effects' own untitled modal dialog (#32770) which can block its
# main window after an interrupted shutdown. Only dialogs owned by AfterFX are
# touched, and only the standard close message is posted.
Add-Type @'
using System;using System.Text;using System.Collections.Generic;using System.Runtime.InteropServices;
public static class AeDlg{
 public delegate bool P(IntPtr h, IntPtr l);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]public static extern bool EnumWindows(P p, IntPtr l);
 [DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
 [DllImport("user32.dll")]public static extern bool IsWindowVisible(IntPtr h);
 [DllImport("user32.dll",CharSet=CharSet.Unicode)]public static extern int GetClassNameW(IntPtr h, StringBuilder s, int n);
 [DllImport("user32.dll")]public static extern bool PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
 public static List<long> Dialogs(uint target){
   var found = new List<long>();
   EnumWindows((h,l)=>{
     uint pid; GetWindowThreadProcessId(h, out pid);
     if (pid != target || !IsWindowVisible(h)) return true;
     var c = new StringBuilder(64); GetClassNameW(h, c, 64);
     if (c.ToString() == "#32770") found.Add(h.ToInt64());
     return true;
   }, IntPtr.Zero);
   return found;
 }
 public static void Close(long handle){ PostMessage(new IntPtr(handle), 0x0010, IntPtr.Zero, IntPtr.Zero); }
}
'@
$procs = Get-Process -Name AfterFX -ErrorAction SilentlyContinue
$closed = @()
foreach ($p in $procs) {
  foreach ($h in [AeDlg]::Dialogs([uint32]$p.Id)) { [AeDlg]::Close($h); $closed += $h }
}
$result = [ordered]@{ aeProcesses = @($procs).Count; closedDialogs = $closed }
$json = $result | ConvertTo-Json -Compress
if ($Out) { [IO.File]::WriteAllText($Out, $json, [Text.UTF8Encoding]::new($false)) }
Write-Output $json
