# NIDO Blueprint: UX + Product Logic + Supabase Architecture

## 0. Resumen ejecutivo

NIDO debe operar como una plataforma de arriendo justa, auditable y antifraude para Latinoamerica. La recomendacion base es:

- `Aplicar es gratis` para arrendatario.
- La decision no depende del arrendador; depende de reglas visibles, score auditable y excepciones controladas.
- El flujo visible al usuario es simple; el flujo interno es mas granular para automatizar y auditar.
- La arquitectura debe ser `Supabase-first`, con `RLS`, `Storage`, `Realtime` y `Edge Functions` como capa principal.
- El backend Express actual puede vivir como capa transicional, pero la nueva logica sensible debe migrar a Edge Functions.

Decisiones abiertas con recomendacion:

- `Multi-tenant`: agregar tabla `tenants` desde el dia 1. Sin esto, escalar por pais, operador o marca requerira rehacer seguridad y billing.
- `Escrow operacional`: usar proveedor PSP/escrow partner por pais; no asumir que NIDO puede custodiar fondos en su balance en todos los paises.
- `Firma`: empezar con OTP + evidencia fuerte en MVP; integrar proveedor de firma electronica avanzada por pais en V2 cuando la regulacion lo exija.
- `Score`: reglas hibridas. Primero motor deterministicamente explicable; luego sumarle fraude, open banking u OCR avanzado.

---

## 1. Flujo end-to-end

1. Usuario hace clic en `Arrendar`.
2. Ve resumen transparente del inmueble, costos y requisitos minimos.
3. Completa precalificacion corta.
4. Sistema responde de inmediato:
   - `Apto para continuar`
   - `Apto con respaldo`
   - `No apto para este inmueble`
5. Si continua, el sistema arma un checklist documental dinamico.
6. Usuario, codeudor o acudiente cargan documentos con validacion inmediata.
7. Motor de verificacion ejecuta checks automaticos; casos dudosos pasan a revision manual.
8. Se genera decision estandar:
   - `Aprobado`
   - `Aprobado con condiciones`
   - `Rechazado`
9. Si aprueba, se genera resumen humano del contrato y luego contrato formal versionado.
10. Firman arrendatario, arrendador y codeudor si aplica.
11. Se crea pago inicial protegido:
   - recibido
   - retenido por NIDO o partner
   - liberado tras entrega confirmada
12. Se ejecuta entrega digital con checklist, fotos, inventario y observaciones.
13. El contrato pasa a `activo`.
14. Se habilita dashboard mensual de pagos, soporte, historial y mantenimiento.

Estados visibles recomendados para el usuario:

- `Pendiente`
- `En revision`
- `Requiere correccion`
- `Aprobado`
- `Condicionado`
- `Rechazado`
- `Firmado`
- `Pagado`
- `Entregado`
- `Activo`

Estados internos recomendados para el sistema:

- `draft`
- `prequalified`
- `prequalified_with_backup`
- `not_eligible`
- `docs_pending`
- `docs_submitted`
- `auto_review_passed`
- `manual_review_required`
- `correction_required`
- `approved`
- `conditionally_approved`
- `rejected`
- `contract_draft`
- `signatures_pending`
- `fully_signed`
- `payment_pending`
- `funds_held`
- `move_in_pending`
- `delivered`
- `active`
- `cancelled`
- `expired`

---

## 2. Sitemap / mapa de navegacion

Rutas recomendadas:

- `/properties/:slug`
- `/properties/:slug/apply/start`
- `/properties/:slug/apply/prequal`
- `/applications/:id/documents`
- `/applications/:id/review-status`
- `/applications/:id/conditions`
- `/contracts/:id/summary`
- `/contracts/:id/sign`
- `/payments/:id/checkout`
- `/move-in/:id/checklist`
- `/move-in/:id/confirm`
- `/dashboard/tenant`
- `/dashboard/landlord`
- `/dashboard/co-signer`
- `/support`
- `/support/:ticketId`
- `/admin/reviews`
- `/admin/contracts`
- `/admin/payments`
- `/admin/deliveries`

---

## A. Mapa de pantallas

