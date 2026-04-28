@echo off
setlocal enabledelayedexpansion

echo.
echo  ============================================
echo   GymSync - Setup ^& Run
echo  ============================================
echo.

:: ── Check prerequisites ──────────────────────────────────────────────────────

echo [1/5] Checking prerequisites...

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: Node.js is not installed.
    echo  Download from: https://nodejs.org  (v18 or higher^)
    pause & exit /b 1
)
for /f "tokens=1" %%v in ('node -v') do echo  Node.js  %%v  OK

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: npm is not installed.
    pause & exit /b 1
)
for /f "tokens=1" %%v in ('npm -v') do echo  npm      %%v  OK

where dotnet >nul 2>&1
if %errorlevel% neq 0 (
    echo  ERROR: .NET SDK is not installed.
    echo  Download from: https://dotnet.microsoft.com/download  (.NET 9^)
    pause & exit /b 1
)
for /f "tokens=1,2" %%a in ('dotnet --version') do echo  .NET     %%a  OK

echo.

:: ── Frontend dependencies ─────────────────────────────────────────────────────

echo [2/5] Installing frontend dependencies...
cd /d "%~dp0FrontEnd\gymsync"
call npm install
if %errorlevel% neq 0 (
    echo  ERROR: npm install failed.
    pause & exit /b 1
)
echo  Frontend dependencies installed.
echo.

:: ── Backend NuGet restore ─────────────────────────────────────────────────────

echo [3/5] Restoring backend NuGet packages...
cd /d "%~dp0"
call dotnet restore GymTracker.sln
if %errorlevel% neq 0 (
    echo  ERROR: dotnet restore failed.
    pause & exit /b 1
)
echo  Backend packages restored.
echo.

:: ── Database migration ────────────────────────────────────────────────────────

echo [4/5] Applying database migrations...
cd /d "%~dp0GymTracker.API"
call dotnet ef database update --project ..\GymTracker.Infrastructure\GymTracker.Infrastructure.csproj --startup-project .
if %errorlevel% neq 0 (
    echo  WARNING: Database migration failed.
    echo  Make sure SQL Server LocalDB is installed and running.
    echo  Download from: https://aka.ms/sqllocaldb
    echo.
    echo  Continuing anyway — you can run migrations manually later:
    echo    cd GymTracker.API
    echo    dotnet ef database update --project ..\GymTracker.Infrastructure\GymTracker.Infrastructure.csproj --startup-project .
    echo.
)
echo  Database ready.
echo.

:: ── Start both servers ────────────────────────────────────────────────────────

echo [5/5] Starting servers...
echo.
echo  Backend  →  http://localhost:5170
echo  Frontend →  http://localhost:5173
echo  Swagger  →  http://localhost:5170/swagger
echo.
echo  Press Ctrl+C in each window to stop.
echo.

:: Start backend in a new window
start "GymSync API" cmd /k "cd /d "%~dp0GymTracker.API" && dotnet run --launch-profile http"

:: Wait 3 seconds for the API to start before launching frontend
timeout /t 3 /nobreak >nul

:: Start frontend in a new window
start "GymSync Frontend" cmd /k "cd /d "%~dp0FrontEnd\gymsync" && npm run dev"

echo  Both servers are starting in separate windows.
echo.
echo  ============================================
echo   Setup complete!
echo  ============================================
echo.
pause
