# Historial de cambios de NIDO

Ultima actualizacion: 2026-04-27

## 2026-04-27

### Agregado

- Nueva base de documentacion tecnica en:
  - `docs/README.md`
  - `docs/architecture.md`
  - `docs/flows.md`
  - `docs/modules.md`
  - `docs/api.md`
  - `docs/data-model.md`
  - `docs/setup.md`
  - `docs/diagrams/architecture.md`
  - `docs/diagrams/flows.md`
  - `docs/diagrams/README.md`

### Cambiado

- Se reescribio la documentacion para reflejar el codigo actual en lugar de supuestos heredados.
- Se documento explicitamente el modelo de persistencia hibrido:
  - Supabase para auth y perfiles
  - Prisma para propiedades, favoritos y solicitudes de arriendo
  - localStorage para el estado del borrador de la postulacion guiada
- Se documento que el flujo guiado de postulacion solo se persiste parcialmente del lado servidor.
- Se documentaron assets desactualizados o inconsistentes:
  - `.env.example`
  - `backend/prisma/seed.js`
  - `.github/workflows/ci.yml`
  - `Dockerfile`
  - `docker-compose.yml`
  - `backend/types/database.ts`

### Corregido

- Se monto el router existente de `requests` en `backend/src/routes.js`, alineando el backend con las llamadas del frontend a:
  - `GET /api/requests/mine`
  - `GET /api/requests/received`
  - `POST /api/requests`
  - `PATCH /api/requests/:id`
  - `PATCH /api/requests/:id/status`
  - `DELETE /api/requests/:id`

### Pendiente de validacion

- Requiere revision del equipo: definir si Prisma o Supabase debe ser la fuente canonica para propiedades y estado de postulacion.
- Pendiente de validacion: confirmar si los archivos de Docker y CI deben actualizarse o eliminarse en una iteracion posterior.
