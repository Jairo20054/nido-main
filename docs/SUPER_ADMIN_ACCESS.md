# Super Admin En NIDO

## Resumen

NIDO trata al admin como un usuario real de Supabase Auth controlado por servidor. El acceso elevado no sale del registro publico y se concede desde el bootstrap cuando coinciden estas condiciones:

- El usuario existe en Supabase Auth.
- El usuario puede iniciar sesion con email/password reales de Supabase.
- El usuario tiene `app_metadata.role = ADMIN`.
- Si el schema conectado soporta grants, el usuario tambien queda sincronizado en `platform_admins` o `roles`.

Ese diseno evita escalacion por `user_metadata`, formularios publicos o cambios desde el frontend.

## Provisionamiento

1. Configura variables reales en `.env`:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
SUPABASE_ANON_KEY=tu_anon_key

ADMIN_LOGIN_ALIAS=admin
ADMIN_LOGIN_EMAIL=admin@nido.local
ADMIN_LOGIN_PASSWORD=una-clave-segura
```

2. Ejecuta el bootstrap:

```bash
npm run auth:bootstrap-admin
```

3. El script crea o actualiza:

- Usuario en Supabase Auth con `email_confirm = true`
- `app_metadata.role = ADMIN`
- Perfil en `profiles`
- Grant en `platform_admins` o `roles` cuando esas tablas existan y sus triggers esten sanos
- Login real con `signInWithPassword` para verificar access token y refresh token

## Acceso

- Login por alias: `admin`
- Login por correo: el valor de `ADMIN_LOGIN_EMAIL`
- Password: el valor de `ADMIN_LOGIN_PASSWORD`

Cuando autentica correctamente, NIDO lo redirige a `/admin`.

## Seguridad

- El registro publico solo acepta `TENANT` y `LANDLORD`.
- El backend recalcula el contexto del usuario desde Supabase Auth, `app_metadata`, `platform_admins` y `roles` segun el schema disponible.
- El frontend solo consume el rol ya resuelto por el backend.
- Cambiar `user_metadata.role` desde cliente no otorga privilegios.

## Validacion esperada

- `GET /api/auth/me` devuelve `role: "ADMIN"` e `isPlatformAdmin: true`.
- Las rutas protegidas con `ProtectedRoute roles={['ADMIN']}` permiten acceso.
- Las rutas backend que usan `requireAdmin` aceptan el token del super admin.

## Reparacion de auditoria

Si `platform_admins` falla con `record "new" has no field "id"`, aplica la migracion `20260516132559_fix_platform_admin_audit_entity.sql`. Ese error viene del trigger generico `audit_row_change`, que asumía que todas las tablas auditadas tienen columna `id`; `platform_admins` usa `auth_user_id` como llave primaria.
