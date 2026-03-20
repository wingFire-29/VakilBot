@echo off
echo ==========================================
echo  Starting VakilBot...
echo ==========================================

echo [1/2] Starting Backend Server (Port 8000)...
start "VakilBot Backend" cmd /k "cd /d %~dp0backend && ..\venv\Scripts\activate.bat && python manage.py runserver"

echo [2/2] Installing Dependencies and Starting Frontend Server (Port 5173)...
start "VakilBot Frontend" cmd /k "cd /d %~dp0frontend && npm install && npm run dev"

echo.
echo ==========================================
echo  Servers are starting up!
echo ==========================================
echo.
echo - Frontend running at: http://localhost:5173
echo - Backend running at:  http://localhost:8000
echo - Django Admin at:     http://localhost:8000/admin
echo.
echo Keep both new black command windows open. Close them to stop the servers.
pause