| Pantalla | Objetivo | Contenido clave | CTA principal | CTA secundario | Empty / loading / error |
| --- | --- | --- | --- | --- | --- |
| 1. Property detail | Convertir interes en aplicacion | Hero, precio, ciudad, condiciones, etiqueta `Aplicar gratis`, resumen de proteccion | `Arrendar` | `Guardar` | Loading: skeleton ficha. Error: inmueble no disponible. Empty: sugerir similares |
| 2. Start apply | Alinear expectativas antes de pedir datos | Canon, admin, deposito, fecha disponible, requisitos basicos, tiempo estimado, transparencia documental | `Ver si califico` | `Volver al inmueble` | Loading: resumen. Error: requisitos no cargaron |
| 3. Prequalification | Tomar decision instantanea | Tipo de ocupacion, ingreso mensual, numero de ocupantes, respaldo disponible | `Evaluar gratis` | `Necesito ayuda` | Loading: evaluar en menos de 3 seg. Error: no pudimos evaluar |
| 4. Prequal result fit | Confirmar que puede avanzar | Resultado positivo, proximo paso, docs que va a necesitar | `Continuar con documentos` | `Ver requisitos` | Empty: no aplica |
| 5. Prequal result with backup | Explicar condicion sin castigo | Resultado `Apto con respaldo`, por que se pide respaldo, opciones de codeudor o garantia | `Elegir respaldo` | `Cambiar datos` | Error: reglas no disponibles |
| 6. Prequal result not fit | Cortar friccion con alternativas | Motivo simple, rango sugerido, inmuebles similares, opcion de respaldo | `Ver opciones` | `Intentar con respaldo` | Empty: si no hay similares, sugerir alerta |
| 7. Create account / login gate | Convertir sin perder avance | Beneficios, guardado del progreso, login social/email | `Crear cuenta y seguir` | `Ya tengo cuenta` | Loading: autenticando. Error: sesion no creada |
| 8. Applicant profile | Capturar datos legales y de contacto | Nombre, documento, telefono, direccion, nacionalidad, ocupacion | `Guardar y seguir` | `Guardar para despues` | Empty: campos sugeridos desde Auth |
| 9. Backing choice | Elegir ruta de respaldo | Codeudor, poliza/garantia, acudiente, ver impacto de cada opcion | `Continuar` | `Lo hare luego` | Error: opcion no disponible segun pais |
| 10. Document checklist | Subida inteligente por perfil | Tarjetas por documento, por que se pide, formato, ejemplo, validacion, progreso total | `Enviar a revision` | `Guardar borrador` | Empty: checklist aun no generado. Loading: generando checklist. Error: subida fallida |
| 11. Document capture modal | Mejorar calidad de archivo | Camara/subida, ejemplo visual, tips de legibilidad, recorte | `Usar este archivo` | `Tomar otra foto` | Error: archivo borroso o incompleto |
| 12. Invite co-signer | Incorporar tercero sin friccion | Email/telefono, explicacion del rol, estado de invitacion | `Enviar invitacion` | `Omitir por ahora` | Empty: no hay codeudor agregado |
| 13. Co-signer flow | Cargar datos del codeudor | Resumen del inmueble, por que se le invita, sus propios documentos | `Completar respaldo` | `Preguntar a NIDO` | Loading: vinculando solicitud |
| 14. Review status | Mostrar avance y confianza | Timeline recibido -> en revision -> decision, checks completados, SLA esperado | `Ver detalles` | `Contactar soporte` | Loading: actualizando estado |
| 15. Correction requested | Recuperar solicitud sin reiniciar | Que esta mal, archivo afectado, comentario, plazo, como corregir | `Corregir ahora` | `Hacerlo despues` | Error: comentario no disponible |
| 16. Approval screen | Comunicar decision justa | Aprobado / condicionado / rechazado, motivo claro, siguiente paso | `Continuar al contrato` | `Ver detalles` | Empty: decision aun no emitida |
| 17. Conditions screen | Resolver faltantes | Condiciones activas, deadline, impacto, boton para subir respaldo o corregir | `Completar condicion` | `Hablar con soporte` | Error: condicion vencida |
| 18. Contract summary | Traducir contrato a lenguaje humano | Resumen de canon, duracion, deposito, obligaciones, fechas, inventario incluido | `Ver contrato completo` | `Descargar resumen` | Loading: generando version |
| 19. Contract viewer | Revisar contrato formal | PDF/HTML, comparador de cambios, hash/version, aceptaciones previas | `Firmar ahora` | `Volver al resumen` | Error: contrato no disponible |
| 20. Signature progress | Coordinar firmas | Participantes, quien ya firmo, quien falta, version firmada, evidencia | `Firmar` | `Copiar link` | Loading: validando OTP. Error: OTP expirado |
| 21. Payment explanation | Generar confianza antes de cobrar | Desglose del pago inicial, `no cobramos estudio`, proteccion de fondos, tiempos de liberacion | `Continuar al pago` | `Ver politicas` | Error: monto desactualizado |
| 22. Payment checkout | Cobro seguro | Metodos de pago por pais, desglose, consentimientos, comprobante | `Pagar y proteger mi reserva` | `Cambiar metodo` | Loading: creando intencion. Error: pago rechazado |
| 23. Payment held screen | Explicar custodia | Estado `Pago recibido y protegido`, siguientes pasos para entrega | `Ir a entrega` | `Descargar comprobante` | Empty: pago no confirmado |
| 24. Move-in prep | Preparar entrega | Fecha, checklist, inventario, medidores, fotos pendientes | `Iniciar entrega` | `Reprogramar` | Error: entrega aun no habilitada |
| 25. Move-in checklist | Registrar estado inicial | Habitaciones, items, fotos, observaciones, medidores | `Guardar checklist` | `Pausar` | Loading: subiendo evidencia |
| 26. Delivery confirmation | Cerrar entrega | Resumen de hallazgos, confirmacion de ambas partes, observaciones abiertas | `Confirmar entrega` | `Reportar observacion` | Error: firmas de entrega incompletas |
| 27. Delivery dispute | Manejar diferencias | Items observados, fotos comparativas, comentarios y decision de ops | `Enviar observacion` | `Solicitar revision` | Empty: sin diferencias |
| 28. Tenant dashboard | Operacion mensual | Proximo pago, contrato, pagos, soporte, mantenimiento, documentos | `Pagar mensualidad` | `Reportar mantenimiento` | Empty: sin contratos activos |
| 29. Landlord dashboard | Gestionar inmuebles y casos | Suscripciones, solicitudes, contratos, pagos retenidos/liberados, entregas | `Revisar solicitudes` | `Crear publicacion` | Empty: sin inmuebles |
| 30. Support center | Resolver bloqueos | Tickets, FAQs, trazabilidad por etapa | `Crear ticket` | `Abrir chat` | Empty: sin tickets |
| 31. Ops review queue | Revision manual | Cola por riesgo, checklists, documentos, score, auditoria | `Emitir decision` | `Solicitar correccion` | Empty: sin casos pendientes |
| 32. Payment ops | Conciliar pagos y liberaciones | Intenciones, webhooks, fondos retenidos, liberaciones, excepciones | `Liberar fondos` | `Marcar incidencia` | Empty: sin movimientos |
| 33. Contract ops | Gobernar plantillas | Plantilla por pais, versionado, clausulas permitidas, comparacion | `Publicar plantilla` | `Guardar borrador` | Empty: sin plantilla |

