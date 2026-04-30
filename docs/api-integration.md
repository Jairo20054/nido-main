**API Integration (Frontend)**

Resumen
- Cliente HTTP: `frontend/src/lib/apiClient.js`.
- Base URL: `import.meta.env.VITE_API_BASE_URL || '/api'`.
- Autenticación: token Bearer tomado desde `localStorage` con clave `nido_access_token`.

Endpoints detectados (consumidos por el frontend)
- `POST /auth/login` — login. Respuesta esperada: `{ token, user }`.
- `POST /auth/register` — registro. Respuesta: `{ token, user }`.
- `GET /auth/me` — información del usuario autenticado.
- `GET /properties` — listado (soporta query params: city, propertyType, minRent, maxRent, bedrooms, bathrooms, furnished, petsAllowed, sort).
- `GET /properties/:id` — detalle de propiedad.
- `POST /favorites/:propertyId` — marca favorito.
- `DELETE /favorites/:propertyId` — quita favorito.
- `GET /favorites` — lista de favoritos del usuario.
- `GET /properties/mine` — propiedades del propietario (dashboard).
- `POST /properties` — crear propiedad (dashboard).
- `PATCH /properties/:id` — actualizar propiedad (dashboard).
- `DELETE /properties/:id` — eliminar propiedad (dashboard).
- `GET /requests/received` — solicitudes recibidas (dashboard).
- `PATCH /requests/:id/status` — actualizar estado de solicitud.
- `POST /applications/prequalify` — precalificación (usado sin auth en el código: `{ auth: false }`). Payload: `{ propertyId, occupationType, monthlyIncome, occupants, hasBackup, backupOption }`.
- `POST /requests` — enviar solicitud (payload: propertyId, desiredMoveIn, leaseMonths, occupants, monthlyIncome, hasPets, phone, message).

Errores y manejo
- `apiClient` parsea JSON y lanza `ApiError(message, status, details)` si `response.ok` es falso.
- Los componentes muestran mensajes usando `InlineMessage` o `setError` a partir de `requestError.message`.

Seguridad y tokens
- Token guardado en `localStorage`. No hay refresh token ni renovación automática en `apiClient.js`.
- Riesgo: token en `localStorage` es vulnerable a XSS; evaluar `httpOnly` cookies si el backend lo permite.

Pendientes / Supuestos
- Formato exacto de respuestas (campos adicionales en `response.data`) — marcado como "Pendiente de validación".
- Confirmar si `/applications/prequalify` debe requerir auth o no.
