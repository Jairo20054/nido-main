# Modelo de datos de NIDO

Ultima actualizacion: 2026-04-27

Este repositorio hoy tiene tres capas de persistencia relevantes para desarrollo:

- esquema Prisma en ejecucion
- esquema y autenticacion de Supabase
- localStorage del navegador

## 1. Esquema Prisma en ejecucion

Fuente de verdad:

- `backend/prisma/schema.prisma`

## Enums

### `UserRole`

- `TENANT`
- `LANDLORD`
- `ADMIN`

### `PropertyType`

- `APARTMENT`
- `HOUSE`
- `STUDIO`
- `LOFT`
- `PENTHOUSE`
- `ROOM`

### `PropertyEstado`

- `DRAFT`
- `PUBLISHED`
- `RENTED`
- `ARCHIVED`

### `RequestEstado`

- `PENDING`
- `APPROVED`
- `REJECTED`
- `WITHDRAWN`

## Entidad: `User`

Proposito:

- entidad propietaria para propiedades, favoritos y solicitudes de arriendo respaldadas por Prisma

Campos principales:

- `id`
- `firstName`
- `lastName`
- `email`
- `passwordHash`
- `phone`
- `bio`
- `avatarUrl`
- `role`
- `createdAt`
- `updatedAt`

Relaciones:

- posee muchas `Property`
- tiene muchos `Favorite`
- tiene muchos `RentalRequest` como arrendatario
- tiene muchos `RentalRequest` como arrendador

Riesgos o notas:

- Requiere revision del equipo: el flujo de auth actual crea usuarios y perfiles en Supabase, no usuarios Prisma. El codebase no muestra una ruta garantizada de sincronizacion entre ambos almacenes de usuarios.

## Entidad: `Property`

Proposito:

- anuncio de arriendo publicado o en borrador

Campos principales:

- `id`
- `slug`
- `ownerId`
- `title`
- `summary`
- `description`
- `propertyType`
- `status`
- `city`
- `neighborhood`
- `addressLine`
- `monthlyRent`
- `maintenanceFee`
- `securityDeposit`
- `bedrooms`
- `bathrooms`
- `areaM2`
- `parkingSpots`
- `maxOccupants`
- `furnished`
- `petsAllowed`
- `availableFrom`
- `minLeaseMonths`
- `amenities`
- `coverImage`
- `latitude`
- `longitude`

Relaciones:

- pertenece a `User` como propietario
- tiene muchas `PropertyImage`
- tiene muchos `Favorite`
- tiene muchos `RentalRequest`

Reglas de negocio visibles en el codigo:

- el comportamiento publico de listado/detalle se restringe a propiedades `PUBLISHED`, salvo que quien consulta sea el propietario
- eliminar una propiedad se bloquea si tiene solicitudes activas `PENDING` o `APPROVED`

## Entidad: `PropertyImage`

Proposito:

- imagenes ordenadas asociadas a una propiedad

Campos principales:

- `id`
- `propertyId`
- `url`
- `alt`
- `position`

Reglas de negocio:

- `serializeProperty` ordena imagenes por `position`
- los endpoints create/update de propiedades reemplazan las filas de imagenes cuando se envia un nuevo arreglo `images`

## Entidad: `Favorite`

Proposito:

- relacion muchos-a-muchos entre usuario y propiedad

Campos principales:

- `id`
- `userId`
- `propertyId`
- `createdAt`

Restriccion:

- unico `(userId, propertyId)`

## Entidad: `RentalRequest`

Proposito:

- solicitud formal final para arrendar una propiedad

Campos principales:

- `id`
- `propertyId`
- `tenantId`
- `landlordId`
- `desiredMoveIn`
- `leaseMonths`
- `occupants`
- `monthlyIncome`
- `hasPets`
- `phone`
- `message`
- `status`
- `createdAt`
- `updatedAt`

Reglas de negocio visibles en el codigo:

- un usuario no puede mantener multiples solicitudes activas para la misma propiedad
- solo se pueden editar solicitudes pendientes
- solo los arrendadores pueden aprobar o rechazar
- las solicitudes aprobadas no pueden ser eliminadas por los arrendatarios

