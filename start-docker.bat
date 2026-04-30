@echo off
REM Script para iniciar Docker Compose con PostgreSQL y otros servicios

echo Iniciando servicios de Docker...
docker-compose up -d

if errorlevel 1 (
    echo Error al iniciar Docker Compose
    pause
    exit /b 1
)

echo Esperando a que PostgreSQL esté listo...
timeout /t 5 /nobreak

echo Servicios iniciados correctamente. Presiona una tecla para continuar...
pause
