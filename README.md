# NIDO

Aplicación web para arriendo residencial con frontend en React/Vite y backend en Express/Prisma.

## Estructura

```text
nido-main/
|-- frontend/        # Cliente React, Vite, estilos y assets publicos
|-- backend/         # API Express, modulos de dominio y Prisma
|   |-- prisma/      # Schema y seed de base de datos
|   `-- src/         # App, rutas, modulos y utilidades compartidas
|-- docs/            # Guias, reportes, checklists y referencias
|-- dist/            # Build generado del frontend
|-- package.json     # Scripts unificados del proyecto
`-- server.js        # Entrada ligera para iniciar la API
```

## Scripts

```bash
npm run dev
npm run dev:frontend
npm run dev:backend
npm run build
npm run preview
npm run prisma:generate
npm run prisma:push
npm run prisma:seed
```

## Documentacion

- Las guias practicas quedaron en `docs/guides/`.
- Los entregables y reportes quedaron en `docs/reports/`.
- Los checklists quedaron en `docs/checklists/`.
- Las referencias tecnicas quedaron en `docs/references/`.
- Los pendientes quedaron en `docs/todos/`.

Empieza por `docs/guides/README.md` para ubicarte rapido.
