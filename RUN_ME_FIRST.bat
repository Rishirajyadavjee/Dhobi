@echo off
cls
echo ====================================================
echo      DHOBI SERVICE WEBSITE - QUICK START
echo ====================================================
echo.
echo This script will help you get started quickly!
echo.
pause
echo.
echo ====================================================
echo  STEP 1: Starting Backend Server
echo ====================================================
echo.
echo Opening new window for backend...
start cmd /k "cd server && echo Backend Server Starting... && npm run dev"
echo.
echo [OK] Backend server window opened!
echo Backend will run on: http://localhost:5000
echo.
timeout /t 3 /nobreak > nul
echo.
echo ====================================================
echo  STEP 2: Starting Frontend Server
echo ====================================================
echo.
echo Opening new window for frontend...
start cmd /k "echo Frontend Server Starting... && npm run dev"
echo.
echo [OK] Frontend server window opened!
echo Frontend will run on: http://localhost:5173
echo.
echo ====================================================
echo  SETUP COMPLETE!
echo ====================================================
echo.
echo TWO windows have been opened:
echo   1. Backend Server  (port 5000)
echo   2. Frontend Server (port 5173)
echo.
echo IMPORTANT: Before you can login, you must:
echo   1. Start Laragon (if not already running)
echo   2. Import database: server/config/database.sql
echo      - Open: http://localhost/phpmyadmin
echo      - Click "Import" tab
echo      - Choose file: server/config/database.sql
echo      - Click "Go"
echo.
echo Once database is imported, open:
echo   http://localhost:5173
echo.
echo Demo Logins:
echo   Admin: admin@dhobi.com / admin123
echo   Dhobi: ramesh@dhobi.com / dhobi123
echo   User: user@dhobi.com / user123
echo.
echo ====================================================
echo  HAPPY CODING!
echo ====================================================
echo.
echo Press any key to close this window...
pause > nul
