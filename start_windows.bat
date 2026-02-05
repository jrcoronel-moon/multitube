@echo off
cd /d "%~dp0"

echo Starting MultiTube...
echo This window will stay open to keep the server running.
echo You can close the app by clicking "Quit App" in the browser.

:: Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Run the server
node server.js

:: Pause if server crashes immediately
if %errorlevel% neq 0 (
    echo Server crashed or closed unexpectedly.
    pause
)
