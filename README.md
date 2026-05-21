# NIDO

Aplicacion full stack para publicar, administrar y arrendar propiedades. Combina frontend React + Vite, API Express, PostgreSQL con Prisma y autenticacion delegada a Supabase.

## Arquitectura

- `frontend/src/`: frontend React, rutas, paginas de negocio y cliente publico de Supabase en `frontend/src/lib/supabaseClient.js`.
- `backend/src/`: API REST, modulos por dominio, middlewares, CORS y seguridad.
- `backend/src/lib/supabaseAdmin.js`: export server-only del cliente administrativo de Supabase.
- `backend/prisma/`: schema, migraciones Prisma y seed demo.
- `supabase/migrations/`: migraciones SQL/RLS/Storage de Supabase.
- `scripts/`: arranque, validacion de entorno y utilidades Prisma.

## Requisitos

- Node.js `22.14.0` (`nvm use` lee `.nvmrc`).
- npm `10.x`.
- PostgreSQL local, Supabase local CLI o Supabase remoto.
- Variables reales guardadas en un gestor seguro, nunca en Git.

## Configuracion Local De NIDO

1. Clona o actualiza el repositorio:

```bash
git clone <repo-url>
cd nido-main
git pull
```

2. Usa la version correcta de Node e instala dependencias:

```bash
nvm use
npm ci
```

Si es la primera vez y aun no existe `.env`, `postinstall` puede omitir `prisma generate`. Es normal: crea `.env` y luego ejecuta `npm run prisma:generate`.

3. Crea archivos de entorno desde examples:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Tambien puedes copiar `backend/.env.example` a `backend/.env` o `frontend/.env.example` a `frontend/.env` si necesitas overrides por capa. La configuracion recomendada para casa y trabajo es un solo `.env` en la raiz.

4. Copia los valores reales desde tu gestor seguro. No inventes secretos ni reutilices production en development.

5. Valida el entorno:

```bash
npm run env:check
```

6. Prepara Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Usa `npm run prisma:seed` solo si quieres datos demo. En production usa `npm run prisma:migrate:deploy`; no uses `db push` salvo una prueba local descartable.

7. Ejecuta la app:

```bash
npm run dev
```

Frontend: `http://localhost:5173`. Backend: `http://localhost:5000` o el siguiente puerto libre. Supabase local CLI suele exponer Auth en `http://127.0.0.1:54321` y Postgres en `127.0.0.1:54322`.

8. Verifica Google Login:

- En Supabase Dashboard, habilita Google provider.
- En Supabase, configura Google Client ID y Client Secret.
- En Google Cloud, Authorized JavaScript origins:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - tu dominio de staging/production
- En Google Cloud, Authorized redirect URIs:
  - `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
  - `http://127.0.0.1:54321/auth/v1/callback` si usas Supabase local CLI
- En `.env`, ajusta `VITE_SITE_URL` y `VITE_SUPABASE_OAUTH_REDIRECT_URL`. El frontend usa `redirectTo` desde esas variables, sin URLs hardcodeadas.

## Ambientes

- `development/local`: usa `.env` local con Supabase dev/local, DB dev y `CLIENT_URLS` localhost.
- `staging`: usa proyecto Supabase y DB propios de staging. `NODE_ENV=staging`, dominios reales y secretos separados.
- `production`: usa solo secretos de production en el proveedor de despliegue. No debe contener localhost ni claves de development.

## Variables

