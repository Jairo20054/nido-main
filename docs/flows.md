# Flujos funcionales de NIDO

Ultima actualizacion: 2026-04-27

Este archivo documenta el comportamiento que hoy si esta implementado, no el blueprint completo de estado futuro.

## Flujo 1: Explorar propiedades destacadas

### Proposito

Permitir que usuarios anonimos o autenticados exploren un conjunto curado de propiedades publicadas desde la pagina principal.

### Entradas

- ruta `/`
- token de auth opcional

### Proceso

1. `HomePage` carga y llama `GET /api/properties/featured`.
2. `property.controller.getFeaturedPropiedades` consulta Prisma por las cuatro propiedades `PUBLISHED` mas recientes.
3. Los resultados se serializan con propietario, imagenes y metadata de favoritos.
4. El frontend renderiza tarjetas y permite navegar a la pagina de detalle.

### Salidas

- tarjetas de propiedades en la home

### Dependencias

- `frontend/src/features/home/HomePage.jsx`
- `backend/src/modules/properties/property.controller.js`
- Prisma `Property`, `PropertyImage` y `User`

### Riesgos o notas

- La busqueda del home escribe query params con alias en espanol como `ciudad`, `tipo`, `min`, `max`, `hab`, `banos`. `useSearchFilters` soporta tanto esos nombres como los nombres estilo API.

## Flujo 2: Buscar en el catalogo

### Proposito

Permitir que las personas filtren propiedades publicadas sin iniciar sesion.

### Entradas

- ruta `/properties`
- query params de la URL

### Proceso

1. `SearchPage` lee filtros mediante `useSearchFilters`.
2. Los filtros con debounce se envian a `GET /api/properties`.
3. El backend valida query params con Joi.
4. `property.controller.listPropiedades` construye clausulas Prisma `where` y `orderBy`.
5. El frontend aplica filtrado adicional del lado cliente para amenidades como parqueadero y seguridad.

### Salidas

- lista paginada de propiedades en la UI

### Dependencias

- `frontend/src/features/properties/SearchPage.jsx`
- `frontend/src/features/properties/useSearchFilters.js`
- `backend/src/modules/properties/property.schemas.js`
- `backend/src/modules/properties/property.controller.js`

### Riesgos o notas

- La API de busqueda devuelve metadata de paginacion, pero el frontend actual solo consume `response.data`, no `response.meta`.
- El modo mapa es solo un placeholder visual.

## Flujo 3: Autenticacion

### Proposito

Crear y autenticar usuarios solo cuando el recorrido requiere identidad o trazabilidad.

### Entradas

- `/login`
- `/register`

### Proceso

1. El frontend envia credenciales o datos de registro a `/api/auth/*`.
2. El backend delega en Supabase Auth.
3. En el registro, el backend tambien crea una fila `profiles` mediante el cliente admin de Supabase.
4. El frontend guarda el access token devuelto en localStorage.
5. Al cargar la app, `AuthProvider` llama `/api/auth/me` si existe un token.

### Salidas

- access token en localStorage
- estado `user` en `AuthProvider`

### Dependencias

- `frontend/src/app/providers/AuthProvider.jsx`
- `backend/src/modules/auth/*`
- `backend/src/shared/supabase-auth.js`

### Riesgos o notas

- Verdad vista en el codigo: el logout es solo del lado cliente; el backend simplemente confirma la solicitud.
- Existen rutas de recuperacion de contrasena en el backend, pero no hay una pantalla frontend dedicada para reset-password en el mapa actual de rutas.

## Flujo 4: Guardar y quitar favoritos

### Proposito

Permitir que usuarios autenticados guarden propiedades de interes.

### Entradas

- accion desde tarjeta de propiedad o detalle
- token de auth

### Proceso

1. El frontend alterna el estado favorito mediante `/api/favorites/:propertyId`.
2. El backend verifica al usuario autenticado.
3. Prisma hace upsert o delete de la relacion favorita.
4. El frontend actualiza el estado local de forma optimista despues del exito.

### Salidas

- lista de propiedades guardadas en `/saved`

### Dependencias

- `frontend/src/features/favorites/SavedPropiedadesPage.jsx`
- `frontend/src/features/properties/SearchPage.jsx`
- `frontend/src/features/properties/PropertyDetailPage.jsx`
- `backend/src/modules/favorites/*`

### Riesgos o notas

- Los usuarios anonimos pueden navegar, pero no guardar; la UI muestra un mensaje explicativo en vez de redirigir de inmediato.

## Flujo 5: Precalificacion guiada de postulacion

### Proposito

Evaluar si una propiedad parece viable antes de pedir una solicitud formal.

### Entradas

- ruta `/properties/:id/apply/prequal`
- `propertyId`
- tipo de ocupacion
- ingreso mensual
- ocupantes
- disponibilidad de respaldo

### Proceso

1. `ApplyPrequalificationPage` carga la propiedad con `usePropertyDetails`.
2. La persona envia el formulario de precalificacion.
3. El frontend llama `POST /api/applications/prequalify`.
4. El backend lee la propiedad desde Supabase `properties`.
5. El backend calcula:
   - resultado de elegibilidad
   - banda de riesgo
   - puntaje
   - razones
   - recomendaciones
   - checklist documental
