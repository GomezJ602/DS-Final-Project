@echo off
TITLE Fitness Pro - All in One Startup
echo ===================================================
echo   Fitness Pro - Data Structures Final Project
echo ===================================================
echo.

:: 1. Compile and Start Java Backend
echo [1/2] Starting Java Backend Server...
start "Java Backend" cmd /c "javac -d out -sourcepath src/main/java src/main/java/com/fitnesspro/api/BackendServer.java && java -cp out com.fitnesspro.api.BackendServer"

:: 2. Start React Frontend
echo [2/2] Starting React Frontend (Vite) and opening browser...
echo.
echo Your browser will open automatically to: http://localhost:5173
echo.
npm run dev

pause
