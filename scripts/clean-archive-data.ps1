# One-off cleanup for the user-authorized 0.7.34 archive. Does not touch user libraries.
[CmdletBinding()]
param([switch]$Execute, [switch]$IncludeCurrentTestTemp)
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Split-Path $PSScriptRoot -Parent)).TrimEnd('\')
if ($projectRoot -ne 'K:\Codex\YimuCraft') { throw 'This one-off cleanup only supports the audited workspace.' }
$version = (Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json).version
if ($version -ne '0.7.34') { throw 'Archive version changed; review cleanup targets again.' }
$cacheRoot = [IO.Path]::GetFullPath((Join-Path $env:LOCALAPPDATA 'YimuCraft-installer-cache')).TrimEnd('\')
$targets = [Collections.Generic.List[string]]::new()
foreach ($item in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'release') -Force) {
    if ($item.Name -ne $version) { $targets.Add($item.FullName) }
}
foreach ($item in Get-ChildItem -LiteralPath (Join-Path $projectRoot 'work') -Force) {
    if ($IncludeCurrentTestTemp -or $item.Name -notin @('archive-test-temp','archive-first-launch')) { $targets.Add($item.FullName) }
}
foreach ($relative in @('private-analysis','reference\aetodo-user-reference.png')) {
    $candidate = Join-Path $projectRoot $relative
    if (Test-Path -LiteralPath $candidate) { $targets.Add($candidate) }
}
if (Test-Path -LiteralPath $cacheRoot) { $targets.Add($cacheRoot) }
# Retain textual verification records, remove old screenshot data.
Get-ChildItem -LiteralPath (Join-Path $projectRoot 'evidence') -File -Recurse -Filter '*.png' |
    Where-Object { $_.FullName -notlike '*\developer-archive-20261022\*' } |
    ForEach-Object { $targets.Add($_.FullName) }
$reportDir = Join-Path $projectRoot 'evidence\developer-archive-20261022'
New-Item -ItemType Directory -Force -Path $reportDir | Out-Null
$runId = Get-Date -Format 'yyyyMMdd-HHmmss'
$plan = Join-Path $reportDir "cleanup-$runId.jsonl"
$deleted = 0
foreach ($target in $targets) {
    $full = [IO.Path]::GetFullPath($target).TrimEnd('\')
    $withinProject = $full.StartsWith($projectRoot + '\', [StringComparison]::OrdinalIgnoreCase)
    if (!$withinProject -and $full -ne $cacheRoot) { throw "Out of scope: $full" }
    if ($full -eq (Join-Path $projectRoot 'release\0.7.34') -or $full.StartsWith((Join-Path $projectRoot 'src') + '\')) { throw 'Protected target' }
    $item = Get-Item -LiteralPath $full -Force
    if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw "Review reparse target before removal: $full" }
    @{path=$full;phase='planned';execute=[bool]$Execute} | ConvertTo-Json -Compress | Add-Content -LiteralPath $plan
    if ($Execute) {
        Remove-Item -LiteralPath $full -Recurse -Force
        if (Test-Path -LiteralPath $full) { throw "Removal incomplete: $full" }
        $deleted++
        @{path=$full;phase='deleted'} | ConvertTo-Json -Compress | Add-Content -LiteralPath $plan
        if ($deleted % 100 -eq 0) { Write-Output "Deleted $deleted / $($targets.Count) targets" }
    }
}
Write-Output "Cleanup complete: deleted=$deleted planned=$($targets.Count) report=$plan"
