@echo off
echo ================================================
echo  Dhobi Service Website - Installation Script
echo ================================================
echo.

echo Step 1: Installing Backend Dependencies...
cd server
call npm install
if errorlevel 1 (
    echo Error: Backend installation failed!
    pause
    exit /b 1
)
cd ..
echo Backend dependencies installed successfully!
echo.

echo Step 2: Installing Frontend Dependencies...
call npm install
if errorlevel 1 (
    echo Error: Frontend installation failed!
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo ================================================
echo  Installation Complete!
echo ================================================
echo.
echo Next steps:
echo 1. Import database: server/config/database.sql into MySQL
echo 2. Configure server/.env with your MySQL credentials
echo 3. Run backend: cd server ^&^& npm run dev
echo 4. Run frontend: npm run dev
echo.
echo Read SETUP_GUIDE.md for detailed instructions
echo ================================================
pause
