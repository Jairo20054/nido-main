# NIDO email deliverability

Objetivo: reducir riesgo de spam en correos transaccionales de Supabase Auth. No existe una configuracion que garantice bandeja principal siempre.

## SMTP personalizado

Para produccion, configura SMTP propio en Supabase Dashboard > Authentication > Emails > SMTP Settings.

Evita el remitente generico de Supabase para produccion. Usa un remitente del dominio verificado de NIDO:

```txt
NIDO <no-reply@your-production-domain.com>
```

o:

```txt
NIDO <auth@your-production-domain.com>
```

Proveedores compatibles por SMTP:

- Resend
- Postmark
- Brevo
- SendGrid
- Amazon SES
- Mailgun

No pongas credenciales SMTP en variables `VITE_*` ni en codigo frontend.

## DNS requeridos

Los valores reales deben salir del proveedor SMTP. No inventes registros definitivos.

SPF generico:

```txt
v=spf1 include:PROVEEDOR_SMTP ~all
```

DKIM:

```txt
Usar exactamente los registros que entregue el proveedor SMTP.
```

DMARC inicial:

```txt
v=DMARC1; p=none; rua=mailto:dmarc@your-production-domain.com; adkim=s; aspf=s
```

Despues de monitorear reportes, el dominio puede endurecer DMARC gradualmente a `quarantine` o `reject`.

## Buenas practicas

- Usa dominio propio verificado y HTTPS.
- Mantiene auth y marketing separados.
- Evita ofertas, slogans comerciales y emojis en asuntos.
- Usa asuntos cortos y transaccionales.
- Usa una sola imagen de marca y un solo boton principal.
- No uses acortadores de enlaces.
- Desactiva link tracking si el proveedor SMTP reescribe enlaces; Supabase Auth usa enlaces sensibles de un solo uso.
- Prueba en Gmail y Outlook antes de produccion.
- Revisa logs de Supabase Auth y logs del proveedor SMTP despues de cada prueba.
- No desactives confirmacion de correo para resolver problemas de entrega.

## Variables documentadas

```env
VITE_NIDO_PUBLIC_LOGO_URL=https://your-production-domain.com/brand/nido-logo.png

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
SMTP_SENDER_NAME=NIDO
SMTP_SENDER_EMAIL=no-reply@your-production-domain.com
```

Estas variables son documentacion operativa. Supabase SMTP se configura en Dashboard o Management API; el frontend no debe consumir secretos SMTP.
