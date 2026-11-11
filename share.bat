@echo off
echo ========================================================
echo   YamunaPulse - Launching Public Shareable Cloud Tunnel
echo   Created by Parva Sheth
echo ========================================================
echo.
echo Checking FastAPI backend on port 8000...
.\tools\cloudflared.exe tunnel --url http://127.0.0.1:8000
pause

