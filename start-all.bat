@echo off
REM Script completo para iniciar todo lo necesario

setlocal enabledelayedexpansion

echo ============================================
echo NIDO - Sistema de Inicio Completo
echo ============================================
echo.

REM Verificar si Docker está corriendo
echo Verificando Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo Error: Docker no está corriendo. Por favor:
    echo 1. Abre Docker Desktop
    echo 2. Espera a que esté completamente iniciado
    echo 3. Ejecuta este script nuevamente
    pause
    exit /b 1
)

echo Docker está corriendo. Iniciando servicios...
echo.

REM Iniciar Docker Compose en background
docker-compose up -d

if errorlevel 1 (
    echo Error al iniciar Docker Compose
    pause
    exit /b 1
)

echo Esperando a que PostgreSQL esté disponible (10 segundos)...
timeout /t 10 /nobreak

echo.
echo Iniciando backend NIDO...
echo.

REM Iniciar el backend
npm start

pause
