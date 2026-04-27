# Referencia API de NIDO

Ultima actualizacion: 2026-04-27

URL base en desarrollo local:

- `http://localhost:5000/api`

Endpoint de salud:

- `http://localhost:5000/health`

## Convenciones

### Auth

Los endpoints autenticados esperan:

```http
Authorization: Bearer <supabase_access_token>
```

### Envoltorio de exito

Formato tipico:

```json
{
  "success": true,
  "message": "mensaje opcional",
  "data": {}
}
```

### Envoltorio de error

Los errores controlados usan:

```json
{
  "success": false,
  "message": "Mensaje legible para humanos",
  "details": null
}
```

Los errores no controlados del servidor usan:

```json
{
  "success": false,
  "message": "Ocurrio un error inesperado en el servidor"
}
```

## `GET /health`

Proposito:

- verificacion basica de disponibilidad de la API

Auth:

- no

Respuesta:

```json
{
  "success": true,
  "status": "ok",
  "timestamp": "2026-04-27T15:00:00.000Z"
}
```

## Endpoints de autenticacion

## `POST /auth/register`

Proposito:

- crear un usuario en Supabase Auth y una fila `profiles` en Supabase

Auth:

- no

Cuerpo de la solicitud:

```json
{
  "firstName": "Ana",
  "lastName": "Lopez",
  "email": "ana@example.com",
  "password": "Secret123!",
  "phone": "+57 3000000000",
  "role": "tenant"
}
```

Notas:

- `role` se valida en minusculas en el backend.
- El frontend hoy envia valores en mayusculas, pero Joi los normaliza a minusculas antes de validar.

Respuesta:

```json
{
  "success": true,
  "message": "Cuenta creada correctamente.",
  "data": {
    "token": "supabase-access-token-or-null",
    "user": {
      "id": "uuid",
      "email": "ana@example.com",
      "firstName": "Ana",
      "lastName": "Lopez",
      "role": "tenant"
    }
  }
}
```

## `POST /auth/login`

Proposito:

- autenticar mediante Supabase Auth

Auth:

- no

Cuerpo de la solicitud:

```json
{
  "email": "ana@example.com",
  "password": "Secret123!"
}
```

Respuesta:

```json
{
  "success": true,
  "message": "Sesion iniciada correctamente",
  "data": {
    "token": "supabase-access-token",
    "user": {
      "id": "uuid",
      "firstName": "Ana",
      "lastName": "Lopez",
      "fullName": "Ana Lopez",
      "email": "ana@example.com",
      "phone": "+57 3000000000",
      "role": "tenant"
    }
  }
}
```

Errores:

- `401` credenciales invalidas

## `GET /auth/me`

Proposito:

- devolver el usuario autenticado que ya adjunto el middleware

Auth:

- si

## `POST /auth/logout`

Proposito:

- confirmar el cierre de sesion

Auth:

- si

Notas:

- Esto no revoca el token del lado servidor.

## `POST /auth/change-password`

Proposito:

- cambiar la contrasena del usuario actual mediante las APIs administrativas de Supabase

Auth:

- si

Cuerpo de la solicitud:

```json
{
  "newPassword": "NewSecret123!"
}
```

## `POST /auth/forgot-password`

Proposito:

- enviar el correo de recuperacion mediante Supabase

Auth:

- no

Cuerpo de la solicitud:

```json
{
  "email": "ana@example.com"
}
```

## `POST /auth/reset-password-confirm`

Proposito:

- definir una nueva contrasena usando el bearer token del flujo de recuperacion

Auth:

- requiere bearer token en el header

Cuerpo de la solicitud:

```json
{
  "newPassword": "NewSecret123!"
}
```

## Endpoints de propiedades

## `GET /properties`

Proposito:

- buscar propiedades publicadas

Auth:

- opcional

Query params:

- `q`
- `city`
- `propertyType`
- `minRent`
- `maxRent`
- `bedrooms`
- `bathrooms`
- `furnished`
- `petsAllowed`
- `minLeaseMonths`
- `availableFrom`
- `sort`: `recommended | latest | rent-asc | rent-desc`
- `page`
- `limit`

