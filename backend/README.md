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

## Variables de entorno

Estas variables se definen en el `.env` de la raiz del proyecto:

- `DATABASE_URL`: cadena de conexion a PostgreSQL.
- `PORT`: puerto preferido para la API. Si esta ocupado, el servidor intenta usar el siguiente disponible.
- `CLIENT_URL`: origen autorizado por CORS.
- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_ANON_KEY`: clave publica usada para validar sesiones y operaciones de usuario.
- `SUPABASE_SERVICE_ROLE_KEY`: clave administrativa usada para tareas privilegiadas de backend.

## Arranque local

Desde la raiz del proyecto:

```bash
npm install
npm run prisma:push
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

- Si `SUPABASE_URL` o las llaves no estan configuradas, los endpoints de auth fallaran de forma explicita.
- Si `DATABASE_URL` no existe en desarrollo, `scripts/prestart.js` omite `prisma db push` y permite levantar el proceso para tareas de interfaz.
- El servidor publica logs de excepciones no manejadas y realiza cierre ordenado en `SIGTERM` y `SIGINT`.
