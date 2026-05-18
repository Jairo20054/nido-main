# Prisma en Windows + OneDrive

## Problema

En Windows, Prisma genera y reemplaza binarios nativos dentro de `node_modules/.prisma/client`. Si un proceso `node.exe` mantiene cargado `query_engine-windows.dll.node`, Windows no permite el `rename` atómico y Prisma falla con `EPERM`.

Cuando el proyecto vive dentro de OneDrive, el riesgo aumenta por:

- sincronización y reindexación sobre `node_modules`
- antivirus / Files On-Demand / reparse points
- reintentos sobre archivos temporales `.tmp*` creados por Prisma

## Política recomendada

1. Desarrollar fuera de OneDrive.
2. No ejecutar `prisma generate` con backend, `nodemon` o `npm run dev` activos.
3. Usar `npm run prisma:generate` para que el script seguro cierre procesos del proyecto, limpie temporales y regenere Prisma.
4. Usar `npm run prisma:doctor` para diagnosticar bloqueos antes de una limpieza manual.

## Ruta recomendada

```powershell
C:\dev\nido
```

## Nota de equipo

No se debe usar una carpeta sincronizada por OneDrive, Dropbox o Google Drive como workspace activo de Node/Prisma. Los repositorios pueden versionarse en Git y respaldarse remotamente sin exponer `node_modules` y binarios nativos a herramientas de sincronización de archivos.
