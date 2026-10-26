param([Parameter(Mandatory=$true)][string]$ReportPath)
$ErrorActionPreference = 'Stop'
$report = Get-Content -LiteralPath $ReportPath -Raw | ConvertFrom-Json
if (-not $report.passed) { throw '连接和重启验证未通过，禁止清理' }
$profileRoot = [IO.Path]::GetFullPath((Join-Path $env:APPDATA 'YimuCraft'))
$target = [IO.Path]::GetFullPath((Join-Path $profileRoot 'library'))
$resolved = (Resolve-Path -LiteralPath $target).Path
if ($resolved -ne 'C:\Users\Administrator\AppData\Roaming\YimuCraft\library' -or $resolved -ne $target) { throw '旧库删除路径不匹配' }
if ($report.connected.location -eq $target -or -not $report.connected.location.StartsWith((Join-Path $profileRoot 'linked-libraries'),[StringComparison]::OrdinalIgnoreCase)) { throw '新库路径不匹配' }
if (Get-CimInstance Win32_Process -Filter "name='YimuCraft.exe'" | Where-Object { $_.CommandLine -notmatch 'app\.asar[\\/]src[\\/]agent-mcp\.cjs' }) { throw '请先退出一幕以关闭库' }
$items = @(Get-ChildItem -LiteralPath $target -Recurse -Force)
if ((Get-Item -LiteralPath $target).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw '旧库为链接，停止' }
if ($items | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }) { throw '旧库含链接，停止' }
$evidence = Split-Path -Parent $ReportPath
$items | Select-Object FullName,Length,Attributes | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $evidence 'deleted-inventory.json') -Encoding utf8
$files = @($items | Where-Object { -not $_.PSIsContainer })
$bytes = ($files | Measure-Object -Property Length -Sum).Sum
$configPath = Join-Path $profileRoot 'library-config.json'
$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
if ($config.library -ne $report.connected.location) { throw '当前库不等于已验证目标' }
# Only the explicit old application-owned library is removed; never traverse D:.
Remove-Item -LiteralPath $target -Recurse -Force
$config.recent = @($config.recent | Where-Object { [IO.Path]::GetFullPath($_) -ne $target })
$config | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $configPath -Encoding utf8
$result = @{target=$target;files=$files.Count;bytes=$bytes;oldLibraryAbsent=(-not (Test-Path -LiteralPath $target));newLibrary=$config.library;source='D:\00-aetodo.library';time=(Get-Date -Format o)}
$result | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $evidence 'cleanup.json') -Encoding utf8
$result | ConvertTo-Json

