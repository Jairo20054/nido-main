# Backend NIDO

Ultima actualizacion: 2026-04-27

Este documento describe el backend real de NIDO segun el codigo fuente actual en `backend/src`.

## Vision general

El backend de NIDO expone una API REST para:

- autenticacion de usuarios con Supabase Auth
- gestion de perfiles
- catalogo de propiedades
- favoritos
- precalificacion de postulaciones
- solicitudes formales de arriendo

Hoy existe una arquitectura hibrida:

- Supabase para autenticacion y algunos dominios (`profiles`, `applications`, `properties` en flujo de precalificacion)
- Prisma para catalogo, favoritos y solicitudes formales (`Property`, `Favorite`, `RentalRequest`)

## Proposito de NIDO desde el servidor

Desde backend, NIDO prioriza este objetivo operativo:

- permitir exploracion publica de inmuebles
- exigir autenticacion solo cuando hay acciones con trazabilidad
- crear un flujo de aplicacion progresivo (precalificacion -> checklist -> solicitud)
- mantener una API simple para frontend web

## Stack tecnologico

- Node.js + Express 4
- Joi para validacion
- Prisma ORM (`@prisma/client`) para parte del modelo relacional
- Supabase JS (`@supabase/supabase-js`) para Auth y tablas seleccionadas
- PostgreSQL (via `DATABASE_URL` para Prisma)

## Entrypoints backend

- entrada de proceso: `server.js` (raiz) -> `backend/src/server.js`
- bootstrap de app: `backend/src/app.js`
- router raiz API: `backend/src/routes.js`
- endpoint de salud: `GET /health`
- prefijo de API: `/api`

## Como correr el backend en local

1. Instalar dependencias:

```bash
npm install
```

2. Configurar `.env` en la raiz del repo (ver variables abajo).

3. Generar cliente Prisma:

```bash
npm run prisma:generate
```

4. Iniciar backend:

```bash
npm run dev:backend
```

Alternativa (frontend + backend):

```bash
npm run dev
```

## Variables de entorno del backend

Variables leidas por `backend/src/shared/env.js`:

- `NODE_ENV` (default: `development`)
- `PORT` (default: `5000`)
- `CLIENT_URL` (default: `http://localhost:5173`)
- `JWT_SECRET` (definida pero no usada por el flujo actual)
- `JWT_EXPIRES_IN` (definida pero no usada por el flujo actual)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `DATABASE_URL`

Notas:

- `.env.example` esta incompleto para el backend actual: no incluye variables de Supabase.
- `SUPABASE_SERVICE_KEY` es necesaria para rutas que usan `supabaseAdmin`.

## Scripts principales

Definidos en `package.json`:

- `npm run dev:backend`: levanta Express con nodemon
- `npm run start`: levanta Express sin nodemon
- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run prisma:seed`

Scripts de apoyo:

- `start-backend.cmd`

## Estructura general del backend

```text
backend/
  prisma/
    schema.prisma
    seed.js
  scripts/
    setup-admin.js
    make-admin.js
  src/
    app.js
    routes.js
    server.js
    modules/
      auth/
      users/
      properties/
      favorites/
      applications/
      requests/
    shared/
      env.js
      supabase.js
      supabase-auth.js
      supabase-auth-middleware.js
      prisma.js
      serializers.js
      validate.js
      errors.js
      errorHandler.js
      asyncHandler.js
```

## Contratos API consumidos por frontend

El frontend en `frontend/src` consume principalmente:

- `GET /api/properties`
- `GET /api/properties/featured`
- `GET /api/properties/:id`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `PATCH /api/users/me`
- `GET /api/favorites`
- `POST /api/favorites/:propertyId`
- `DELETE /api/favorites/:propertyId`
- `POST /api/applications/prequalify`
- `POST /api/requests`
- `GET /api/requests/mine`
- `GET /api/requests/received`
- `PATCH /api/requests/:id/status`

## Pendiente de validacion

- Requiere revision del equipo: definir una unica fuente canonica de datos entre Prisma y Supabase para `usuarios`, `propiedades` y `solicitudes/postulaciones`.
- Supuesto basado en el codigo actual: la arquitectura hibrida es transitoria y parte del blueprint en Supabase aun no esta conectada por API.
- Requiere revision del equipo: actualizar o retirar artefactos desalineados (`Dockerfile`, `Dockerfile.worker`, `docker-compose.yml`, `backend/prisma/seed.js`, `.github/workflows/ci.yml`).
