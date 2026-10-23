param(
  [int]$SourcePid, [long]$SourceHandle,
  [int]$ClientX, [int]$ClientY,
  [int]$TargetPid, [long]$TargetHandle,
  [int]$TargetClientX, [int]$TargetClientY,
  [double]$TargetFractionX = 0, [double]$TargetFractionY = 0,
  [string]$Trigger, [string]$GoMarker, [string]$ReleaseMarker, [string]$RetryMarker, [string]$AttemptDir, [string]$Out,
  [int]$HoldTimeoutMs = 8000, [int]$MoveSteps = 12
)
$ErrorActionPreference = 'Stop'
# D01 synthetic pointer gesture: press on a library card, start the native drag,
# travel to an independent receiver window on another display, release there.
#
# Measured facts that shaped this script (see docs/HANDOFF.md section 8):
#  * Relative mouse_event motion is unusable on this machine (a +7 mickey
#    request threw the pointer thousands of pixels); absolute SetCursorPos is
#    exact, so the whole gesture is expressed as absolute steps.
#  * The desktop mixes DPIs and a display sits at a negative origin, so each
#    endpoint is converted from the owning window's client CSS pixels through
#    that window's own DPI and ClientToScreen. No global scale is assumed.
#  * The first press can be spent activating the window, so an activation click
#    is sent and activation re-verified before the real press.
Add-Type @'
using System;using System.Runtime.InteropServices;
public static class YimuPointer{
[StructLayout(LayoutKind.Sequential)]public struct POINT{public int X,Y;}
[StructLayout(LayoutKind.Sequential)]public struct RECT{public int Left,Top,Right,Bottom;}
[DllImport("user32.dll")]public static extern bool GetCursorPos(out POINT p);
[DllImport("user32.dll")]public static extern bool SetCursorPos(int x,int y);
[DllImport("user32.dll")]public static extern bool ClientToScreen(IntPtr h, ref POINT p);
[DllImport("user32.dll")]public static extern IntPtr WindowFromPoint(POINT p);
[DllImport("user32.dll")]public static extern IntPtr GetAncestor(IntPtr h,uint f);
[DllImport("user32.dll")]public static extern uint GetWindowThreadProcessId(IntPtr w,out uint pid);
[DllImport("user32.dll")]public static extern void mouse_event(uint f,uint x,uint y,uint d,UIntPtr e);
[DllImport("user32.dll")]public static extern IntPtr SetThreadDpiAwarenessContext(IntPtr c);
[DllImport("user32.dll")]public static extern uint GetDpiForWindow(IntPtr h);
[DllImport("user32.dll")]public static extern bool GetWindowRect(IntPtr h, out RECT r);
[DllImport("user32.dll")]public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll")]public static extern bool SetForegroundWindow(IntPtr h);
[DllImport("user32.dll")]public static extern short GetAsyncKeyState(int vKey);
[DllImport("user32.dll")]public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
}
'@
[void][YimuPointer]::SetThreadDpiAwarenessContext([IntPtr](-4))
$result = [ordered]@{}
function Note([string]$name, $value) { $script:result[$name] = $value }
function Save() { [IO.File]::WriteAllText($Out, ($result | ConvertTo-Json -Compress -Depth 6), [Text.UTF8Encoding]::new($false)) }

# SetCursorPos is not always honoured on the first call after the pointer has
# been idle: a measured request for (845,342) landed at (8,1486), while later
# requests were pixel exact (work/pointer-travel.json). Every move is therefore
# verified by reading the pointer back and repeated until it matches.
function Move-Pointer([int]$x, [int]$y, [int]$tries = 10) {
  $probe = New-Object YimuPointer+POINT
  for ($i = 0; $i -lt $tries; $i++) {
    [void][YimuPointer]::SetCursorPos($x, $y)
    Start-Sleep -Milliseconds 60
    [void][YimuPointer]::GetCursorPos([ref]$probe)
    $firstX = $probe.X; $firstY = $probe.Y
    if ([Math]::Abs($firstX - $x) -gt 1 -or [Math]::Abs($firstY - $y) -gt 1) { continue }
    # The pointer is also moved by whatever else is using this desktop (measured
    # drift of 268 px while idle), so the position must hold across two reads.
    Start-Sleep -Milliseconds 70
    [void][YimuPointer]::GetCursorPos([ref]$probe)
    if ([Math]::Abs($probe.X - $x) -le 1 -and [Math]::Abs($probe.Y - $y) -le 1) { return $true }
  }
  return $false
}

