param([Parameter(Mandatory=$true)][string]$Source, [Parameter(Mandatory=$true)][string]$Destination, [switch]$Elevated)
$ErrorActionPreference = 'Stop'
$panelSource = Join-Path $Source 'ae-pack-panel.jsx'
$hostSource = Join-Path $Source 'adobe-host.jsx'
if (!(Test-Path -LiteralPath $panelSource) -or !(Test-Path -LiteralPath $hostSource)) { throw 'Panel source is missing' }
$hostFolder = Join-Path $Destination 'YimuCraft'
try { New-Item -ItemType Directory -Force -Path $hostFolder | Out-Null } catch {
  if ($Elevated) { throw }
  $quotedScript = $PSCommandPath.Replace("'", "''")
  $quotedSource = $Source.Replace("'", "''")
  $quotedDestination = $Destination.Replace("'", "''")
  $body = "& '$quotedScript' -Source '$quotedSource' -Destination '$quotedDestination' -Elevated"
  $encoded = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($body))
  $process = Start-Process -FilePath 'powershell.exe' -Verb RunAs -WindowStyle Hidden -Wait -PassThru -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-EncodedCommand',$encoded)
  if ($process.ExitCode -ne 0) { throw 'Administrator installation did not complete' }
  exit 0
}
Copy-Item -LiteralPath $panelSource -Destination (Join-Path $Destination '一幕工程打包.jsx') -Force
Copy-Item -LiteralPath $hostSource -Destination (Join-Path $hostFolder 'host.jsx') -Force