Wireframe textual rapido:

- Barra superior: logo, progreso, ayuda, cerrar.
- Columna principal: contexto + formulario o timeline.
- Columna lateral: resumen del inmueble + costos + mensajes de confianza.
- Pie fijo movil: CTA primario, total relevante y avance.

Microcopy base recomendada:

- `Aplicar es gratis. Solo te pedimos lo necesario para validar tu solicitud.`
- `Te pedimos este documento para confirmar tu identidad y evitar fraude.`
- `Tu pago queda protegido hasta que la entrega se confirme.`
- `La decision sigue reglas estandarizadas, no criterios arbitrarios.`

---

## B. Componentes reutilizables

| Componente | Especificacion |
| --- | --- |
| Boton primario | Alto contraste, ancho fluido, estados default/hover/disabled/loading, texto accionable: `Continuar`, `Firmar`, `Pagar` |
| Boton secundario | Misma jerarquia visual en outline o ghost; para `Guardar para despues`, `Volver`, `Ver detalles` |
| Stepper | 6 etapas visibles: Precalificacion, Documentos, Revision, Contrato, Pago, Entrega. Debe soportar estado actual, completado y bloqueado |
| Tarjeta de inmueble | Foto, canon, admin, ciudad, capacidad, fecha disponible, badge de estado y CTA |
| Tarjeta de documento | Titulo, por que se pide, formatos, ejemplo, uploader, calidad, fecha de subida, estado, comentario de revision |
| Input | Label visible, helper text, placeholder claro, error debajo, mascara por pais si aplica |
| Selector de perfil | Empleado, independiente, estudiante, pensionado, extranjero; icono + descripcion corta |
| Alertas | Success, warning, info, danger. Deben tener titulo corto, texto de apoyo y accion opcional |
| Badges de estado | `Pendiente`, `En revision`, `Requiere correccion`, `Aprobado`, `Condicionado`, `Rechazado`, `Firmado`, `Pagado`, `Entregado`, `Activo` |
| Modal de confirmacion | Titulo, resumen, impacto, CTA confirmatorio y cancelacion |
| Timeline de verificacion | Lista de checks con icono, responsable, fecha, comentario y resultado |
| Timeline de firmas | Participantes, version, orden, estado y evidencia |
| Timeline de pagos | Intento, confirmacion, retencion, liberacion, devolucion |

Estados de componente obligatorios:

- `default`
- `hover`
- `focus`
- `disabled`
- `loading`
- `error`
- `success`

---

## C. Logica de producto

### 1. Flujo de decisiones

Precalificacion recomendada:

- Regla base de capacidad:
  - ocupantes <= `properties.max_occupants`
- Regla base de ingreso:
  - `ingreso_neto / costo_habitacional_total >= multiplicador_pais`
  - `costo_habitacional_total = canon + administracion`
- Multiplicador recomendado por defecto:
  - `>= 3.0` -> apto
  - `>= 2.3 y < 3.0` -> apto con respaldo
  - `< 2.3` -> no apto
- Ajustes por perfil:
  - empleado: estabilidad favorece score
  - independiente: exige mas consistencia documental
  - estudiante: requiere acudiente o codeudor salvo beca/ahorros validados
  - pensionado: score basado en recurrencia y antiguedad del ingreso
  - extranjero: puede requerir respaldo adicional segun pais/regla

### 2. Score de riesgo

Modelo explicable para MVP:

- `identity_confidence` 0-25
- `income_support_quality` 0-25
- `income_to_rent_ratio` 0-25
- `document_completeness` 0-15
- `consistency_and_fraud_flags` 0-10

Clasificacion:

- `80-100` -> riesgo bajo -> aprobado sin codeudor
- `60-79` -> riesgo medio -> condicionado, requiere respaldo
- `< 60` -> riesgo alto -> rechazar o pedir garantia adicional excepcional

Flags automaticos:

- documento vencido
- selfie no coincide
- ingresos inconsistentes con soportes
- extractos incompletos
- mismo documento usado por multiples usuarios
- metadata de archivo sospechosa
- propiedad supera capacidad declarada

### 3. Reglas de excepcion

Si el usuario no cumple:

- mostrar no apto con motivo simple
- ofrecer inmuebles ajustados a presupuesto
- ofrecer respaldo si la regla lo permite
- guardar datos anonimizados para remarketing interno, no para penalizar

Si falta un documento:

- la solicitud no entra a revision final
- estado visible: `Pendiente`
- estado interno: `docs_pending`
- permitir guardar borrador y retomar desde donde quedo

Si el codeudor no aprueba:

- pasar solicitud a `Condicionado`
- ofrecer tres salidas:
  - subir nuevo codeudor
  - usar garantia alternativa
  - cambiar inmueble/presupuesto
- no reiniciar documentos del titular si siguen vigentes

Si el pago falla:

- crear nuevo `payment_intent`
- preservar contrato y firmas por ventana configurable
- mostrar causa amigable:
  - medio rechazado
  - tiempo agotado
  - autenticacion pendiente
- permitir reintento con otro metodo sin rehacer aprobacion

Si la entrega no coincide con el inventario:

- crear incidente de entrega
- fondos siguen retenidos hasta resolver:
  - confirmacion de ambas partes
  - override de ops con evidencia
- contrato no cambia a `activo` hasta cerrar incidente o aprobar entrega parcial segun regla pais

Si el contrato no se firma:

