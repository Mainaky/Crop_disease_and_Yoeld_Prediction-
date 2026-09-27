@echo off
title CropGuard AI - Backend Server

:: Ensure the command runs from the project directory
cd /d "%~dp0"

echo ============================================================
echo   CropGuard AI: FastAPI ML Backend Server
echo   Running Disease Classification & Yield Forecasting Engine
echo ============================================================
echo Project Directory: %CD%
echo.
echo Local Wi-Fi Connection Info:
powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -match 'Wi-Fi' } | ForEach-Object { Write-Host ('  >> Connect Mobile App to: http://' + $_.IPAddress + ':8000') -ForegroundColor Green }"
echo.
echo Starting FastAPI on port 8000...
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