| Nombre | Ambiente | Obligatoria | Capa | Descripcion | Ejemplo seguro |
| --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | Todos | Si | Backend | `development`, `staging` o `production`. | `development` |
| `PORT` | Todos | Si | Backend | Puerto preferido de la API. | `5000` |
| `DATABASE_URL` | Todos | Si | Backend/Prisma | URL operativa de PostgreSQL. | `postgresql://postgres:<password>@127.0.0.1:54322/postgres?schema=public` |
| `DIRECT_URL` | Todos | Si | Backend/Prisma | Conexion directa para migraciones Prisma. | `postgresql://postgres:<password>@127.0.0.1:54322/postgres?schema=public` |
| `JWT_SECRET` | Staging/Prod | Si | Backend | Secreto largo para futuras firmas JWT internas. | `replace-with-a-long-random-secret` |
| `CLIENT_URLS` | Todos | Si | Backend | Origenes CORS separados por coma. | `http://localhost:5173,http://127.0.0.1:5173` |
| `SUPABASE_URL` | Todos | Si | Backend | URL del proyecto Supabase. | `https://<project-ref>.supabase.co` |
| `SUPABASE_ANON_KEY` | Todos | Si | Backend | Clave publica anon/publishable. | `replace-with-supabase-anon-key` |
| `SUPABASE_SERVICE_ROLE_KEY` | Todos | Si | Backend | Clave administrativa server-only. | `replace-with-service-role-key` |
| `SUPABASE_PROPERTY_MEDIA_BUCKET` | Todos | Si | Backend | Bucket de media de propiedades. | `property-media-public` |
| `VITE_API_URL` | Todos | Si | Frontend | Base URL del backend; localmente puede ser relativa. | `/api` |
| `VITE_SITE_URL` | Todos | Si | Frontend | Origen publico del frontend. | `http://localhost:5173` |
| `VITE_SUPABASE_URL` | Todos | Si | Frontend | URL publica Supabase. | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Todos | Si | Frontend | Clave publica. Nunca service role. | `replace-with-supabase-anon-key` |
| `VITE_SUPABASE_OAUTH_REDIRECT_URL` | Todos | Si | Frontend | Callback local de la app tras OAuth. | `http://localhost:5173/auth/callback` |

## Scripts

- `npm run env:check`: valida backend/frontend sin imprimir secretos.
- `npm run dev`: levanta backend y frontend.
- `npm run build`: build frontend.
- `npm start`: arranca API.
- `npm run prisma:generate`: genera Prisma Client.
- `npm run prisma:migrate`: crea/aplica migraciones en development.
- `npm run prisma:migrate:deploy`: aplica migraciones en staging/production.
- `npm run prisma:studio`: abre Prisma Studio.
- `npm run prisma:seed`: carga datos demo.

## Seguridad

- `.env`, `.env.*`, `backend/.env*` y `frontend/.env*` estan ignorados por Git; solo se versionan examples.
- El frontend solo puede usar `VITE_SUPABASE_ANON_KEY` o `VITE_SUPABASE_PUBLISHABLE_KEY`.
- El validador falla si detecta `VITE_*` con `SERVICE_ROLE`, `SECRET`, `JWT`, `DATABASE_URL`, `DIRECT_URL`, `PASSWORD`, `TOKEN` o similares.
- El backend usa `SUPABASE_SERVICE_ROLE_KEY` solo server-side.
- CORS se controla con `CLIENT_URLS`; en staging/production no uses `*` ni localhost.
- No registres tokens, URLs completas con password ni claves en logs.
- Si alguna clave real estuvo en GitHub, rotala inmediatamente en Supabase/Google y actualiza el gestor seguro.
- Revisa RLS al cambiar tablas en schemas expuestos. Las migraciones actuales viven en `supabase/migrations/`; cualquier tabla nueva en `public` debe tener RLS y politicas concretas.

## Errores Comunes

- `Supabase no esta configurado`: faltan `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY`.
- `Google Auth no esta configurado`: Google provider no esta habilitado en Supabase o faltan origins/redirect URIs en Google Cloud.
- `DATABASE_URL no esta configurada`: crea `.env`, copia valores reales y ejecuta `npm run env:check`.
- Prisma falla entre casa y trabajo: no uses `db push` como flujo normal; commitea migraciones y aplica `npm run prisma:migrate`.
- CORS bloqueado: agrega el origen exacto del frontend a `CLIENT_URLS`, sin slash final.
