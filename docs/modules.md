# Modulos y carpetas de NIDO

Ultima actualizacion: 2026-04-27

## Raiz del repositorio

### `backend/`

Proposito:

- API Express, esquema Prisma y scripts de apoyo

Dependencias:

- Node.js
- Express
- Prisma
- SDK de Supabase

Notas:

- El codigo backend en ejecucion esta en `backend/src`
- El esquema Prisma esta en `backend/prisma`

### `frontend/`

Proposito:

- SPA React para todos los flujos visibles por el usuario

Dependencias:

- React
- React Router
- Vite

### `supabase/`

Proposito:

- blueprint de migracion SQL para el ciclo de vida ampliado de NIDO

Notas:

- La migracion define mas tablas y triggers de los que hoy usan realmente el frontend/backend actual.

### `docs/`

Proposito:

- documentacion tecnica y notas heredadas del proyecto

Notas:

- Muchos archivos antiguos dentro de `docs/` parecen reportes generados o notas heredadas. Los archivos listados en este documento son la base mantenida para onboarding.

## Arbol fuente del backend

## `backend/src/app.js`

Proposito:

- crear la app Express
- configurar CORS
- registrar parsers, `/health`, `/api` y el manejo de errores

Entradas:

- variables de entorno cargadas desde `shared/env.js`

Salidas:

- app Express configurada

## `backend/src/routes.js`

Proposito:

- montar routers de dominio bajo `/api`

Modulos montados:

- `/auth`
- `/properties`
- `/applications`
- `/requests`
- `/users`
- `/favorites`

## `backend/src/modules/auth/`

Proposito:

- registro de usuarios, login, consulta del usuario actual, logout, cambio de contrasena y recuperacion de contrasena

Archivos clave:

- `auth.routes.js`
- `auth.controller.js`
- `auth.schemas.js`

Dependencias:

- Supabase Auth
- `profiles` de Supabase
- Joi

## `backend/src/modules/properties/`

Proposito:

- listar, detallar, crear, actualizar y eliminar propiedades

Archivos clave:

- `property.routes.js`
- `property.controller.js`
- `property.schemas.js`

Dependencias:

- Prisma `Property`, `PropertyImage`, `Favorite`, `RentalRequest`
- `shared/serializers.js`

Notas:

- Los endpoints publicos de busqueda y propiedades destacadas viven aqui.

## `backend/src/modules/requests/`

Proposito:

- crear y gestionar solicitudes formales de arriendo

Archivos clave:

- `request.routes.js`
- `request.controller.js`
- `request.schemas.js`

Dependencias:

- Prisma `RentalRequest`
- Prisma `Property`
- middleware de auth

Notas:

- Estas rutas son usadas por:
  - pagina de cuenta
  - pagina de gestion del arrendador
  - paso final de envio dentro del flujo guiado de postulacion

## `backend/src/modules/applications/`

Proposito:

- precalificacion y preparacion del checklist documental

Archivos clave:

- `application.routes.js`
- `application.controller.js`
- `application.schemas.js`

Dependencias:

- Supabase `properties`
- Supabase `property_images`
- Supabase `profiles`
- Supabase `applications`

Notas:

- Este modulo no es lo mismo que `RentalRequest` en Prisma.
- Hoy solo expone `POST /applications/prequalify`.

## `backend/src/modules/users/`

Proposito:

- devolver y actualizar el perfil del usuario autenticado

Dependencias:

- Supabase `profiles`

Notas:

- El borrado del perfil usa Supabase Auth admin delete despues de confirmar la contrasena.

## `backend/src/modules/favorites/`

Proposito:

- guardar y quitar propiedades favoritas

Dependencias:

- Prisma `Favorite`
- Prisma `Property`

## `backend/src/shared/`

### `env.js`

Proposito:

- centralizar la carga de variables de entorno desde el `.env` raiz

### `supabase.js`

Proposito:

- construir clientes anonimo y admin de Supabase
- normalizar filas `profiles`
- crear perfiles de usuario en Supabase

### `supabase-auth.js`

Proposito:

- envolver el comportamiento de register/login/reset-password contra Supabase Auth

### `supabase-auth-middleware.js`

Proposito:

- parsear bearer token
- validarlo con Supabase
- enriquecer `req.user`
- ofrecer helpers de auth opcional, auth requerida, rol y ownership

