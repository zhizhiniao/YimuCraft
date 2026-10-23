$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json).version
$executable = Join-Path $projectRoot "release\$version\win-unpacked\YimuCraft.exe"
if (Test-Path -LiteralPath $executable) {
    Start-Process -FilePath $executable -WindowStyle Hidden
} else {
    Set-Location -LiteralPath $projectRoot
    $env:ELECTRON_RUN_AS_NODE = $null
    & npm.cmd start
    exit $LASTEXITCODE
}