- `signing_deadline_at`
- recordatorios automaticos
- si vence:
  - contrato a `expired`
  - solicitud vuelve a `approved` por una ventana corta o a `cancelled`
  - liberar propiedad si el stock ya no debe bloquearse

Si el usuario abandona el flujo:

- guardar progreso por etapa
- recordatorios:
  - 2 horas
  - 24 horas
  - 72 horas
- retomar desde ultimo paso completado
- expirar documentos temporales o links de firma segun politica

### 4. Reintentos y recuperacion

- Documento rechazado: ilimitado dentro de ventana activa, pero auditar cada version
- Codeudor: max 3 invitaciones activas por solicitud
- Pago: 5 intentos por 24 horas antes de escalar a soporte
- Firma OTP: 3 OTP activos por participante cada 30 minutos
- Entrega: una reprogramacion self-service; siguientes por soporte

---

## D. Backend con Supabase

### 1. Arquitectura recomendada

Stack objetivo:

- `Supabase Auth` para login, sesion y MFA futura
- `Supabase Postgres` como sistema de registro
- `RLS` en todas las tablas expuestas
- `Storage` para documentos, contratos e imagenes
- `Edge Functions` para logica sensible, integraciones y webhooks
- `Realtime` para seguimiento de solicitud, firma, pago y entrega

Decision recomendada de arquitectura:

- Frontend usa `publishable key` y consume:
  - `Auth`
  - consultas seguras con RLS
  - `Realtime`
  - `Edge Functions`
- Las operaciones de alto riesgo no se ejecutan en el navegador:
  - score
  - aprobacion
  - generacion de contrato
  - firma
  - pagos
  - liberacion de fondos
- Express actual queda como BFF temporal mientras migran modulos, pero el nuevo dominio de arriendos debe nacer en Supabase.

### 2. Buckets de Storage

Buckets sugeridos:

- `property-media-public`
- `application-documents-private`
- `contract-artifacts-private`
- `signature-evidence-private`
- `move-in-evidence-private`
- `support-attachments-private`

Regla:

- En `Storage` solo binarios.
- En `Postgres` siempre metadata, hash, mime type, size, owner, version, estado y referencia al bucket/path.

### 3. Tabla adicional recomendada: tenants

Necesaria para multi-tenant real.

| Tabla | Proposito | Campos principales | FKs | Estados | Indices | RLS / permisos | Storage vs Postgres |
| --- | --- | --- | --- | --- | --- | --- | --- |
| tenants | Aislar operadores, marcas o paises | id, name, slug, country_code, status, settings_json, created_at | - | active, suspended, archived | slug unique, country_code | Solo admins y servicios internos escriben; usuarios solo leen su tenant | Solo Postgres |

### 4. Esquema principal