function Resolve-Point([int]$handle, [int]$clientX, [int]$clientY, [string]$label) {
  $h = [IntPtr]$handle
  $owner = [uint32]0
  [void][YimuPointer]::GetWindowThreadProcessId($h, [ref]$owner)
  $dpi = [YimuPointer]::GetDpiForWindow($h)
  $scale = $dpi / 96.0
  $pt = New-Object YimuPointer+POINT
  $pt.X = [int][Math]::Round($clientX * $scale)
  $pt.Y = [int][Math]::Round($clientY * $scale)
  if (-not [YimuPointer]::ClientToScreen($h, [ref]$pt)) { throw "ClientToScreen failed for $label" }
  return [pscustomobject]@{ owner = $owner; dpi = $dpi; scale = $scale; x = $pt.X; y = $pt.Y }
}

# 1. Resolve press point (and the drop point when a target window is given).
$src = Resolve-Point $SourceHandle $ClientX $ClientY 'source'
if ($src.owner -ne $SourcePid) { throw "Source handle belongs to pid $($src.owner), expected $SourcePid" }
Note 'source' @{ dpi = $src.dpi; scale = $src.scale; screen = @{ x = $src.x; y = $src.y } }
$X = $src.x; $Y = $src.y
$TX = 0; $TY = 0
if ($TargetHandle -ne 0) {
  if ($TargetFractionX -gt 0 -and $TargetFractionY -gt 0) {
    # Fractional target: used when the receiving application is not ours and its
    # client size is only known at runtime (for example Premiere's timeline).
    $th = [IntPtr]$TargetHandle
    $town = [uint32]0
    [void][YimuPointer]::GetWindowThreadProcessId($th, [ref]$town)
    if ($town -ne $TargetPid) { throw "Target handle belongs to pid $town, expected $TargetPid" }
    $tdpi = [YimuPointer]::GetDpiForWindow($th)
    $tscale = $tdpi / 96.0
    $tr = New-Object YimuPointer+RECT
    if (-not [YimuPointer]::GetWindowRect($th, [ref]$tr)) { throw 'GetWindowRect failed for the target window' }
    $width = $tr.Right - $tr.Left
    $height = $tr.Bottom - $tr.Top
    $ptt = New-Object YimuPointer+POINT
    $ptt.X = $tr.Left + [int][Math]::Round($width * $TargetFractionX)
    $ptt.Y = $tr.Top + [int][Math]::Round($height * $TargetFractionY)
    Note 'target' @{ dpi = $tdpi; scale = $tscale; window = @{ left = $tr.Left; top = $tr.Top; width = $width; height = $height }; screen = @{ x = $ptt.X; y = $ptt.Y } }
    $TX = $ptt.X; $TY = $ptt.Y
  } else {
    $dst = Resolve-Point $TargetHandle $TargetClientX $TargetClientY 'target'
    if ($dst.owner -ne $TargetPid) { throw "Target handle belongs to pid $($dst.owner), expected $TargetPid" }
    Note 'target' @{ dpi = $dst.dpi; scale = $dst.scale; screen = @{ x = $dst.x; y = $dst.y } }
    $TX = $dst.x; $TY = $dst.y
  }
}