### `prisma.js`

Proposito:

- proveer un cliente Prisma singleton

### `serializers.js`

Proposito:

- normalizar respuestas API para:
  - usuario
  - propiedad
  - solicitud de arriendo

### `validate.js`

Proposito:

- ejecutar validacion Joi sobre `req.body` o `req.query`

### `errors.js` y `errorHandler.js`

Proposito:

- crear errores de aplicacion y convertirlos en respuestas JSON

## Scripts del backend

## `backend/prisma/schema.prisma`

Proposito:

- definir el modelo de datos Prisma en ejecucion

## `backend/prisma/seed.js`

Proposito:

- pensado para sembrar datos locales o demo

Riesgos o notas:

- Requiere revision del equipo: este archivo referencia enums y campos que no coinciden exactamente con el esquema actual de Prisma.

## `backend/scripts/setup-admin.js`

Proposito:

- hacer upsert de un usuario admin en la tabla Prisma `User`

Riesgos o notas:

- Esto no crea un usuario equivalente en Supabase Auth, asi que no debe tratarse como la ruta completa de bootstrap de auth para la app actual.

## `backend/scripts/make-admin.js`

Proposito:

- promover a admin un usuario Prisma por correo

## Arbol fuente del frontend

## `frontend/src/app/`

### `providers/AuthProvider.jsx`

Proposito:

- mantener el estado global de autenticacion y exponer helpers de auth

Responsabilidades:

- refrescar usuario actual
- iniciar sesion
- registrar
- cerrar sesion
- actualizar perfil

### `routes/ProtectedRoute.jsx`

Proposito:

- proteger rutas privadas segun el estado de auth

## `frontend/src/components/layout/`

Proposito:

- estructura compartida:
  - header
  - footer
  - wrapper de layout

## `frontend/src/components/ui/`

Proposito:

- primitivas pequenas de UI reutilizable

Ejemplos:

- `LoadingState`
- `EmptyState`
- `InlineMessage`
- `RequestEstadoBadge`

## `frontend/src/features/home/`

Proposito:

- home y descubrimiento de propiedades destacadas

## `frontend/src/features/auth/`

Proposito:

- pantallas de login y registro

## `frontend/src/features/properties/`

Proposito:

- busqueda, detalle, tarjeta de propiedad, filtros, formulario de propiedad y un formulario heredado de solicitud de arriendo

Notas:

- `RentalRequestForm.jsx` existe, pero no hace parte del flujo guiado por rutas que hoy usa `App.jsx`.

## `frontend/src/features/applications/`

Proposito:

- experiencia guiada de postulacion por rutas

Archivos clave:

- `ApplyStartPage.jsx`
- `ApplyPrequalificationPage.jsx`
- `ApplicationDocumentosPage.jsx`
- `ApplicationReviewPage.jsx`
- `applicationConfig.js`
- `applicationDraft.js`
- `usePropertyDetails.js`

Notas:

- `applicationDraft.js` es critico porque funciona como fuente de verdad del lado cliente para el flujo despues de la precalificacion.

## `frontend/src/features/favorites/`

Proposito:

- pagina de propiedades guardadas

## `frontend/src/features/account/`

Proposito:

- edicion de perfil e historial de solicitudes del usuario actual

## `frontend/src/features/dashboard/`

Proposito:

- panel de gestion del arrendador

## `frontend/src/lib/`

### `apiClient.js`

Proposito:

- envolver `fetch`
- adjuntar bearer token
- construir query strings
- lanzar un `ApiError` tipado

### `constants.js`

Proposito:

- centralizar la clave del token y etiquetas de opciones de UI

### `formatters.js`

Proposito:

- formatos de moneda, fecha, tipo de propiedad y estado de solicitud

## Otros archivos de infraestructura

## `.github/workflows/ci.yml`

Proposito:

- pipeline CI previsto

Riesgos o notas:

- Ejecuta `npm test`, pero no existe script `test` en `package.json`.

## `docker-compose.yml`

Proposito:

- stack local de contenedores previsto

Riesgos o notas:

- Referencia flujos de `worker`, Redis, MinIO y ClamAV que no se reflejan en los scripts Node activos.

## `vercel.json`

Proposito:

- configuracion de despliegue estatico del frontend para `dist/`

Riesgos o notas:

- Esta configuracion no despliega por si sola el backend Express.