Forma de la respuesta:

```json
{
  "success": true,
  "data": [
    {
      "id": "property-id",
      "slug": "apartment-bogota-abc123",
      "title": "Apartamento",
      "summary": "Resumen",
      "description": "Descripcion",
      "propertyType": "APARTMENT",
      "status": "PUBLISHED",
      "city": "Bogota",
      "monthlyRent": 3200000,
      "maintenanceFee": 250000,
      "securityDeposit": 3200000,
      "bedrooms": 2,
      "bathrooms": 2,
      "areaM2": 75,
      "maxOccupants": 3,
      "furnished": false,
      "petsAllowed": true,
      "availableFrom": "2026-05-01T00:00:00.000Z",
      "amenities": [],
      "coverImage": "https://...",
      "images": [],
      "owner": {
        "id": "owner-id",
        "firstName": "Camila",
        "lastName": "Rojas",
        "fullName": "Camila Rojas"
      },
      "isFavorite": false,
      "requestCount": 0
    }
  ],
  "meta": {
    "page": 1,
    "limit": 9,
    "total": 42,
    "pages": 5
  }
}
```

## `GET /properties/featured`

Proposito:

- devolver las cuatro propiedades publicadas mas recientes

Auth:

- opcional

## `GET /properties/mine`

Proposito:

- devolver todas las propiedades del usuario autenticado

Auth:

- si

## `GET /properties/:id`

Proposito:

- devolver el detalle completo de una propiedad

Auth:

- opcional

Notas:

- las propiedades no publicadas solo pueden ser vistas por su propietario

## `POST /properties`

Proposito:

- crear una propiedad con URLs de imagenes

Auth:

- si

Cuerpo de la solicitud:

```json
{
  "title": "Apartamento luminoso en Chapinero",
  "summary": "Resumen de 20+ caracteres",
  "description": "Descripcion de 80+ caracteres",
  "propertyType": "APARTMENT",
  "status": "PUBLISHED",
  "city": "Bogota",
  "neighborhood": "Chapinero",
  "addressLine": "Calle 10 # 10-10",
  "monthlyRent": 3500000,
  "maintenanceFee": 300000,
  "securityDeposit": 3500000,
  "bedrooms": 2,
  "bathrooms": 2,
  "areaM2": 72,
  "parkingSpots": 1,
  "maxOccupants": 3,
  "furnished": false,
  "petsAllowed": true,
  "availableFrom": "2026-05-01",
  "minLeaseMonths": 12,
  "amenities": ["Balcon", "Porteria 24/7"],
  "images": ["https://example.com/1.jpg"]
}
```

Notas:

- `images` es obligatorio y debe contener al menos una URL.

## `PATCH /properties/:id`

Proposito:

- actualizar una propiedad propia

Auth:

- si

Notas:

- el reemplazo de imagenes es total si se envia `images`

## `DELETE /properties/:id`

Proposito:

- eliminar una propiedad propia

Auth:

- si

Notas:

- la eliminacion se bloquea si la propiedad tiene solicitudes activas `PENDING` o `APPROVED`

## Endpoint de postulaciones

## `POST /applications/prequalify`

Proposito:

- calcular la precalificacion y construir un checklist documental

Auth:

- opcional

Cuerpo de la solicitud:

```json
{
  "propertyId": "property-uuid",
  "occupationType": "EMPLOYEE",
  "monthlyIncome": 6500000,
  "occupants": 2,
  "hasBackup": true,
  "backupOption": "CO_SIGNER"
}
```

Respuesta:

```json
{
  "success": true,
  "data": {
    "applicationId": "uuid-or-null",
    "property": {},
    "prequalification": {
      "result": "eligible_with_backup",
      "riskBand": "medium",
      "score": 74,
      "ratio": 2.8,
      "requiresBackup": true,
      "reasons": [],
      "recommendations": []
    },
    "transparency": {
      "city": "Bogota",
      "canonAmount": 3200000,
      "maintenanceFeeAmount": 300000,
      "depositAmount": 3200000,
      "monthlyTotal": 3500000,
      "maxOccupants": 3,
      "availableFrom": "2026-05-01",
      "minLeaseMonths": 12,
      "freeToApply": true
    },
    "documentChecklist": [
      {
        "id": "identity-front-back-1",
        "key": "identity-front-back",
        "label": "Documento de identidad",
        "formats": ["JPG", "PNG", "PDF"],
        "status": "pending"
      }
    ]
  }
}
```

