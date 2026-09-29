@echo off
title Dhobi Website

echo ================================
echo   Starting Dhobi Website...
echo ================================
echo.

echo [1/2] Starting Backend (port 5000)...
start "Backend" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Frontend (port 5173)...
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ================================
echo   Both servers are starting!
echo   Backend  -> http://localhost:5000
echo   Frontend -> http://localhost:5173
echo ================================
echo.
pause