## 2. Esquema Supabase en ejecucion usado por el codigo

Fuente de verdad:

- `supabase/migrations/20260424020559_nido_rental_backend.sql`

Solo un subconjunto se usa activamente en la ejecucion actual de Node/React.

## Tabla: `profiles`

Proposito:

- datos de perfil del usuario autenticado usados por el middleware de auth y los endpoints de perfil

Campos usados o normalizados en el codigo:

- `id`
- `email`
- `first_name`
- `last_name`
- `phone`
- `bio`
- `avatar_url`
- `locale`
- `country_code`
- `timezone`
- `role` o `primary_role`
- `status`

## Tabla: `landlords`

Proposito:

- extension de perfil especifica por rol

Uso actual en runtime:

- creada durante el bootstrap de perfil en `shared/supabase.js`

## Tabla: `tenants`

Proposito:

- extension de perfil especifica para arrendatarios

Uso actual en runtime:

- creada durante el bootstrap de perfil en `shared/supabase.js`

## Tabla: `properties`

Proposito:

- catalogo del lado Supabase para el flujo de precalificacion

Uso actual en runtime:

- leida por `modules/applications/application.controller.js`

## Tabla: `property_images`

Proposito:

- imagenes para registros de propiedades del lado Supabase

Uso actual en runtime:

- leida por `modules/applications/application.controller.js`

## Tabla: `applications`

Proposito:

- registro guiado de postulacion del lado Supabase

Uso actual en runtime:

- insercion opcional durante la precalificacion cuando quien solicita esta autenticado
- consulta de conteo al calcular request count dentro del application controller

## 3. Tablas del blueprint Supabase aun no expuestas por la API Express

Definidas en la migracion:

- `prequalification_results`
- `document_requirements`
- `document_uploads`
- `verifications`
- `approval_decisions`
- `contracts`
- `contract_parties`
- `signatures`
- `payments`
- `payout_releases`
- `delivery_checklists`
- `inventory_items`
- `notifications`
- `audit_logs`
- `country_rules`

Notas:

- El blueprint SQL tambien define politicas RLS y triggers como:
  - `public.on_auth_user_created()`
  - `public.sync_application_workflow()`
  - `public.bootstrap_contract_from_application(...)`
- Pendiente de validacion: el backend actual evita gran parte de ese flujo usando operaciones directas con admin client y un modelo Prisma separado para solicitudes.

## 4. Modelo de localStorage en el navegador

## Token de auth

Clave:

- `nido_access_token`

Proposito:

- guardar el access token de Supabase usado por `apiClient`

## Borrador de postulacion

Patron de clave:

- `nido_application_draft_<propertyId>`

Forma almacenada:

- `prequalForm`
- `prequalification`
- `documentChecklist`
- `applicantProfile`
- `submittedRequest`
- `updatedAt`

Proposito:

- persistir el estado del borrador entre:
  - precalificacion
  - checklist documental
  - pagina de revision

Riesgos o notas:

- Verdad vista en el codigo: los archivos seleccionados no se suben; solo se conserva metadata del lado cliente como `fileName`, `status` y `validationMessage`.

## 5. Divergencias conocidas del modelo

### Divergencia A: usuarios

- los IDs de auth/profile en Supabase son UUID
- `User` en Prisma es un modelo separado y puede no poblarse automaticamente

### Divergencia B: catalogos de propiedades

- busqueda/detalle/favoritos/solicitudes usan `Property` de Prisma
- la precalificacion usa `properties` de Supabase

### Divergencia C: ciclo de vida de postulacion

- la precalificacion crea filas borrador opcionales en Supabase `applications`
- el envio formal final crea `RentalRequest` en Prisma
- la pagina de revision depende mas de localStorage que de un agregado backend de postulacion

### Requiere revision del equipo

- Definir las entidades canonicas de largo plazo para:
  - usuario
  - propiedad
  - postulacion/solicitud
  - carga documental
  - estado de aprobacion/revision

