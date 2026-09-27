@echo off
title CropGuard AI - Mobile App (Expo)

:: Ensure the command runs from the mobile_app directory
cd /d "%~dp0\mobile_app"

echo ============================================================
echo   CropGuard AI: React Native / Expo Mobile App
echo ============================================================
echo Project Directory: %CD%
echo.
echo Launching Expo Metro Bundler...
echo - To test on your physical phone: Install 'Expo Go' from Play Store and scan the QR code.
echo - To test in browser: Press 'w' after the server starts.
echo.
call npx expo start --port 8082
pause