| Tabla | Proposito | Campos principales | FKs | Estados | Indices recomendados | RLS y permisos | Storage vs Postgres |
| --- | --- | --- | --- | --- | --- | --- | --- |
| users | Sombra de `auth.users` con estado de cuenta | id uuid, tenant_id, email, phone, auth_status, is_verified, created_at | tenant_id -> tenants.id | invited, active, blocked, deleted | email unique por tenant, tenant_id + created_at | Cada usuario lee su fila; admins y ops leen por tenant; solo service role crea/bloquea | Solo Postgres |
| profiles | Datos personales y legales | id, user_id, full_name, document_type, document_number, birth_date, nationality, locale, address_json, occupation_type | user_id -> users.id | draft, completed, verified | user_id unique, document_number, occupation_type | Usuario lee/escribe su perfil; ops puede marcar verified | Solo Postgres |
| roles | Roles por alcance | id, user_id, tenant_id, scope_type, scope_id, role_key, granted_by, created_at | user_id -> users.id, tenant_id -> tenants.id | active, revoked | user_id + role_key, scope_type + scope_id | Solo admins/ops escriben; usuarios leen sus roles | Solo Postgres |
| properties | Publicacion e inventario comercial | id, tenant_id, landlord_user_id, country_code, city, slug, title, summary, canon_amount, admin_fee_amount, deposit_amount, currency_code, max_occupants, available_from, status | tenant_id, landlord_user_id -> users.id | draft, published, paused, rented, archived | slug unique, tenant_id + status, city + canon_amount | Publico lee published minimamente; landlord lee/escribe propias; ops aprueba publicacion | Fotos en Storage, resto Postgres |
| listing_requirements | Reglas de elegibilidad por inmueble | id, property_id, country_rule_id, min_income_ratio, accepted_profiles[], requires_backup_under_ratio, allows_students, max_occupants, docs_policy_json | property_id -> properties.id, country_rule_id -> country_rules.id | active, archived | property_id unique | Landlord y ops leen; ops escribe; frontend publico puede leer subset visible | Solo Postgres |
| applications | Expediente principal del arriendo | id, tenant_id, property_id, primary_applicant_user_id, current_public_status, internal_status, prequal_result, requires_backup, risk_band, score_total, move_in_date, lease_months, occupancy_count, declared_income, country_code, expires_at | tenant_id, property_id, primary_applicant_user_id | draft, prequalified, docs_pending, in_review, correction_required, approved, conditionally_approved, rejected, signing, payment_pending, funds_held, move_in_pending, active, cancelled, expired | property_id + current_public_status, primary_applicant_user_id + created_at desc, tenant_id + internal_status | Participantes leen su solicitud; landlord lee solicitudes de su inmueble; ops revisa; solo Edge Functions cambian estados sensibles | Solo Postgres |
| application_members | Participantes de la solicitud | id, application_id, user_id nullable, member_role, invitation_email, invitation_phone, status, joined_at | application_id -> applications.id, user_id -> users.id | invited, pending, active, rejected, withdrawn | application_id + member_role, invitation_email | Miembro invitado o vinculado puede leer su fila; titular/ops crean; solo Edge Functions activan vinculacion | Solo Postgres |
| documents | Metadata y versiones documentales | id, application_id, member_id, document_type_id, storage_bucket, storage_path, file_name, mime_type, size_bytes, sha256, extracted_json, review_status, legibility_status, version_no, uploaded_at | application_id -> applications.id, member_id -> application_members.id, document_type_id -> document_types.id | pending_upload, uploaded, auto_validated, needs_correction, approved, rejected, expired | application_id + review_status, member_id + document_type_id, sha256 | Solo miembros/ops leen documentos de su solicitud; descarga siempre firmada via function; solo uploader y ops crean nuevas versiones | Archivo en Storage, metadata en Postgres |
| document_types | Catalogo de tipos de documento | id, country_code, person_type, occupation_type, code, label, description, accepted_formats[], example_asset_path, is_required, validation_rules_json | - | active, deprecated | country_code + occupation_type + code | Lectura publica autenticada; solo ops/admin edita | Ejemplo visual en Storage, catalogo en Postgres |
| verification_checks | Checks atomicos por solicitud o documento | id, application_id, subject_type, subject_id, check_type, provider, check_status, score_delta, result_json, reviewed_by, created_at, resolved_at | application_id -> applications.id, reviewed_by -> users.id | queued, running, passed, failed, manual_review, waived | application_id + check_status, check_type + created_at | Participantes leen resumen; ops lee detalle; solo Edge Functions/ops insertan o resuelven | Solo Postgres |
| verification_scores | Agregado del score | id, application_id, model_version, identity_score, income_score, ratio_score, completeness_score, fraud_score, total_score, risk_band, explanation_json, decided_by, decided_at | application_id -> applications.id, decided_by -> users.id | draft, final, superseded | application_id + created_at desc, risk_band | Participantes leen explicacion resumida; ops lee detalle; solo Edge Functions generan final | Solo Postgres |
| co_signers | Datos especificos de respaldo | id, application_id, application_member_id, guarantee_type, liability_scope, approved_limit_amount, status, notes | application_id -> applications.id, application_member_id -> application_members.id | invited, docs_pending, in_review, approved, rejected, replaced | application_id + status | Titular y propio codeudor leen; ops y landlord leen solo resultado, no detalle sensible completo | Solo Postgres |
| contracts | Entidad contractual viva | id, application_id, property_id, landlord_user_id, tenant_user_id, country_code, template_key, current_version_id, contract_status, start_date, end_date, canon_amount, deposit_amount, late_fee_policy_json | application_id, property_id, landlord_user_id, tenant_user_id, current_version_id -> contract_versions.id | draft, awaiting_signatures, signed, active, terminated, cancelled, expired | application_id unique, contract_status, landlord_user_id + contract_status | Partes leen su contrato; ops crea/actualiza; frontend no modifica contrato final directo | PDF/HTML versionado en Storage; metadata en Postgres |
| contract_versions | Versiones inmutables del contrato | id, contract_id, version_no, template_version, rendered_html_path, rendered_pdf_path, snapshot_json, sha256, change_summary, created_by, created_at | contract_id -> contracts.id, created_by -> users.id | draft, issued, superseded, signed | contract_id + version_no unique, sha256 | Partes leen versiones permitidas; solo ops/Edge Functions crean nuevas versiones | PDF/HTML en Storage, snapshot y hash en Postgres |
| signatures | Evidencia de firma | id, contract_version_id, signer_member_id, signer_role, method, status, otp_session_id, signed_at, ip_address, device_fingerprint, evidence_json | contract_version_id -> contract_versions.id, signer_member_id -> application_members.id | pending, sent, viewed, otp_verified, signed, failed, expired | contract_version_id + signer_role, signer_member_id + status | Firmante lee su firma; partes leen progreso; solo Edge Functions registran firma definitiva | Evidencia PDF/JSON opcional en Storage; metadata en Postgres |
| payments | Ledger operacional de cobro | id, application_id, contract_id, payer_user_id, payee_user_id nullable, payment_type, amount, currency_code, status, held_until, released_at, provider_ref, settlement_ref, metadata_json | application_id, contract_id, payer_user_id -> users.id | pending, authorized, received, held, released, failed, refunded, chargeback | contract_id + status, payer_user_id + created_at, provider_ref unique | Pagador y beneficiario leen sus pagos; ops y sistema actualizan; nadie desde frontend cambia estado | Soportes o recibos en Storage opcional; ledger en Postgres |
| payment_intents | Intentos de pago y checkout | id, payment_id nullable, application_id, provider, external_intent_id, amount, currency_code, status, expires_at, return_url, failure_reason, created_at | payment_id -> payments.id, application_id -> applications.id | created, pending_user_action, processing, succeeded, failed, expired, cancelled | external_intent_id unique, application_id + created_at desc | Pagador lee sus intents; ops lee todos; solo Edge Functions/PSP webhooks escriben estados | Solo Postgres |
| move_in_checklists | Expediente de entrega | id, contract_id, scheduled_at, started_at, completed_at, status, tenant_confirmed_at, landlord_confirmed_at, ops_resolution, notes | contract_id -> contracts.id | pending, in_progress, delivered, with_observations, disputed, resolved | contract_id unique, status | Partes leen y escriben sus observaciones; solo ambas partes u ops cierran | Fotos en Storage, estado en Postgres |
| inventory_items | Items del inventario y estado | id, checklist_id, room_name, item_name, expected_condition, observed_condition, meter_reading nullable, notes, status | checklist_id -> move_in_checklists.id | pending, ok, observed, disputed, replaced | checklist_id + room_name, status | Partes leen/escriben durante entrega; ops resuelve disputas | Fotos y anexos en Storage; item y estado en Postgres |
| maintenance_requests | Soporte post-entrega | id, contract_id, created_by_user_id, category, priority, description, status, assigned_to, resolution_notes, created_at, closed_at | contract_id -> contracts.id, created_by_user_id -> users.id, assigned_to -> users.id | open, triaged, in_progress, waiting_tenant, resolved, closed | contract_id + status, created_by_user_id + created_at | Arrendatario y arrendador leen segun contrato; ops/support gestionan asignacion | Adjuntos en Storage; ticket en Postgres |
| notifications | Bandeja de notificaciones | id, user_id, tenant_id, channel, template_key, title, body, payload_json, sent_at, read_at, status | user_id -> users.id, tenant_id -> tenants.id | queued, sent, delivered, read, failed | user_id + read_at, status + created_at | Cada usuario lee las suyas; solo sistema crea; ops puede reintentar | Solo Postgres |
| audit_logs | Trazabilidad inmutable | id, tenant_id, actor_user_id nullable, actor_type, entity_type, entity_id, action, before_json, after_json, reason_code, ip_address, user_agent, created_at | tenant_id -> tenants.id, actor_user_id -> users.id | appended | entity_type + entity_id + created_at, actor_user_id + created_at, action | Solo ops/admin/compliance leen; solo sistema y funciones insertan | Solo Postgres |
| support_tickets | Casos transversales | id, tenant_id, requester_user_id, application_id nullable, contract_id nullable, category, priority, status, owner_user_id, summary, created_at, resolved_at | tenant_id, requester_user_id, application_id, contract_id, owner_user_id | open, pending_customer, pending_internal, resolved, closed | requester_user_id + status, owner_user_id + status | Requester lee/escribe comentarios propios; soporte/ops gestionan | Adjuntos en Storage; ticket en Postgres |
| country_rules | Parametrizacion multi-pais | id, tenant_id, country_code, currency_code, income_ratio_default, allowed_occupations[], allowed_document_types_json, signature_mode, escrow_mode, guarantee_options_json, late_fee_rules_json, contract_template_family, active_from, active_to | tenant_id -> tenants.id | draft, active, deprecated | country_code + active_from, tenant_id + country_code | Solo ops/legal/admin editan; frontend puede leer subset publico via view | Solo Postgres |
| pricing_plans | Monetizacion B2B2C sin cobrar estudio al arrendatario | id, tenant_id, country_code, plan_key, audience, billing_mode, monthly_price, success_fee_amount, included_listings, included_reviews, features_json, status | tenant_id -> tenants.id | draft, active, archived | tenant_id + plan_key, country_code + audience | Publico puede leer planes visibles; billing admin edita | Solo Postgres |
| landlord_subscriptions | Suscripcion del arrendador | id, tenant_id, landlord_user_id, pricing_plan_id, status, starts_at, renews_at, ends_at, provider_ref, metadata_json | tenant_id, landlord_user_id -> users.id, pricing_plan_id -> pricing_plans.id | trial, active, past_due, cancelled, expired | landlord_user_id + status, pricing_plan_id + status | Arrendador lee sus suscripciones; billing/ops gestionan | Solo Postgres |

