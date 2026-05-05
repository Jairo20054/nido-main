# NIDO

Aplicacion full stack para publicar, administrar y arrendar propiedades. El proyecto combina un cliente React + Vite con una API en Express, persistencia en PostgreSQL mediante Prisma y autenticacion delegada a Supabase.

## Arquitectura

- `frontend/src/`: frontend React, rutas, paginas de negocio y componentes reutilizables.
- `backend/src/`: API REST, modulos por dominio, middlewares compartidos y capa de seguridad.
- `backend/prisma/`: modelo de datos, generacion del cliente y seed de demo.
- `frontend/public/`: assets estaticos servidos por el frontend.
- `scripts/`: utilidades de arranque, limpieza de procesos y verificaciones locales.
- `supabase/`: configuracion y artefactos auxiliares para la integracion con Supabase.

## Funcionalidades principales

- Registro, inicio de sesion, recuperacion de contrasena y perfil de usuario.
- Roles de negocio para arrendatario, arrendador y administrador.
- Busqueda de propiedades con detalle, favoritos y solicitudes de arriendo.
- Publicacion y edicion de inmuebles con estados editoriales.
- Panel administrativo para moderacion, metricas y gestion de arrendadores.
- Carga real de imagenes y video de propiedades sobre Supabase Storage con previsualizacion inmediata.

## Stack tecnico

- Frontend: React 19, React Router, Vite.
- Backend: Node.js, Express.
- Datos: PostgreSQL + Prisma ORM.
- Auth: Supabase Auth.
- UI: CSS propio y `lucide-react` para iconografia.

## Requisitos

- Node.js 18 o superior.
- npm 9 o superior.
- PostgreSQL disponible localmente o remotamente.
- Proyecto de Supabase con Auth habilitado si deseas usar autenticacion real.

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo de entorno a partir del ejemplo:

```bash
cp .env.example .env
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Ajusta las variables de entorno de base de datos y Supabase.

4. Sincroniza el esquema con la base de datos:

```bash
npm run prisma:push
```

5. Carga datos de demostracion opcionales:

```bash
npm run prisma:seed
```

6. Inicia el entorno local:

```bash
npm run dev
```

El cliente se sirve por defecto en `http://localhost:5173` y la API en `http://localhost:5000` o en el siguiente puerto libre disponible.

## Variables de entorno

Las variables base viven en `.env.example`:

- `DATABASE_URL`: conexion PostgreSQL consumida por Prisma.
- `PORT`: puerto preferido para la API.
- `CLIENT_URL`: origen permitido por CORS.
- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_ANON_KEY`: clave publica usada por frontend y backend para operaciones autenticadas de usuario.
- `SUPABASE_SERVICE_ROLE_KEY`: clave administrativa usada solo en backend.
- `VITE_API_BASE_URL`: base relativa o absoluta para el cliente HTTP del frontend.
- `VITE_SUPABASE_URL`: URL expuesta al cliente para Auth.
- `VITE_SUPABASE_ANON_KEY`: clave publica expuesta al cliente.
- `VITE_SUPABASE_PROPERTY_MEDIA_BUCKET`: bucket publico usado para imagenes y videos de propiedades.
- `VITE_SUPABASE_REDIRECT_URL`: URL de retorno del flujo de recuperacion de contrasena.

## Scripts utiles

- `npm run dev`: levanta frontend y backend para desarrollo.
- `npm run dev:client`: inicia solo Vite.
- `npm run dev:server`: inicia solo la API con recarga automatica.
- `npm run build`: genera el build de produccion del frontend.
- `npm start`: arranca la API.
- `npm run prisma:generate`: regenera el cliente de Prisma.
- `npm run prisma:push`: aplica el esquema actual a la base de datos.
- `npm run prisma:seed`: inserta datos demo.

## Flujo de autenticacion

1. El frontend inicia sesion con Supabase.
2. El token de acceso se mantiene en memoria y se adjunta al cliente API.
3. El backend valida el token usando Supabase y garantiza la existencia del perfil operativo en Prisma `user`.
4. La API devuelve un perfil enriquecido con rol efectivo y permisos administrativos.

Este diseno evita duplicar contrasenas en la aplicacion y centraliza la autorizacion de negocio en el backend.

## Modulos backend

- `auth`: registro, login, recuperacion y perfil autenticado.
- `properties`: CRUD de propiedades, filtros, estados y detalle.
- `favorites`: favoritos por usuario.
- `requests`: solicitudes de arriendo.
- `users`: actualizacion de perfil y datos propios.
- `admin`: moderacion, listados administrativos y metricas.

## Verificacion realizada

- `npm run build` ejecuta correctamente en el estado actual del repositorio.

Observacion: Vite reporta un bundle principal mayor a `500 kB`, por lo que conviene considerar code splitting cuando entremos a una ronda de optimizacion.
