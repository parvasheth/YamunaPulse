@echo off
echo ========================================================
echo   YamunaPulse - Launching Public Shareable Cloud Tunnel
echo   Created by Parva Sheth
echo ========================================================
echo.
echo Routing traffic to local FastAPI on port 8000 using HTTP/2...
.\tools\cloudflared.exe tunnel --protocol http2 --url http://127.0.0.1:8000
pause