### 5. Reglas RLS transversales

Principios:

- `auth.uid()` solo ve lo suyo por defecto.
- El landlord ve solo expedientes de sus inmuebles.
- El codeudor ve solo solicitudes donde esta invitado o vinculado.
- El reviewer/ops nunca se modela con bypass global en frontend; su acceso se da por `roles`.
- Escrituras sensibles se enrutan por `Edge Functions`, no con `insert/update` directo desde UI.

Politicas base:

- `SELECT own`: `user_id = auth.uid()`
- `SELECT related application`: miembro de `application_members` o `property.landlord_user_id = auth.uid()`
- `INSERT own`: solo en tablas de borrador o entrada propia
- `UPDATE own`: solo campos no sensibles y solo mientras el estado lo permita
- `APPROVE`: solo rol `ops_reviewer`, `ops_admin` o sistema

### 6. Que va a Storage y que va a Postgres

Siempre a Storage:

- cedulas, pasaportes, selfies
- cartas laborales
- desprendibles
- extractos
- RUT o equivalentes
- PDFs de contrato
- fotos de entrega
- adjuntos de soporte

Siempre a Postgres:

- metadata del archivo
- hashes
- estado de validacion
- score
- decisiones
- trazabilidad
- referencias a bucket/path

---

## E. Edge Functions

| Funcion | Responsabilidad | Input principal | Output principal |
| --- | --- | --- | --- |
| `create-application` | Crear expediente, miembros iniciales y snapshot del inmueble | property_id, prequal_payload, applicant_profile | application_id, current_status |
| `evaluate-prequalification` | Aplicar reglas por pais e inmueble | property_id, occupation_type, income, occupants, backup_option | result, reasons[], next_required_docs[] |
| `validate-document` | Validar formato, hash, legibilidad y clasificacion | document_id | review_status, legibility_status, extracted_json |
| `calculate-risk-score` | Ejecutar score explicable | application_id | total_score, risk_band, explanation_json |
| `issue-review-decision` | Emitir aprobado/condicionado/rechazado con motivo | application_id, reviewer_context | public_status, conditions[] |
| `create-contract-version` | Renderizar contrato desde plantilla y snapshot | application_id or contract_id | contract_id, contract_version_id, pdf_path |
| `register-signature` | Verificar OTP o firma externa y cerrar evidencia | contract_version_id, signer_token, otp_code | signature_status, contract_status |
| `create-payment-intent` | Crear intento con proveedor local | application_id, payment_breakdown, payment_method | payment_intent_id, checkout_payload |
| `payment-webhook` | Recibir webhooks de PSP | provider payload | payment status actualizado, audit log |
| `release-held-funds` | Liberar o retener fondos tras entrega | contract_id, checklist_status | payment_status, settlement_ref |
| `send-notification` | Email, SMS, WhatsApp o inbox | template_key, user_id, payload | notification_id, status |
| `append-audit-log` | Insertar evento de auditoria idempotente | actor, entity, action, diff | audit_log_id |
| `signature-provider-webhook` | Sincronizar proveedor de firma | provider payload | signatures y contract_versions actualizados |
| `kyc-webhook` | Futuro: identidad/KYC externo | provider payload | verification_checks actualizados |

