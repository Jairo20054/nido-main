# SECURITY AUDIT REPORT - NIDO

Fecha de auditoria: 2026-06-03  
Alcance: repositorio local `C:\NIDO`, codigo frontend/backend, configuracion, migraciones Supabase, historial Git basico y dependencias npm.

## Resumen ejecutivo

| Severidad | Total | Corregido | Pendiente/manual |
| --- | ---: | ---: | ---: |
| Critico | 0 | 0 | 0 |
| Alto | 1 | 1 | 0 |
| Medio | 4 | 3 | 1 |
| Bajo | 3 | 1 | 2 |

No se confirmaron secretos reales versionados en `HEAD`. Los archivos `.env` locales contienen valores sensibles reales, pero no estan versionados y estan cubiertos por `.gitignore`. No se imprimen valores completos en este reporte.

## Stack identificado

- Frontend: React + Vite.
- Backend: Node.js + Express.
- Base de datos: PostgreSQL/Supabase + Prisma ORM.
- Auth: Supabase Auth con JWT Bearer hacia backend.
- Storage: Supabase Storage para medios de propiedades.
- Servicios externos: Deepsek opcional server-side.
- Dependencias principales: `express`, `cors`, `helmet`, `@supabase/supabase-js`, `@prisma/client`, `joi`, `react`, `vite`.

## Hallazgos

| ID | Severidad | Archivo/linea | Hallazgo | Estado | Accion |
| --- | --- | --- | --- | --- | --- |
| SEC-001 | Alto | `backend/src/modules/deepsek/deepsek.routes.js:16` | El endpoint `POST /api/deepsek/analyze` estaba rate-limited y validado, pero no autenticado. Al consumir una API server-side, esto permitia abuso de costos desde clientes no autenticados. | Corregido | Se agrego `requireAuth` al endpoint y comentario `[SECURITY FIX]`. |
| SEC-002 | Medio | `backend/src/app.js:15` | Headers HTTP de seguridad estaban incompletos y definidos manualmente; faltaba CSP/HSTS estructurado. | Corregido | Se instalo `helmet`, se agrego CSP, `frameAncestors`, `objectSrc`, HSTS en produccion y `Referrer-Policy`. |
| SEC-003 | Medio | `package-lock.json` | `npm audit` detecto `qs` con vulnerabilidad DoS moderada. | Corregido | Se ejecuto `npm audit fix`; `qs` quedo en `6.15.2` y `npm audit` reporta 0 vulnerabilidades. |
| SEC-004 | Medio | `backend/src/shared/supabase-auth.js:279`, `:314`, `:351` | Helper legado registraba objetos completos de error de Supabase Auth. Estos objetos podrian incluir contexto sensible segun SDK/entorno. | Corregido | Los logs ahora registran solo `error.message` o fallback generico. |
| SEC-005 | Medio | `frontend/src/lib/supabaseClient.js:41` | Supabase frontend usa `persistSession: true`, que persiste sesion en storage del navegador por defecto. Es funcional, pero mas expuesto ante XSS que cookies `httpOnly`. | Pendiente/manual | Requiere cambio arquitectonico a auth server-side/cookies `httpOnly` para no romper persistencia de sesion. |
| SEC-006 | Bajo | `.gitignore` | Faltaban patrones defensivos para certificados, llaves, backups y archivos tipo `credentials.*`/`secrets.*`. | Corregido | Se agregaron patrones de ignore para material sensible y exports locales. |
| SEC-007 | Bajo | `.env`, `backend/.env`, `.codex-artifacts/publish-form-check/.env` | Existen archivos locales con variables sensibles configuradas. No estan rastreados por Git; `.codex-artifacts` esta ignorado. | Pendiente/manual | Mantener fuera de commits; rotar si alguno fue compartido por chat/captura o copiado fuera del equipo. |
| SEC-008 | Bajo | `docs/SUPABASE_GUIA_COMPLETA.md`, `docs/SUPABASE_README.md` | Documentacion antigua contiene placeholders que parecen JWT truncados (`eyJ...`) y menciona `localStorage` para tokens. No se confirmo secreto completo. | Pendiente/manual | Limpiar placeholders y actualizar docs para reflejar el flujo actual con Supabase Auth. |

## Revision de secretos

- `.env`, `backend/.env` y `.codex-artifacts/publish-form-check/.env` existen localmente y contienen valores configurados. No estan versionados segun `git ls-files`.
- `.env.example`, `backend/.env.example` y `frontend/.env.example` usan placeholders, no secretos reales confirmados.
- No se encontro `SUPABASE_SERVICE_ROLE_KEY` en frontend bajo `VITE_*`.
- El validador `scripts/env-check.js` bloquea variables sensibles con prefijo `VITE_`.
- Busquedas en `HEAD` encontraron nombres de secretos y placeholders en docs/config, no credenciales completas confirmadas.

## Revision de Git

- `git ls-files -- .env ...` no muestra `.env` rastreados.
- `git log --all -- .env backend/.env frontend/.env` no encontro commits de esos archivos.
- `git log -S SUPABASE_SERVICE_ROLE_KEY` y `git log -S DATABASE_URL` encontro commits que cambiaron ejemplos/documentacion/configuracion, no `.env` versionados.

Recomendacion: si alguna clave real fue pegada manualmente en issues, chats, capturas o documentos externos, rotarla aunque Git no muestre `.env` versionados.

## Auth, autorizacion y RLS

- Rutas sensibles de backend usan `requireAuth`/`requireRoles` y los controladores verifican propietario o parte involucrada en propiedades, solicitudes, favoritos y usuario.
- `user_metadata` no se usa para conceder admin; el codigo distingue roles autoasignables de grants administrativos.
- Migraciones Supabase habilitan RLS en tablas criticas (`profiles`, `properties`, `applications`, `document_uploads`, `favorites`, etc.).
- No se detectaron policies `USING (true)` o `WITH CHECK (true)`.
- Storage de medios usa policies por carpeta `auth.uid()` para insert/update/delete.

## Verificacion ejecutada

- `npm audit --audit-level=moderate` - OK, 0 vulnerabilidades.
- `npm run env:check` - OK, variables requeridas presentes y sin secretos `VITE_`.
- Busquedas con `rg`, `git grep`, `git log -S` sobre patrones de secretos.

## Recomendaciones adicionales

1. Migrar sesiones del navegador a cookies `httpOnly`, `Secure`, `SameSite=Lax/Strict` si el backend pasa a manejar auth server-side.
2. Mantener JWT expiry corto en Supabase para entornos productivos.
3. Limpiar documentacion antigua que menciona tokens en `localStorage` para evitar instrucciones inseguras.
4. Ejecutar Supabase Advisors contra el proyecto real antes de produccion.
5. Rotar claves si los archivos `.env` locales fueron compartidos fuera del repositorio.