6. Si existe `req.user`, el backend tambien inserta una fila `applications` en Supabase con estado `draft`.
7. El frontend guarda el resultado de precalificacion y el checklist en localStorage.

### Salidas

- resultado de precalificacion en la UI
- borrador opcional de postulacion en Supabase
- borrador en localStorage

### Dependencias

- `frontend/src/features/applications/ApplyPrequalificationPage.jsx`
- `backend/src/modules/applications/application.controller.js`
- Supabase `properties`, `property_images`, `profiles`, `applications`

### Riesgos o notas

- Pendiente de validacion: el ID de `applications` que devuelve Supabase se retorna, pero el frontend no lo usa en pasos posteriores.
- La API actual acepta auth opcional aqui porque la UX permite precalificar antes del login.

## Flujo 6: Checklist documental y envio de solicitud formal

### Proposito

Recoger contexto del postulante y habilitar el envio final.

### Entradas

- ruta `/properties/:id/apply/documents`
- borrador de precalificacion en localStorage
- usuario autenticado para el envio final

### Proceso

1. La pagina carga el borrador de precalificacion desde localStorage.
2. Si no existe precalificacion, la persona vuelve al paso de prequal.
3. Las selecciones de archivos se validan solo en el navegador:
   - revision de extension
   - tamano minimo
   - tamano maximo
4. El estado de los documentos se guarda nuevamente en localStorage.
5. En el envio final, la pagina llama `POST /api/requests`.
6. El backend crea un `RentalRequest` en Prisma.
7. El frontend guarda la carga enviada de la solicitud en localStorage y navega a la pagina de revision.

### Salidas

- solicitud de arriendo en Prisma
- borrador local actualizado

### Dependencias

- `frontend/src/features/applications/ApplicationDocumentosPage.jsx`
- `backend/src/modules/requests/*`

### Riesgos o notas

- Verdad vista en el codigo: los archivos no se suben al backend ni a almacenamiento en la nube.
- Verdad vista en el codigo: el cuerpo de la solicitud incluye un resumen de texto generado desde metadata del borrador.
- La pagina exige auth solo en el punto final de envio.

## Flujo 7: Pagina de revision

### Proposito

Mostrar a la persona una vista amable del estado despues de enviar la solicitud.

### Entradas

- ruta `/properties/:id/apply/review`
- borrador en localStorage

### Proceso

1. La pagina carga datos de la propiedad desde el backend.
2. La pagina carga `submittedRequest` desde localStorage.
3. Mapea el estado Prisma de la solicitud a un estado simplificado de aplicacion:
   - `PENDING` -> `in_review`
   - `APPROVED` -> `approved`
   - `REJECTED` -> `rejected`
4. Renderiza una linea de tiempo construida por completo a partir del borrador local y la respuesta enviada de la solicitud.

### Salidas

- UI de revision

### Dependencias

- `frontend/src/features/applications/ApplicationReviewPage.jsx`

### Riesgos o notas

- Verdad vista en el codigo: no existe un endpoint backend para recargar el estado completo de revision de la postulacion guiada.
- Si se limpia localStorage, la pagina de revision pierde contexto aunque la solicitud Prisma siga existiendo.

## Flujo 8: Gestion del arrendador

### Proposito

Permitir que usuarios autenticados creen, actualicen, eliminen y revisen solicitudes sobre sus propiedades.

### Entradas

- ruta `/manage`
- token de auth

### Proceso

1. `ManagementPage` carga:
   - `GET /api/properties/mine`
   - `GET /api/requests/received`
2. `PropertyForm` se usa para crear o actualizar propiedades.
3. Crear/actualizar/eliminar propiedades llama endpoints de Prisma.
4. Aprobar o rechazar solicitudes llama `PATCH /api/requests/:id/status`.

### Salidas

- UI de inventario del arrendador
- UI de revision de solicitudes

### Dependencias

- `frontend/src/features/dashboard/ManagementPage.jsx`
- `frontend/src/features/properties/PropertyForm.jsx`
- `backend/src/modules/properties/*`
- `backend/src/modules/requests/*`

### Riesgos o notas

- Requiere revision del equipo: el CRUD de propiedades depende de usuarios Prisma, mientras los usuarios de auth vienen de perfiles Supabase. Este es el mayor riesgo de consistencia en tiempo de ejecucion dentro del backend actual.

## Flujo 9: Pagina de cuenta

### Proposito

Permitir que la persona actualice sus datos de perfil y vea sus propias solicitudes de arriendo enviadas.

### Entradas

- ruta `/account`
- token de auth

### Proceso

1. `AccountPage` precarga el usuario desde el contexto de auth.
2. Hace `GET /api/requests/mine`.
3. Los cambios de perfil se envian a `PATCH /api/users/me`, que escribe sobre `profiles` de Supabase.

### Salidas

- perfil actualizado en el contexto de auth
- lista de solicitudes

### Dependencias

- `frontend/src/features/account/AccountPage.jsx`
- `backend/src/modules/users/*`
- `backend/src/modules/requests/*`

### Riesgos o notas

- La persistencia de perfil esta respaldada por Supabase, pero el historial de solicitudes esta respaldado por Prisma.

