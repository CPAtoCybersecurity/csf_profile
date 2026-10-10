@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\open-csf-profile.ps1"
if errorlevel 1 (
  echo.
  echo The app could not start. Read the message above, then press any key to close this window.
  pause >nul
)
