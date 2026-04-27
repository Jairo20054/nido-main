# Documentacion tecnica de NIDO

Ultima actualizacion: 2026-04-27

## Que es NIDO

NIDO es un MVP de marketplace de arriendo residencial. El repositorio actual implementa:

- un frontend en React + Vite para busqueda, autenticacion, propiedades guardadas, gestion de cuenta, gestion de arrendadores y un flujo guiado de postulacion
- un backend en Express con rutas modulares
- modelos Prisma para propiedades, favoritos y solicitudes de arriendo
- autenticacion y almacenamiento de perfiles con Supabase
- un blueprint SQL en Supabase para un ciclo de vida mas amplio de la aplicacion, aunque solo una parte esta conectada al codigo en ejecucion

## Alcance actual del producto

El MVP ejecutable soporta estos recorridos principales:

- explorar propiedades destacadas y buscables sin iniciar sesion
- registrarse e iniciar sesion con Supabase Auth
- guardar propiedades en favoritos
- ver datos de cuenta y solicitudes de arriendo enviadas
- crear y administrar propiedades desde el panel de arrendador
- precalificarse para una propiedad mediante un flujo guiado
- enviar una solicitud final de arriendo despues del paso documental

El codigo tambien contiene un flujo mas amplio de "estado futuro" alrededor de postulaciones, contratos, pagos, entrega, firmas y auditoria dentro de `supabase/migrations/20260424020559_nido_rental_backend.sql`, pero la mayor parte de ese ciclo aun no esta expuesta por la API actual del frontend/backend.

## Verificaciones importantes

- Verdad vista en el codigo: el backend usa Prisma y Supabase al mismo tiempo.
- Verdad vista en el codigo: el flujo guiado de postulacion se reparte entre localStorage, Supabase y Prisma.
- Verdad vista en el codigo: las cargas de documentos aun no se persisten en almacenamiento del backend; la UI solo valida archivos del lado del cliente y guarda metadatos del borrador en localStorage.
- Verdad vista en el codigo: Docker, CI y algunos archivos de seed/bootstrap estan desalineados con la app actual y deben tratarse como pendientes de validacion.

## Stack tecnologico

### Frontend

- React 19
- React Router DOM 7
- Vite 5
- Lucide React
- CSS plano

### Backend

- Node.js 18+
- Express 4
- Joi para validacion
- cliente Supabase JS para autenticacion y tablas seleccionadas
- Prisma 6 para lecturas/escrituras relacionales sobre el esquema PostgreSQL de ejecucion definido en `backend/prisma/schema.prisma`

### Persistencia

- PostgreSQL a traves de Prisma
- Supabase Postgres + Supabase Auth
- localStorage para el token de autenticacion y el estado del borrador de postulacion

## Puntos de entrada del repositorio

- Entrada del frontend: `frontend/src/main.jsx`
- Router del frontend: `frontend/src/App.jsx`
- Entrada del backend: `backend/src/server.js`
- Configuracion de la app backend: `backend/src/app.js`
- Router raiz de la API: `backend/src/routes.js`
- Esquema Prisma: `backend/prisma/schema.prisma`
- Migracion blueprint de Supabase: `supabase/migrations/20260424020559_nido_rental_backend.sql`

## Como ejecutar en local

### Prerrequisitos

- Node.js 18 o superior
- npm
- PostgreSQL accesible mediante `DATABASE_URL`
- Un proyecto Supabase con valores validos para:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_KEY`

### Variables de entorno

El codigo en ejecucion lee estas variables:

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

- `.env.example` esta incompleto para el backend actual porque no incluye las variables requeridas de Supabase.
- `backend/src/shared/env.js` carga el `.env` de la raiz del repositorio.

### Inicio local

```bash
npm install
npm run prisma:generate
npm run dev
```

Puertos por defecto:

- frontend: `http://localhost:5173`
- backend: `http://localhost:5000`
- proxy del frontend al backend: `/api` mediante `frontend/vite.config.js`

## Scripts npm principales

- `npm run dev`: inicia frontend y backend juntos
- `npm run dev:frontend`: ejecuta Vite
- `npm run dev:backend`: ejecuta Express con nodemon
- `npm run build`: construye el frontend en `dist/`
- `npm run preview`: previsualiza el build del frontend
- `npm run start`: inicia solo el backend
- `npm run prisma:generate`
- `npm run prisma:push`
- `npm run prisma:seed`

## Mapa general del repositorio

```text
backend/
  prisma/
  scripts/
  src/
    modules/
    shared/
frontend/
  public/
  src/
    app/
    components/
    features/
    lib/
    styles/
supabase/
  migrations/
docs/
```

## Que leer despues

- `docs/architecture.md`
- `docs/flows.md`
- `docs/modules.md`
- `docs/api.md`
- `docs/data-model.md`
- `docs/setup.md`
- `docs/diagrams/architecture.md`
- `docs/diagrams/flows.md`

## Pendiente de validacion

- La configuracion Docker menciona un worker, Redis, MinIO y ClamAV, pero el `package.json` actual no define un script `worker` y el codigo principal no conecta esos servicios.
- `.github/workflows/ci.yml` ejecuta `npm test`, pero `package.json` no define un script `test`.
- `backend/prisma/seed.js` parece desactualizado frente al esquema y enums actuales de Prisma.
- `backend/types/database.ts` no coincide exactamente con la migracion actual de Supabase y debe tratarse como un artefacto generado o heredado hasta que se regenere.