Buenas practicas:

- Todas deben ser idempotentes.
- Todas deben loggear `request_id`.
- Ninguna debe confiar en estado enviado por cliente si puede reconsultarlo en Postgres.
- Las integraciones externas deben aislar secretos en `Edge Function Secrets`.

---

## F. Realtime

Canales sugeridos:

- `application:{id}`
- `contract:{id}`
- `payment:{id}`
- `move-in:{id}`
- `maintenance:{id}`

Eventos que deben reflejarse en tiempo real:

- cambio de estado de solicitud
- documento recibido / corregido / aprobado / rechazado
- score emitido
- decision final
- firma pendiente / OTP enviado / firma completada
- pago recibido
- pago retenido
- pago liberado
- entrega iniciada
- entrega confirmada
- incidente de entrega abierto/resuelto
- mantenimiento abierto/cerrado

Payload minimo por evento:

- `event_type`
- `entity_id`
- `public_status`
- `headline`
- `timestamp`
- `actor_role`
- `next_action`

---

## G. Seguridad y escalabilidad

Reglas no negociables:

- Frontend solo usa `publishable key`.
- Nunca exponer `service_role` al navegador.
- `RLS` activo por defecto en todo lo expuesto.
- Menor privilegio por rol y por tabla.
- Auditoria obligatoria para:
  - decisiones
  - cambios de contrato
  - firmas
  - pagos
  - liberaciones
  - overrides manuales

Escalabilidad:

- Parametrizar todo lo pais-especifico en `country_rules`, no en codigo hardcoded.
- Separar `public status` y `internal status`.
- Disenar score por `model_version`.
- Versionar plantillas de contrato.
- Usar `tenants` para soportar mas de un operador o marca.
- Usar colas/eventos para proveedores externos y webhooks.
- Guardar snapshots de datos criticos al generar contrato y al cobrar.

Recomendaciones de rendimiento:

- Indices compuestos por `tenant_id + status + created_at`.
- Lecturas del dashboard sobre vistas materializadas o vistas denormalizadas seguras si el volumen crece.
- Particionar logicamente `audit_logs` y `notifications` si superan alto volumen.
- Procesar OCR/KYC y scoring pesado de forma asincrona con estados intermedios.

---

## H. Experiencia de usuario

Principios de tono:

- claro
- humano
- sin legalismos innecesarios
- sin castigo
- con trazabilidad

Mensajes clave en UI:

- `Aplicar es gratis.`
- `Solo te pedimos documentos que ayudan a validar tu solicitud.`
- `Te mostramos por que pedimos cada documento.`
- `La revision sigue reglas estandarizadas para reducir arbitrariedad.`
- `Tu pago queda protegido hasta confirmar la entrega.`
- `Si algo no cuadra, podras corregirlo sin empezar de cero.`

Patrones UX obligatorios:

- Barra de progreso persistente
- Tiempo estimado por etapa
- Guardado automatico
- Ayuda contextual por documento
- Estados visibles y consistentes
- Resumen humano antes del contrato
- Explicacion simple de decisiones y condiciones

---

## I. Entregables finales

### 1. Wireframe textual pantalla por pantalla

`Property detail`

- Header con breadcrumb, foto principal, badge `Aplicar gratis`
- Columna principal con descripcion, amenidades, reglas y resumen del inmueble
- Aside con canon, admin, deposito, timeline del proceso y CTA `Arrendar`

`Start apply`

- Hero corto con inmueble, ciudad, monto total mensual
- Bloque `Antes de empezar`
- Lista de requisitos basicos
- Bloque `No cobramos estudio`
- CTA `Ver si califico`

`Prequalification`

- Selector de ocupacion
- Ingreso mensual
- Numero de habitantes
- Respaldo disponible
- Mensaje de privacidad y tiempo estimado

`Document checklist`

- Stepper arriba
- Progress bar `3 de 7 documentos`
- Tarjetas de documento
- Sidebar con resumen de solicitud y ayuda

`Review status`

- Badge de estado
- Timeline vertical
- Cards de checks completados y pendientes
- CTA contextual: corregir, esperar, ver contrato

`Contract summary`

- Bloque `En palabras simples`
- Canon, fecha de inicio, duracion, deposito, mantenimiento, salida
- CTA `Ver contrato completo`

`Sign`

- Lista de firmantes
- Version a firmar
- OTP modal
- Evidencia y confirmacion final

`Payment`

- Desglose del pago inicial
- Mensaje `Tu dinero queda protegido`
- Selector de metodo
- CTA de pago

`Move-in checklist`

- Habitacion por habitacion
- Fotos antes/despues
- Inventario
- Medidores
- Observaciones

`Tenant dashboard`

- Tarjeta del contrato activo
- Proximo pago
- Historial de pagos
- Atajos a soporte, mantenimiento, contrato y entrega

### 2. Arquitectura backend

- Auth: Supabase Auth
- DB: Postgres en Supabase
- Files: Supabase Storage
- Business logic: Edge Functions
- Real-time state sync: Supabase Realtime
- Optional transitional BFF: Express solo mientras migran modulos viejos

