@echo off
echo Opening Peerless Demo...
echo Host: http://localhost:3000/host
echo Client: http://localhost:3000/client
echo.
timeout /t 2 /nobreak >nul
start http://localhost:3000/host
timeout /t 1 /nobreak >nul
start http://localhost:3000/client
