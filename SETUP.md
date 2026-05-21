# NIDO Setup Profesional

Guia para levantar NIDO desde cualquier equipo autorizado, especialmente casa y trabajo en Windows.

## Stack real

- Frontend: React + Vite, no Next.js.
- Backend: Node.js + Express.
- Base de datos: PostgreSQL en Supabase, Prisma Client.
- Auth: Supabase Auth con email/password y Google OAuth.
- Package manager: npm con `package-lock.json`.

## Proyecto Supabase validado por MCP

- Proyecto: `NIDO`
- Ref: `hoqcfprckuozcsnwzgei`
- Region: `us-east-1`
- Estado: `ACTIVE_HEALTHY`
- Postgres: 17.6
- Bucket media: `property-media-public`

## Primer arranque en Windows PowerShell

Ubicacion recomendada para desarrollo en Windows:

```powershell
mkdir C:\NIDO
cd C:\NIDO
git clone <repo-url> nido-main
cd .\nido-main
```

Instala Node y dependencias:

```powershell
nvm use
npm install
```

Si `postinstall` omite Prisma porque aun no existe `.env`, eso es esperado. Continua con la configuracion y ejecuta Prisma despues.

## Variables de entorno

Crea el entorno local desde el example:

```powershell
Copy-Item .env.example .env
```

Copia los valores reales desde tu gestor seguro de secretos. No pegues secretos en chats, capturas, commits ni documentos.

Variables requeridas por el codigo actual:

| Variable | Capa | Uso |
| --- | --- | --- |
| `NODE_ENV` | backend/scripts | Ambiente: `development`, `staging`, `production`. |
| `PORT` | backend | Puerto preferido de API. |
| `DATABASE_URL` | Prisma/backend | Conexion PostgreSQL operativa. |
| `DIRECT_URL` | Prisma | Conexion directa para migraciones. |
| `JWT_SECRET` | backend | Requerido en staging/production. |
| `CLIENT_URLS` | backend | Origenes CORS separados por coma. |
| `SUPABASE_URL` | backend | URL del proyecto Supabase. |
| `SUPABASE_ANON_KEY` o `SUPABASE_PUBLISHABLE_KEY` | backend/frontend-safe | Clave publica. |
| `SUPABASE_SERVICE_ROLE_KEY` | backend only | Clave administrativa. Nunca `VITE_*`. |
| `SUPABASE_PROPERTY_MEDIA_BUCKET` | backend | Bucket de imagenes/videos. |
| `DEEPSEK_API_KEY` | backend opcional | Integracion Deepsek. |
| `DEEPSEK_API_BASE` | backend opcional | URL base Deepsek. |
| `VITE_API_URL` o `VITE_API_BASE_URL` | frontend | Base URL publica de API. |
| `VITE_SITE_URL` | frontend | Origen publico del frontend. |
| `VITE_SUPABASE_URL` | frontend | URL publica Supabase. |
| `VITE_SUPABASE_ANON_KEY` o `VITE_SUPABASE_PUBLISHABLE_KEY` | frontend | Clave publica. Nunca service role. |
| `VITE_SUPABASE_PROPERTY_MEDIA_BUCKET` | frontend | Bucket publico de media. |
| `VITE_SUPABASE_REDIRECT_URL` | frontend | Password reset. |
| `VITE_SUPABASE_EMAIL_CONFIRMATION_URL` | frontend | Confirmacion de correo. |
| `VITE_SUPABASE_OAUTH_REDIRECT_URL` | frontend | Callback OAuth de la app. |
| `VITE_VERCEL_URL` | frontend/Vercel | Inyectada por Vercel; no se define localmente normalmente. |
| `ADMIN_LOGIN_*` / `SUPER_ADMIN_LOGIN_*` | scripts opcionales | Bootstrap local de admin. |

No se usan `NEXT_PUBLIC_*` ni `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` en el codigo de NIDO. Google se configura en Supabase Auth y Google Cloud.

Aliases aceptados por compatibilidad:

- CORS: `CLIENT_URL` o `CLIENT_ORIGIN` pueden reemplazar `CLIENT_URLS`, aunque `CLIENT_URLS` es el recomendado.
- Supabase publica: `SUPABASE_PUBLISHABLE_KEY` puede reemplazar `SUPABASE_ANON_KEY`.
- Supabase privada: `SUPABASE_SECRET_KEY` o `SUPABASE_SERVICE_KEY` pueden reemplazar `SUPABASE_SERVICE_ROLE_KEY`, aunque `SUPABASE_SERVICE_ROLE_KEY` es el recomendado.
- Frontend API: `VITE_API_BASE_URL` puede reemplazar `VITE_API_URL`.
- Admin local: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_FIRST_NAME` y `ADMIN_LAST_NAME` son usados por scripts auxiliares.

## Validacion local

```powershell
npm run env:check
npm run prisma:generate
npx prisma migrate status --schema backend/prisma/schema.prisma
npm run build
```

Para desarrollo:

```powershell
npm run dev
```

URLs locales:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000` o el siguiente puerto libre
- API via proxy Vite: `http://localhost:5173/api`

## Google Auth

El codigo usa `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })` y callback en:

```text
http://localhost:5173/auth/callback
```

Configura Supabase Dashboard > Authentication > URL Configuration:

- Site URL local: `http://localhost:5173`
- Redirect URLs locales:
  - `http://localhost:5173/auth/callback`
  - `http://127.0.0.1:5173/auth/callback`
  - `http://localhost:5173/reset-password`
  - `http://127.0.0.1:5173/reset-password`
  - `http://localhost:5173/email-confirmed`
  - `http://127.0.0.1:5173/email-confirmed`
- Produccion: agrega el dominio real con las mismas rutas.
- Vercel preview: agrega patrones solo para previews autorizados, por ejemplo `https://*-<team-or-account-slug>.vercel.app/**`.

Configura Supabase Dashboard > Authentication > Providers > Google:

- Habilita Google.
- Pega Google Client ID y Client Secret en Supabase.
- No pongas el Client Secret en el frontend.

Configura Google Cloud OAuth Client:

- Authorized JavaScript origins:
  - `http://localhost:5173`
  - `http://127.0.0.1:5173`
  - dominio de produccion
- Authorized redirect URIs:
  - `https://hoqcfprckuozcsnwzgei.supabase.co/auth/v1/callback`
  - `http://127.0.0.1:54321/auth/v1/callback` solo si usas Supabase local CLI.

Referencia oficial:

- Supabase redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase Google provider: https://supabase.com/docs/guides/auth/social-login/auth-google

## Vercel

Para frontend estatico en Vercel, define Environment Variables:

- `VITE_API_BASE_URL`: URL publica de la API backend.
- `VITE_SITE_URL`: dominio publico final.
- `VITE_SUPABASE_URL`: URL Supabase.
- `VITE_SUPABASE_ANON_KEY` o `VITE_SUPABASE_PUBLISHABLE_KEY`: clave publica.
- `VITE_SUPABASE_PROPERTY_MEDIA_BUCKET`: `property-media-public`.
- `VITE_SUPABASE_OAUTH_REDIRECT_URL`: `https://<dominio>/auth/callback`.
- `VITE_SUPABASE_REDIRECT_URL`: `https://<dominio>/reset-password`.
- `VITE_SUPABASE_EMAIL_CONFIRMATION_URL`: `https://<dominio>/email-confirmed`.

No definas en Vercel frontend:

- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_SECRET`

Esos secretos solo pertenecen al backend/server runtime correspondiente.

## Supabase y migraciones

El MCP valido que las tablas principales en `public` tienen RLS activado y politicas existentes. El bucket `property-media-public` es publico para lectura de medios, con escritura limitada por carpeta de usuario autenticado.

Se aplico hardening para impedir ejecucion directa de funciones `SECURITY DEFINER` desde `anon` y `authenticated`. La migracion local correspondiente es:

```text
supabase/migrations/20260521200851_harden_public_security_definer_execute.sql
```

La CLI global de Supabase no estaba instalada; se uso `npx supabase` para crear la migracion. Para aplicar migraciones desde otro equipo:

```powershell
npx supabase --version
npx supabase migration list
```

No ejecutes migraciones destructivas ni `prisma db push` contra production.

## Seguridad operativa

- Guarda `.env` en un password manager, por ejemplo 1Password, Bitwarden o Proton Pass.
- Mantiene un item "NIDO local development" con las variables compartidas entre tus equipos.
- Usa proyectos Supabase separados para development/staging/production si el producto crece.
- Rota inmediatamente cualquier secreto que haya sido committeado, compartido por chat o mostrado en pantalla.
- `SUPABASE_SERVICE_ROLE_KEY` solo en backend y scripts server-side.
- Cualquier variable con prefijo `VITE_` queda disponible en el navegador.
- No uses `CLIENT_URLS=*`.
- No uses localhost en staging/production.