# 2. Park the pointer on the card and prove the application owns that pixel.
[void][YimuPointer]::SetCursorPos($X, $Y)
Start-Sleep -Milliseconds 120
$p = New-Object YimuPointer+POINT
[void][YimuPointer]::GetCursorPos([ref]$p)
Note 'cursor' @{ x = $p.X; y = $p.Y }
$placed = Move-Pointer $X $Y
[void][YimuPointer]::GetCursorPos([ref]$p)
Note 'cursorVerified' @{ x = $p.X; y = $p.Y; exact = $placed }
if (-not $placed) { throw "Pointer settles at ($($p.X),$($p.Y)) instead of ($X,$Y)" }
$hit = [YimuPointer]::WindowFromPoint($p)
$hitPid = [uint32]0
[void][YimuPointer]::GetWindowThreadProcessId($hit, [ref]$hitPid)
$root = [YimuPointer]::GetAncestor($hit, 2)
Note 'hitPid' $hitPid
if ($hitPid -ne $SourcePid) { throw "Point ($X,$Y) belongs to pid $hitPid, expected $SourcePid; no input sent" }

# 3. Wait for the application to be foreground. No synthetic click is used here:
#    a measured run showed that an activation click consumed the following press
#    (foreground switched correctly, yet the renderer saw mousedown 0), so the
#    owning process raises itself instead and this side only verifies.
$fgPid = [uint32]0
$waited = 0
while ($waited -lt 4000) {
  [void][YimuPointer]::GetWindowThreadProcessId([YimuPointer]::GetForegroundWindow(), [ref]$fgPid)
  if ($fgPid -eq $SourcePid) { break }
  Start-Sleep -Milliseconds 100
  $waited += 100
}
Note 'foregroundPid' $fgPid
Note 'foregroundWaitMs' $waited
Note 'buttonBeforePress' (([YimuPointer]::GetAsyncKeyState(1) -band 0x8000) -ne 0)
# Not being foreground is not fatal: a press on a visible window activates it,
# and if that press is consumed the Node-side observer reports it and the press is
# repeated (see the retry loop below). Only make a best-effort raise here.
if ($fgPid -ne $SourcePid) { [void][YimuPointer]::SetForegroundWindow($root) }
[void](Move-Pointer $X $Y)
Start-Sleep -Milliseconds 120

