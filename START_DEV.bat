@echo off
REM Start both frontend and backend development servers
echo Starting Dhobi Website Development Environment...
echo.

REM Create two terminal windows
echo Starting Frontend (Vite dev server on port 5173)...
start cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak

echo Starting Backend (Express server on port 5000)...
start cmd /k "cd backend && npm start"

echo.
echo Both servers starting in separate windows...
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
