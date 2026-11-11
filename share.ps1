Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  YamunaPulse - Launching Public Shareable Cloud Tunnel" -ForegroundColor White
Write-Host "  Created by Parva Sheth" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Routing public HTTPS traffic directly to local FastAPI + React build (port 8000)..." -ForegroundColor Green
Write-Host "Press Ctrl+C to terminate tunnel at any time." -ForegroundColor Gray
Write-Host ""
& ".\tools\cloudflared.exe" tunnel --url http://127.0.0.1:8000

