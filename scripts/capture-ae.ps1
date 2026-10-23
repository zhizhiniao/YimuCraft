Add-Type -AssemblyName System.Drawing
Add-Type @'
using System;using System.Runtime.InteropServices;
public class YimuAeCapture{[StructLayout(LayoutKind.Sequential)]public struct RECT{public int L,T,R,B;}[DllImport("user32.dll")]public static extern bool GetWindowRect(IntPtr h,out RECT r);[DllImport("user32.dll")]public static extern bool PrintWindow(IntPtr h,IntPtr d,uint f);}
'@
Get-Process | Where-Object ProcessName -Like 'AfterFX*' | ForEach-Object {
 $handle=$_.MainWindowHandle
 if($handle -eq 0){return}
 $rect=New-Object YimuAeCapture+RECT
 [YimuAeCapture]::GetWindowRect($handle,[ref]$rect) | Out-Null
 if($rect.R-$rect.L -le 0 -or $rect.B-$rect.T -le 0){return}
 $bitmap=New-Object System.Drawing.Bitmap(($rect.R-$rect.L),($rect.B-$rect.T))
 $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
 $dc=$graphics.GetHdc()
 [YimuAeCapture]::PrintWindow($handle,$dc,2) | Out-Null
 $graphics.ReleaseHdc($dc)
 $file=Join-Path 'K:\Codex\YimuCraft\work' ('ae-window-'+$_.Id+'.png')
 $bitmap.Save($file)
 $graphics.Dispose();$bitmap.Dispose()
 [pscustomobject]@{pid=$_.Id;handle=$handle;title=$_.MainWindowTitle;capture=$file}
}