Notas:

- Si quien hace la solicitud esta autenticado, el backend tambien inserta una fila borrador en Supabase `applications`.
- El frontend todavia no continua el flujo usando ese `applicationId`.

## Endpoints del perfil de usuario

## `GET /users/me`

Proposito:

- devolver los datos del perfil autenticado

Auth:

- si

## `PATCH /users/me`

Proposito:

- actualizar la fila `profiles` del usuario autenticado en Supabase

Auth:

- si

Cuerpo de la solicitud:

```json
{
  "firstName": "Ana",
  "lastName": "Lopez",
  "phone": "+57 3000000000",
  "bio": "Perfil corto",
  "avatarUrl": "https://example.com/avatar.jpg",
  "role": "tenant"
}
```

## `DELETE /users/me`

Proposito:

- eliminar la cuenta autenticada

Auth:

- si

Cuerpo de la solicitud:

```json
{
  "password": "Secret123!"
}
```

## Endpoints de favoritos

## `GET /favorites`

Proposito:

- listar las propiedades guardadas del usuario actual

Auth:

- si

## `POST /favorites/:propertyId`

Proposito:

- guardar una propiedad

Auth:

- si

## `DELETE /favorites/:propertyId`

Proposito:

- quitar una propiedad guardada

Auth:

- si

## Endpoints de solicitudes de arriendo

Estas rutas ya estan montadas en `/api/requests`.

## `GET /requests/mine`

Proposito:

- listar las solicitudes propias del arrendatario actual

Auth:

- si

## `GET /requests/received`

Proposito:

- listar las solicitudes de propiedades del arrendador actual

Auth:

- si

## `GET /requests/:id`

Proposito:

- devolver una solicitud si el usuario actual es el arrendatario o el arrendador vinculado

Auth:

- si

## `POST /requests`

Proposito:

- crear una solicitud formal de arriendo

Auth:

- si

Cuerpo de la solicitud:

```json
{
  "propertyId": "property-id",
  "desiredMoveIn": "2026-05-15",
  "leaseMonths": 12,
  "occupants": 2,
  "monthlyIncome": 7800000,
  "hasPets": false,
  "phone": "+57 3000000000",
  "message": "Mensaje de al menos 20 caracteres"
}
```

Reglas aplicadas por el controlador:

- la propiedad debe existir
- la propiedad debe estar en `PUBLISHED`
- el propietario no puede solicitar su propia propiedad
- el mismo arrendatario no puede tener otra solicitud activa `PENDING` o `APPROVED` para esa propiedad

## `PATCH /requests/:id`

Proposito:

- editar una solicitud pendiente

Auth:

- si

Reglas:

- solo el arrendatario puede editar
- solo se pueden editar solicitudes `PENDING`

## `PATCH /requests/:id/status`

Proposito:

- el arrendador aprueba o rechaza una solicitud

Auth:

- si

Cuerpo de la solicitud:

```json
{
  "status": "APPROVED"
}
```

Valores permitidos:

- `APPROVED`
- `REJECTED`

## `DELETE /requests/:id`

Proposito:

- el arrendatario elimina una solicitud

Auth:

- si

Reglas:

- solo el arrendatario puede eliminar
- las solicitudes aprobadas no pueden eliminarse

## Superficies API faltantes o aun no implementadas

- No existe un endpoint backend que persista los archivos documentales seleccionados en el flujo de postulacion.
- No existe un endpoint backend que recargue el estado completo de la postulacion guiada mediante `applicationId`.
- No hay modulos HTTP de contratos, firmas, pagos, entrega o notificaciones montados en la app Express, aunque el blueprint SQL de Supabase si define esos dominios.
