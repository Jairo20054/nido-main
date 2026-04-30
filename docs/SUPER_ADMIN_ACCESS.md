# Super Admin En NIDO

## Resumen

NIDO trata al super admin como un `platform admin` controlado por servidor. El acceso elevado no sale del registro publico y se concede solo cuando coinciden estas dos condiciones:

- El usuario existe en Supabase Auth.
- El usuario tiene grant en `platform_admins` y `app_metadata.role = ADMIN`.

Ese diseno evita escalacion por `user_metadata`, formularios publicos o cambios desde el frontend.

## Provisionamiento

1. Configura variables reales en `.env`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_ANON_KEY=tu_anon_key

SUPER_ADMIN_LOGIN_ALIAS=superadmin
SUPER_ADMIN_LOGIN_EMAIL=admin@nido.local
SUPER_ADMIN_LOGIN_PASSWORD=una-clave-segura

VITE_SUPER_ADMIN_LOGIN_ALIAS=superadmin
VITE_SUPER_ADMIN_LOGIN_EMAIL=admin@nido.local
```

2. Ejecuta el bootstrap:

```bash
npm run auth:bootstrap-super-admin
```

3. El script crea o actualiza:

- Usuario en Supabase Auth con `email_confirm = true`
- `app_metadata.role = ADMIN`
- Perfil en `profiles`
- Grant en `platform_admins`

## Acceso

- Login por alias: `superadmin`
- Login por correo: el valor de `SUPER_ADMIN_LOGIN_EMAIL`
- Password: el valor de `SUPER_ADMIN_LOGIN_PASSWORD`

Cuando autentica correctamente, NIDO lo redirige a `/admin`.

## Seguridad

- El registro publico solo acepta `TENANT` y `LANDLORD`.
- El backend recalcula el contexto del usuario desde Supabase + `platform_admins`.
- El frontend solo consume el rol ya resuelto por el backend.
- Cambiar `user_metadata.role` desde cliente no otorga privilegios.

## Validacion esperada

- `GET /api/auth/me` devuelve `role: "ADMIN"` e `isPlatformAdmin: true`.
- Las rutas protegidas con `ProtectedRoute roles={['ADMIN']}` permiten acceso.
- Las rutas backend que usan `requireAdmin` aceptan el token del super admin.
