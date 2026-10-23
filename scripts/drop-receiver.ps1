param([Parameter(Mandatory=$true)][string]$Receipt)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type 'using System;using System.Runtime.InteropServices;public static class YimuDropDpi{[DllImport("user32.dll")]public static extern bool SetProcessDPIAware();}'
[void][YimuDropDpi]::SetProcessDPIAware()
$form=New-Object Windows.Forms.Form
$form.Text='YimuCraft 独立拖放验证窗口'
$form.StartPosition='Manual';$form.Location=New-Object Drawing.Point(300,1800);$form.Size=New-Object Drawing.Size(500,500)
$form.AllowDrop=$true;$form.TopMost=$true
$label=New-Object Windows.Forms.Label
$label.Text='独立测试接收器：只记录拖入文件路径，不修改文件';$label.AutoSize=$false;$label.Dock='Fill';$label.TextAlign='MiddleCenter';$label.AllowDrop=$true
$form.Controls.Add($label)
$enter={param($sender,$eventArgs) if($eventArgs.Data.GetDataPresent([Windows.Forms.DataFormats]::FileDrop)){$eventArgs.Effect=[Windows.Forms.DragDropEffects]::Copy}}
$drop={param($sender,$eventArgs) $files=@($eventArgs.Data.GetData([Windows.Forms.DataFormats]::FileDrop));@{files=$files;count=$files.Count}|ConvertTo-Json -Compress|Set-Content -LiteralPath $Receipt -Encoding UTF8;$form.Close()}
$form.add_DragEnter($enter);$label.add_DragEnter($enter);$form.add_DragDrop($drop);$label.add_DragDrop($drop)
$form.add_Shown({@{pid=$PID;x=$form.PointToScreen([Drawing.Point]::new(250,250)).X;y=$form.PointToScreen([Drawing.Point]::new(250,250)).Y;screen=[Windows.Forms.Screen]::PrimaryScreen.Bounds.ToString();bounds=$form.Bounds.ToString()}|ConvertTo-Json -Compress|Set-Content -LiteralPath ($Receipt+'.ready') -Encoding UTF8})
$timer=New-Object Windows.Forms.Timer;$timer.Interval=25000;$timer.add_Tick({$form.Close()});$timer.Start()
[void]$form.ShowDialog();$timer.Dispose();$form.Dispose()
