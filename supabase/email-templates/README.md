# NIDO Supabase Auth email templates

Templates versionadas para los correos transaccionales de Supabase Auth.

## Archivos

- `confirm-signup.html`
  - Subject: `Confirma tu cuenta en NIDO`
  - Flujo Supabase: Confirm signup / `auth.email.template.confirmation`
- `reset-password.html`
  - Subject: `Restablece tu contrasena de NIDO`
  - Flujo Supabase: Reset password / `auth.email.template.recovery`
- `magic-link.html`
  - Subject sugerido: `Tu enlace de acceso a NIDO`
- `invite-user.html`
  - Subject sugerido: `Te invitaron a NIDO`
- `change-email.html`
  - Subject sugerido: `Confirma tu nuevo correo en NIDO`
- `reauthentication.html`
  - Subject sugerido: `Codigo de seguridad de NIDO`

## Logo

El logo publico de la app queda en:

```txt
frontend/public/brand/nido-logo.png
```

En la app desplegada se publica como:

```txt
/brand/nido-logo.png
```

Las plantillas usan:

```html
{{ .SiteURL }}/brand/nido-logo.png
```

Eso produce una URL absoluta cuando Supabase renderiza el correo. Para produccion, Supabase Auth `Site URL` debe ser el dominio HTTPS publico de NIDO. No uses rutas locales de Windows, `localhost`, ni rutas relativas en plantillas reales enviadas a usuarios.

Si prefieres fijar una URL explicita, reemplaza el `src` por el valor final de:

```env
VITE_NIDO_PUBLIC_LOGO_URL=https://your-production-domain.com/brand/nido-logo.png
```

## Aplicar en Supabase hosted

La documentacion oficial de Supabase indica que, en proyectos hosted, las plantillas se editan en Dashboard > Authentication > Email Templates. Tambien se pueden administrar por Management API si tienes un access token.

Pasos manuales seguros:

1. Abre Supabase Dashboard.
2. Entra al proyecto `NIDO`.
3. Ve a Authentication > Email Templates.
4. Abre `Confirm signup`.
5. Pega el contenido de `confirm-signup.html`.
6. Usa el subject `Confirma tu cuenta en NIDO`.
7. Abre `Reset password`.
8. Pega el contenido de `reset-password.html`.
9. Usa el subject `Restablece tu contrasena de NIDO`.
10. Guarda y prueba con un correo real controlado.

Mantener obligatorio:

- `{{ .ConfirmationURL }}` en los botones y enlaces de respaldo.
- HTML inline, sin JavaScript.
- Un solo CTA principal por correo.
- Logo con URL absoluta HTTPS en produccion.

## URL configuration

La app ya tiene rutas para:

```txt
/auth/callback
/email-confirmed
/reset-password
```

En Supabase Dashboard > Authentication > URL Configuration verifica:

```txt
Site URL:
https://DOMINIO_REAL_DE_NIDO

Allowed Redirect URLs:
http://localhost:5173/**
http://localhost:5173/auth/callback
http://localhost:5173/email-confirmed
http://localhost:5173/reset-password
https://DOMINIO_REAL_DE_NIDO/**
https://DOMINIO_REAL_DE_NIDO/auth/callback
https://DOMINIO_REAL_DE_NIDO/email-confirmed
https://DOMINIO_REAL_DE_NIDO/reset-password
```

No pongas el dominio placeholder en produccion.

## Referencias oficiales

- Supabase Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- Supabase Custom SMTP: https://supabase.com/docs/guides/auth/auth-smtp