### 3. Reglas de negocio

- No se cobra estudio al arrendatario
- El arrendador no aprueba discrecionalmente; revisa resultado y evidencia
- El score define si sigue, se condiciona o se rechaza
- Documentos incompletos no pasan a decision final
- Contrato solo se genera sobre solicitud aprobada o condicionada resuelta
- Pago inicial solo se cobra tras contrato listo para firma o firmado segun pais/proveedor
- Fondos no se liberan hasta entrega confirmada o resolucion de ops

### 4. Especificacion de estados

`Aplicacion`

- pendiente
- en revision
- requiere correccion
- aprobado
- condicionado
- rechazado

`Contrato`

- borrador
- pendiente de firmas
- firmado
- activo
- terminado

`Pago`

- pendiente
- recibido
- retenido
- liberado
- fallido
- reembolsado

`Entrega`

- pendiente de entrega
- en proceso
- entregado
- con observaciones
- resuelto

### 5. Endpoints / funciones

- `evaluate-prequalification`
- `create-application`
- `upload-document`
- `validate-document`
- `invite-co-signer`
- `calculate-risk-score`
- `issue-review-decision`
- `create-contract-version`
- `send-signature-otp`
- `register-signature`
- `create-payment-intent`
- `payment-webhook`
- `confirm-move-in`
- `release-held-funds`
- `create-maintenance-request`
- `send-notification`
- `append-audit-log`

### 6. MVP vs V2

MVP recomendado:

- Precalificacion instantanea por reglas simples
- Subida documental manual con validaciones basicas
- Revision manual asistida por checks automaticos
- Score explicable
- Contrato versionado desde plantilla
- Firma OTP
- Pago inicial con PSP
- Liberacion manual asistida tras confirmacion de entrega

V2 recomendado:

- OCR y parsing automatico
- open banking para validacion de ingresos
- KYC externo
- antifraude de dispositivos y huellas documentales
- garantias integradas
- conciliacion automatica y payouts mas sofisticados
- analytics de conversion por etapa
- motor de pricing y subscription management avanzado

### 7. Riesgos y edge cases

- Regulacion de escrow cambia por pais
- Firmas OTP pueden no ser suficientes para todos los contratos
- Arrendador quiere imponer reglas arbitrarias
- Documentos validos pero no legibles
- Mismo codeudor respaldando demasiadas solicitudes
- Cambio de precio del inmueble durante el proceso
- Contrato firmado con version distinta a la mostrada
- Pago recibido despues de expirar la aprobacion
- Entrega parcial con observaciones relevantes
- Soporte saturado si la correccion documental es poco clara

### 8. Criterios de aceptacion para desarrollo

Precalificacion:

- dado un usuario en `Start apply`, cuando envia datos basicos, entonces recibe resultado en menos de 3 segundos
- el sistema siempre devuelve motivo y siguiente accion

Documentos:

- el checklist cambia segun ocupacion y respaldo
- cada documento muestra `por que se pide`, formato, ejemplo y estado
- un documento borroso puede marcarse `requiere correccion` sin reiniciar el resto

Revision:

- toda decision deja `reason_code`, `actor` y `timestamp`
- el score siempre guarda explicacion y version del modelo

Contrato:

- no puede emitirse contrato si la aplicacion no esta aprobada o condicion resuelta
- cada version tiene hash y snapshot de datos

Firma:

- cada firma registra firmante, fecha, sesion, metodo y version
- el contrato cambia a `firmado` solo cuando firman todos los requeridos

Pago:

- el arrendatario nunca ve cobro por estudio
- el pago inicial se refleja en tiempo real
- los fondos no se liberan si la entrega no esta confirmada

Entrega:

- checklist, fotos e inventario quedan asociados al contrato
- si hay observaciones, el caso queda trazable y los fondos siguen retenidos

Dashboard:

- un arrendatario activo siempre puede ver contrato, pagos, proximas fechas y soporte

---

## Version resumida para pitch deck

NIDO convierte el arriendo en un flujo digital justo y trazable: el usuario aplica gratis, se precalifica en segundos, sube solo los documentos necesarios, recibe una decision estandarizada, firma dentro de la app y realiza un pago protegido que solo se libera cuando la entrega se confirma. Todo queda auditado, versionado y listo para escalar por pais con reglas configurables.

## Version ultra practica para Figma

- Disenar 10 vistas core:
  - Property detail
  - Start apply
  - Prequalification
  - Result
  - Document checklist
  - Review status
  - Contract summary
  - Signatures
  - Payment held
  - Move-in checklist
- Crear design system minimo:
  - botones
  - inputs
  - badges
  - steppers
  - document cards
  - timelines
  - alerts
- Cada vista debe tener:
  - desktop
  - mobile
  - loading
  - error
  - empty
  - success

## Version tecnica para frontend y backend

Frontend:

- React routes por etapa
- session persistida por Supabase Auth
- consultas con RLS
- realtime subscriptions por `application_id`
- upload a Storage con signed URLs
- stepper persistente + autosave

Backend:

- Edge Functions para logica sensible
- Postgres como source of truth
- triggers ligeros para auditoria y timestamps
- webhooks de pago y firma aislados
- modelo de datos versionado y multi-tenant con `tenant_id`

## Recomendacion final

La mejor decision para NIDO es separar desde el inicio tres cosas:

- `estado visible al usuario`
- `estado interno del sistema`
- `reglas por pais`

Esa separacion permite crecer de Colombia a otros mercados sin reescribir el core, evita arbitrariedad del arrendador y deja espacio para pasar de MVP manual a automatizacion real sin romper la experiencia.
