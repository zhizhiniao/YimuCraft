param([switch]$Open)
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$version=(Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json).version
$installer=Join-Path $projectRoot "release\$version\YimuCraft Setup $version.exe"
$installDir=Join-Path $env:LOCALAPPDATA 'Programs\YimuCraft'
$registry='HKCU:\Software\02dcad96-f15a-5ce5-a907-2b2a9a724f95'
$uninstallRegistry='HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\02dcad96-f15a-5ce5-a907-2b2a9a724f95'
$registered=(Get-ItemProperty -LiteralPath $registry -ErrorAction SilentlyContinue).InstallLocation
if($registered -and [IO.Path]::GetFullPath($registered).TrimEnd('\') -ne [IO.Path]::GetFullPath($installDir).TrimEnd('\')){throw "Installation location differs: $registered. This local helper only supports $installDir."}
if(!(Test-Path -LiteralPath $installer)){throw "Build installer first: $installer"}
$runId=Get-Date -Format 'yyyyMMdd-HHmmss-fff'
$evidence=Join-Path $projectRoot "evidence\upgrade-$runId"
$stage=Join-Path $env:LOCALAPPDATA "YimuCraft-installer-cache\$version\$runId"
New-Item -ItemType Directory -Force -Path $evidence,$stage | Out-Null
$staged=Join-Path $stage ([IO.Path]::GetFileName($installer))
$report=[ordered]@{version=$version;source=$installer;staged=$staged;installDir=$installDir;beforeVersion=(Get-ItemProperty -LiteralPath $uninstallRegistry -ErrorAction SilentlyContinue).DisplayVersion;passed=$false}
try {
  Copy-Item -LiteralPath $installer -Destination $staged
  $report.installerSHA256=(Get-FileHash -LiteralPath $installer -Algorithm SHA256).Hash
  if((Get-FileHash -LiteralPath $staged -Algorithm SHA256).Hash -ne $report.installerSHA256){throw 'Staged installer hash mismatch'}
  # Process-local environment only. Never pass the build workspace TEMP to an upgrade.
  $start=[Diagnostics.ProcessStartInfo]::new($staged)
  $start.UseShellExecute=$false
  $start.CreateNoWindow=$true
  $start.Arguments='/S /currentuser /KEEP_APP_DATA'
  $start.EnvironmentVariables['TEMP']=Join-Path $env:LOCALAPPDATA 'Temp'
  $start.EnvironmentVariables['TMP']=$start.EnvironmentVariables['TEMP']
  $process=[Diagnostics.Process]::Start($start)
  $report.pid=$process.Id
  $process.WaitForExit()
  $report.exitCode=$process.ExitCode
  if($process.ExitCode -ne 0){throw "Installer failed with exit code $($process.ExitCode); no manual overwrite attempted."}
  $report.registeredVersion=(Get-ItemProperty -LiteralPath $uninstallRegistry).DisplayVersion
  if($report.registeredVersion -ne $version){throw 'Installed registry version mismatch'}
  $report.installedAsarSHA256=(Get-FileHash -LiteralPath (Join-Path $installDir 'resources\app.asar') -Algorithm SHA256).Hash
  $expected=(Get-FileHash -LiteralPath (Join-Path $projectRoot "release\$version\win-unpacked\resources\app.asar") -Algorithm SHA256).Hash
  if($report.installedAsarSHA256 -ne $expected){throw 'Installed application hash mismatch'}
  $report.passed=$true
} catch {$report.error=$_.Exception.Message;throw} finally {$report | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $evidence 'install.json') -Encoding UTF8; $report | ConvertTo-Json -Depth 5}
if($Open){Start-Process -FilePath (Join-Path $installDir 'YimuCraft.exe')}
