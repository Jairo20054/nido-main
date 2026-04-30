@echo off
REM Script para ejecutar el servidor con debug detallado
cd /d "%~dp0"
echo Ejecutando servidor con debug detallado...
echo.
node backend/src/server-debug.js
pause
