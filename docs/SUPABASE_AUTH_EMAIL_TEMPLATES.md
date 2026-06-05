# NIDO Supabase Auth email templates

## Estado actual

- Proyecto Supabase confirmado por MCP: `NIDO` (`hoqcfprckuozcsnwzgei`), status `ACTIVE_HEALTHY`.
- Las herramientas MCP disponibles permitieron listar proyectos y consultar documentacion oficial.
- No expusieron lectura/escritura directa de Email Templates, URL Configuration o SMTP Settings.
- Por seguridad, no se modificaron credenciales ni SMTP desde codigo local.

## Archivos versionados

Las plantillas viven en:

```txt
supabase/email-templates/
```

Principales:

- `confirm-signup.html` - subject: `Confirma tu cuenta en NIDO`
- `reset-password.html` - subject: `Restablece tu contrasena de NIDO`

Opcionales existentes:

- `magic-link.html`
- `invite-user.html`
- `change-email.html`
- `reauthentication.html`

## Logo

El asset principal queda en:

```txt
frontend/public/brand/nido-logo.png
```

En produccion debe abrir publicamente como:

```txt
https://DOMINIO_REAL_DE_NIDO/brand/nido-logo.png
```

Las plantillas usan:

```html
{{ .SiteURL }}/brand/nido-logo.png
```

Por eso Supabase Auth `Site URL` debe ser el dominio HTTPS real de NIDO antes de enviar correos a usuarios reales.

## Aplicacion en Supabase

En Supabase Dashboard > Authentication > Email Templates:

1. `Confirm signup`
   - Subject: `Confirma tu cuenta en NIDO`
   - Template: contenido de `supabase/email-templates/confirm-signup.html`
2. `Reset password`
   - Subject: `Restablece tu contrasena de NIDO`
   - Template: contenido de `supabase/email-templates/reset-password.html`

Mantener `{{ .ConfirmationURL }}` sin reemplazar por una URL fija.

## SMTP y DNS

Ver detalles en:

```txt
supabase/email-templates/DELIVERABILITY.md
```

Resumen:

- Configurar SMTP propio en Supabase para produccion.
- Verificar SPF, DKIM y DMARC con los valores del proveedor SMTP.
- Desactivar link tracking si reescribe enlaces de Supabase Auth.
- No prometer llegada garantizada a bandeja principal.

## Referencias oficiales

- Supabase Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- Supabase Custom SMTP: https://supabase.com/docs/guides/auth/auth-smtp
