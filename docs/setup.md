# Configuracion y operacion de NIDO

Ultima actualizacion: 2026-04-27

## Prerrequisitos

- Node.js 18+
- npm
- PostgreSQL
- proyecto Supabase con Auth habilitado

## Variables de entorno requeridas

El codigo actual de backend/frontend espera:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `PORT`
- `CLIENT_URL`
- `VITE_API_BASE_URL`
- `NODE_ENV`

Notas:

- `backend/src/shared/env.js` carga `.env` desde la raiz del repositorio.
- `.env.example` esta incompleto para el backend actual porque no menciona las tres variables de Supabase.

## Instalacion local

```bash
npm install
npm run prisma:generate
```

## Ejecucion local

### Iniciar frontend y backend

```bash
npm run dev
```

### Iniciar solo frontend

```bash
npm run dev:frontend
```

### Iniciar solo backend

```bash
npm run dev:backend
```

## Expectativas de servicios locales

### Frontend

- servido por Vite en el puerto `5173`
- hace proxy de `/api` hacia `http://localhost:5000`

### Backend

- servido por Express en el puerto `5000` por defecto

### Base de datos

- Prisma espera un esquema PostgreSQL compatible con `backend/prisma/schema.prisma`
- las rutas apoyadas en Supabase esperan tablas creadas desde la migracion de Supabase o una estructura equivalente

## Bootstrap sugerido para primera ejecucion

1. Crear `.env` en la raiz del repo usando los nombres de variables indicados arriba.
2. Confirmar que PostgreSQL este encendido y accesible mediante `DATABASE_URL`.
3. Ejecutar `npm run prisma:generate`.
4. Si vas a usar tablas Prisma en local, publicar el esquema:

```bash
npm run prisma:push
```

5. Iniciar la app:

```bash
npm run dev
```

6. Verificar:

- `http://localhost:5000/health`
- `http://localhost:5173`

## Build

Build del frontend:

```bash
npm run build
```

Esto deja la SPA en `dist/`.

## Notas de despliegue

### Vercel

- `vercel.json` esta configurado para un build estatico del frontend desde `dist/`
- no despliega por si solo el backend Express

### Docker

Pendiente de validacion segun el codigo actual:

- `Dockerfile` construye el frontend, pero intenta iniciar `dist/index.js`, archivo que no existe en la salida actual
- `docker-compose.yml` referencia:
  - `worker`
  - Redis
  - MinIO
  - ClamAV
- `package.json` no define un script `worker`

Recomendacion:

- tratar los assets Docker como desactualizados hasta redefinir el objetivo de despliegue

## Resolucion de problemas

### El backend falla por credenciales de Supabase

Causa probable:

- falta `SUPABASE_URL`, `SUPABASE_ANON_KEY` o `SUPABASE_SERVICE_KEY`

Donde revisar:

- `backend/src/shared/supabase.js`
- `backend/src/shared/env.js`

### El frontend no puede llegar a la API

Revisar:

- que el backend este corriendo en el puerto `5000`
- que `VITE_API_BASE_URL` sea `/api`, salvo que exista otro gateway de despliegue
- que el proxy de Vite siga intacto en `frontend/vite.config.js`

### Falla crear/actualizar propiedades para usuarios autenticados

Posible causa:

- los usuarios de Supabase y los usuarios de Prisma no tienen sincronizacion garantizada

Impacto:

- las foreign keys de ownership pueden no coincidir con el ID del usuario autenticado

Estado:

- Requiere revision del equipo

### La revision de postulacion guiada sale vacia despues de refrescar

Causa:

- la pagina de revision depende del estado borrador en localStorage

Archivos involucrados:

- `frontend/src/features/applications/applicationDraft.js`
- `frontend/src/features/applications/ApplicationReviewPage.jsx`

### Falla CI

Causa visible en el codigo:

- `.github/workflows/ci.yml` ejecuta `npm test`
- `package.json` no tiene script `test`

### Falla el seed de Prisma

Causa visible en el codigo:

- `backend/prisma/seed.js` parece mas antiguo que el esquema y enums actuales de Prisma

## Scripts y ayudas operativas

- `start-backend.cmd`: wrapper de conveniencia para `npm run dev:backend`
- `backend/scripts/setup-admin.js`: bootstrap admin del lado Prisma, pendiente de validar frente a Supabase
- `backend/scripts/make-admin.js`: promover un usuario Prisma a admin por correo

## Pendiente de validacion

- Supuesto basado en el codigo actual: el desarrollo local requiere tanto una base Prisma funcional como un proyecto Supabase funcional.
- Requiere revision del equipo: decidir si el onboarding local debe estandarizarse en una sola ruta de persistencia en lugar del arreglo hibrido actual.
