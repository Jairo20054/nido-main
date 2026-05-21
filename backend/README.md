# Backend de NIDO

API REST construida con Express para soportar autenticacion, perfiles, propiedades, favoritos, solicitudes de arriendo y moderacion administrativa.

## Responsabilidades

- Validar y exponer el dominio de negocio al frontend.
- Integrar autenticacion con Supabase y materializar perfiles en la tabla `profiles`.
- Persistir datos operativos con Prisma sobre PostgreSQL.
- Aplicar autorizacion por rol para arrendatarios, arrendadores y administradores.
- Estandarizar respuestas, errores y serializacion de entidades.

## Estructura

- `src/app.js`: configuracion de Express, middlewares globales y health check.
- `src/server.js`: bootstrap del servidor HTTP y cierre ordenado del proceso.
- `src/routes.js`: router raiz de la API.
- `src/modules/`: modulos por dominio (`auth`, `properties`, `favorites`, `requests`, `users`, `admin`).
- `src/shared/`: utilidades comunes de auth, errores, Prisma, validacion y serializacion.
- `src/lib/supabaseAdmin.js`: export canonico server-only para operaciones administrativas de Supabase.

## Variables de entorno

Estas variables se definen en el `.env` de la raiz del proyecto o en `backend/.env` como override local:

- `DATABASE_URL`: cadena de conexion a PostgreSQL.
- `DIRECT_URL`: conexion directa usada por Prisma para migraciones.
- `PORT`: puerto preferido para la API. Si esta ocupado, el servidor intenta usar el siguiente disponible.
- `CLIENT_URLS`: origenes autorizados por CORS separados por coma.
- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_ANON_KEY`: clave publica usada para validar sesiones y operaciones de usuario.
- `SUPABASE_SERVICE_ROLE_KEY`: clave administrativa usada para tareas privilegiadas de backend.
- `JWT_SECRET`: obligatorio en staging/production.

## Arranque local

Desde la raiz del proyecto:

```bash
npm ci
npm run env:check
npm run prisma:generate
npm run prisma:migrate
npm start
```

Para desarrollo con recarga automatica:

```bash
npm run dev:server
```

## Secuencia de autenticacion

1. El frontend inicia sesion con Supabase.
2. El token Bearer llega al backend por `Authorization`.
3. `shared/auth.js` valida el token mediante `supabase.auth.getUser`.
4. Si el perfil de negocio no existe, el backend lo crea o actualiza en `profiles`.
5. El request continua con `req.user` enriquecido y listo para autorizacion por rol.

## Endpoints relevantes

- `GET /health`: verificacion simple del proceso.
- `GET /api/auth/me`: devuelve el usuario autenticado.
- `POST /api/auth/register`: registro publico.
- `POST /api/auth/login`: login con correo y contrasena.
- `POST /api/auth/forgot-password`: inicia recuperacion de contrasena.
- `GET /api/properties`: busqueda y listado publico.
- `PATCH /api/users/me`: actualiza el perfil del usuario autenticado.
- `GET /api/admin/stats`: metricas del panel administrativo.

## Convenciones del codigo

- Los controladores delegan la validacion estructural a esquemas Joi.
- Los middlewares de seguridad viven en `src/shared` para evitar duplicidad.
- Las respuestas exponen entidades serializadas y estables para el frontend.
- Los errores de dominio se convierten en respuestas HTTP uniformes desde `errorHandler`.

## Operacion y soporte

- Si una variable critica falta o es insegura, el proceso falla al iniciar con un mensaje explicito.
- `scripts/prestart.js` solo genera Prisma Client; no ejecuta `db push` ni muta la base automaticamente.
- El servidor publica logs de excepciones no manejadas y realiza cierre ordenado en `SIGTERM` y `SIGINT`.