# 4. Press and step inside the card until the native drag starts. Node writes
#    GoMarker when main ran startDrag. If Node proves the press never reached the
#    renderer it writes RetryMarker, and the press is repeated - a press that was
#    swallowed by window activation is retried, while a press that did arrive is
#    never repeated blindly.
$down = $false
$goSeen = $false
$attempt = 0
try {
  while ($attempt -lt 3 -and -not $goSeen) {
    $attempt++
    [void](Move-Pointer $X $Y)
    Start-Sleep -Milliseconds 120
    [YimuPointer]::mouse_event(2, 0, 0, 0, [UIntPtr]::Zero)
    $down = $true
    'down' | Set-Content -LiteralPath $Trigger
    Start-Sleep -Milliseconds 180
    $moved = New-Object YimuPointer+POINT
    $path = @()
    for ($i = 1; $i -le 6; $i++) {
      [void](Move-Pointer ($X + 6 * $i) $Y)
      Start-Sleep -Milliseconds 45
      [void][YimuPointer]::GetCursorPos([ref]$moved)
      $path += @{ x = $moved.X; y = $moved.Y }
    }
    Note "pressPath$attempt" $path
    Note 'phase' "pressed-$attempt"
    Save
    if ($AttemptDir) { Set-Content -LiteralPath (Join-Path $AttemptDir "attempt-$attempt") -Value $attempt }

    $waited = 0
    while ($waited -lt 2500 -and -not (Test-Path -LiteralPath $GoMarker) -and -not (Test-Path -LiteralPath $RetryMarker)) {
      Start-Sleep -Milliseconds 50
      $waited += 50
    }
    if (Test-Path -LiteralPath $GoMarker) { $goSeen = $true; break }
    [YimuPointer]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero)
    $down = $false
    if (Test-Path -LiteralPath $RetryMarker) { Remove-Item -LiteralPath $RetryMarker -Force }
    Start-Sleep -Milliseconds 400
  }
  Note 'attempts' $attempt
  Note 'goSeen' $goSeen
  Save

  if ($goSeen) {
    if ($TargetHandle -ne 0) {
      # 5a. Travel to the receiver in evenly spaced absolute steps, dwell, release.
      $startX = $X + 36; $startY = $Y
      $travel = @()
      for ($i = 1; $i -le $MoveSteps; $i++) {
        $nx = [int][Math]::Round($startX + ($TX - $startX) * $i / $MoveSteps)
        $ny = [int][Math]::Round($startY + ($TY - $startY) * $i / $MoveSteps)
        [void](Move-Pointer $nx $ny)
        Start-Sleep -Milliseconds 40
        [void][YimuPointer]::GetCursorPos([ref]$moved)
        $travel += @{ x = $moved.X; y = $moved.Y }
      }
      Note 'travelPath' $travel
      [void][YimuPointer]::GetCursorPos([ref]$moved)
      $hitAtDrop = [YimuPointer]::WindowFromPoint($moved)
      $dropPid = [uint32]0
      [void][YimuPointer]::GetWindowThreadProcessId($hitAtDrop, [ref]$dropPid)
      Note 'hitPidAtDropPoint' $dropPid
      if ($TargetPid -ne 0 -and $dropPid -ne $TargetPid) {
        # Never release over an application that was not the intended target: the
        # drop would hand files to whatever window happens to be on top. Escape
        # cancels the OLE drag; the button-up in finally then does nothing.
        Note 'targetMismatch' $true
        Note 'aborted' 'drop point does not belong to the requested target pid'
        [YimuPointer]::keybd_event(0x1B, 0, 0, [UIntPtr]::Zero)
        Start-Sleep -Milliseconds 120
        [YimuPointer]::keybd_event(0x1B, 0, 2, [UIntPtr]::Zero)
      } else {
        Start-Sleep -Milliseconds 400
      }
    } else {
      # 5b. In-place mode: Node moves a window under the pointer and then signals
      # Release. OLE only re-runs its drop-target hit test when the pointer moves,
      # so the pointer is kept in small motion until the release arrives; without
      # this the drag keeps the target chosen at drag start and the drop goes to
      # the wrong window.
      $waited2 = 0
      $jiggle = 0
      $dropPid = [uint32]0
      while ($waited2 -lt 9000) {
        if (Test-Path -LiteralPath $ReleaseMarker) { break }
        $jiggle++
        $dx = if ($jiggle % 2 -eq 0) { 2 } else { -2 }
        [void](Move-Pointer ($X + 36 + $dx) ($Y + 2))
        Start-Sleep -Milliseconds 90
        $waited2 += 90
      }
      Note 'releaseSeen' (Test-Path -LiteralPath $ReleaseMarker)
      Note 'releaseWaitMs' $waited2
      Note 'jiggleSteps' $jiggle
      [void][YimuPointer]::GetCursorPos([ref]$moved)
      $hitAtDrop = [YimuPointer]::WindowFromPoint($moved)
      [void][YimuPointer]::GetWindowThreadProcessId($hitAtDrop, [ref]$dropPid)
      Note 'hitPidAtDropPoint' $dropPid
    }
  }
  Note 'phase' 'releasing'
  Save
} finally {
  if ($down) { [YimuPointer]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero) }
}
Start-Sleep -Milliseconds 200
$p2 = New-Object YimuPointer+POINT
[void][YimuPointer]::GetCursorPos([ref]$p2)
Note 'cursorAtRelease' @{ x = $p2.X; y = $p2.Y }
Note 'phase' 'released'
Save
Write-Output ($result | ConvertTo-Json -Compress -Depth 6)
