param([long]$WindowHandle,[int]$X,[int]$Y,[switch]$Right,[switch]$NoActivate)
Add-Type @'
using System;using System.Runtime.InteropServices;
public class YimuObservedClick{[DllImport("user32.dll")]public static extern bool SetProcessDPIAware();[StructLayout(LayoutKind.Sequential)]public struct RECT{public int L,T,R,B;}[DllImport("user32.dll")]public static extern bool GetWindowRect(IntPtr h,out RECT r);[DllImport("user32.dll")]public static extern bool SetForegroundWindow(IntPtr h);[DllImport("user32.dll")]public static extern bool SetCursorPos(int x,int y);[DllImport("user32.dll")]public static extern void mouse_event(uint f,uint x,uint y,uint d,UIntPtr e);}
'@
[void][YimuObservedClick]::SetProcessDPIAware()
$r=New-Object YimuObservedClick+RECT
[YimuObservedClick]::GetWindowRect([IntPtr]$WindowHandle,[ref]$r) | Out-Null
if(!$NoActivate){[YimuObservedClick]::SetForegroundWindow([IntPtr]$WindowHandle) | Out-Null}
[YimuObservedClick]::SetCursorPos(($r.L+$X),($r.T+$Y)) | Out-Null
Start-Sleep -Milliseconds 150
[YimuObservedClick]::mouse_event($(if($Right){8}else{2}),0,0,0,[UIntPtr]::Zero)
[YimuObservedClick]::mouse_event($(if($Right){16}else{4}),0,0,0,[UIntPtr]::Zero)




