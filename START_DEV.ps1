# Start Dhobi Website Development Environment

Write-Host "Starting Dhobi Website Development Environment..." -ForegroundColor Green
Write-Host ""

# Start Frontend
Write-Host "Starting Frontend (Vite dev server on port 5173)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command cd frontend; npm run dev"

Start-Sleep -Seconds 2

# Start Backend
Write-Host "Starting Backend (Express server on port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command cd backend; npm start"

Write-Host ""
Write-Host "Both servers starting in separate windows..." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Yellow
