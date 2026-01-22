@echo off
REM Kill any existing servers on port 8000
echo Checking for existing servers on port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    echo Killing process %%a
    taskkill /PID %%a /F 2>nul
)

REM Wait a moment for ports to be released
timeout /t 2 /nobreak >nul

REM Start the stable http-server
echo Starting development server on port 8000...
http-server -p 8000 -c-1 --cors
