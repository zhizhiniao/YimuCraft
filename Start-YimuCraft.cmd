@echo off
cd /d "%~dp0"
if exist "%LOCALAPPDATA%\Programs\YimuCraft\YimuCraft.exe" (
  start "" "%LOCALAPPDATA%\Programs\YimuCraft\YimuCraft.exe"
) else (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-local.ps1"
)
