$ErrorActionPreference='Stop'
$project=Split-Path $PSScriptRoot -Parent
$run=Join-Path $project ('evidence\folder-state-20261023\install-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))
New-Item -ItemType Directory -Path $run -Force | Out-Null
$dir=Join-Path $env:LOCALAPPDATA 'Programs\YimuCraft'
$exe=Join-Path $dir 'YimuCraft.exe'
$backup=Join-Path $dir ('YimuCraft-before-0751-'+(Get-Date -Format 'HHmmss')+'.exe')
$source=Join-Path $project 'release\0.7.51\YimuCraft Setup 0.7.51.exe'
$stage=Join-Path $env:LOCALAPPDATA 'YimuCraft-installer-cache\0.7.51'
New-Item -ItemType Directory -Path $stage -Force | Out-Null
$installer=Join-Path $stage 'YimuCraft Setup 0.7.51.exe'
Copy-Item -LiteralPath $source -Destination $installer
$report=[ordered]@{source=$source;installerHash=(Get-FileHash $source).Hash;passed=$false}
try {
 if((Get-FileHash $installer).Hash -ne $report.installerHash){throw 'Staging hash mismatch'}
 # Release the executable used by persistent MCP clients before NSIS replaces it.
 Get-CimInstance Win32_Process -Filter "Name='YimuCraft.exe'" | Where-Object { $_.ExecutablePath -eq $exe } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
 Move-Item -LiteralPath $exe -Destination $backup
 $report.backup=$backup
 $p=Start-Process -FilePath $installer -ArgumentList '/S','/currentuser','/KEEP_APP_DATA' -WindowStyle Hidden -Wait -PassThru
 $report.exitCode=$p.ExitCode
 if($p.ExitCode -ne 0){throw ('Installer failed: '+$p.ExitCode)}
 $report.asarHash=(Get-FileHash (Join-Path $dir 'resources\app.asar')).Hash
 if($report.asarHash -ne (Get-FileHash (Join-Path $project 'release\0.7.51\win-unpacked\resources\app.asar')).Hash){throw 'Installed ASAR mismatch'}
 $report.registeredVersion=(Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\02dcad96-f15a-5ce5-a907-2b2a9a724f95').DisplayVersion
 if($report.registeredVersion -ne '0.7.51'){throw 'Registry version mismatch'}
 $report.passed=$true
}catch{ $report.error=$_.Exception.Message; if(!(Test-Path -LiteralPath $exe) -and (Test-Path -LiteralPath $backup)){Move-Item -LiteralPath $backup -Destination $exe};throw }
finally{ $report | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $run 'report.json') -Encoding UTF8; $report | ConvertTo-Json }
