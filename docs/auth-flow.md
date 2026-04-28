**Autenticación (frontend)**

Cómo funciona actualmente
- `AuthProvider` centraliza sesión y exposición de `useAuth()`.
- Login: `AuthProvider.login(credentials)` → `api.post('/auth/login', credentials, { auth: false })` → almacena `token` en `localStorage` y setea `user` con `response.data.user`.
- Register: igual que login pero vía `/auth/register`.
- Inicio: si existe `nido_access_token` en `localStorage`, `AuthProvider` llama `/auth/me` para reconstruir `user`.
- Logout: borra token (`clearStoredToken`) y `user` se pone `null`.

Guards y rutas privadas
- `ProtectedRoute` muestra `LoadingState` hasta que `AuthProvider.loading` sea false.
- Si no autenticado, redirige a `/login` y pasa `state.from` con la ruta original.

Roles y permisos
- `AuthProvider` expone `isLandlord: user?.role === 'LANDLORD' || user?.role === 'ADMIN'`.
- Uso: el dashboard y endpoints de gestión dependen de `isLandlord` en la UI (validación solo en frontend; backend debe forzar permisos).

Limitaciones observadas
- No se detecta flujo de refresh de token en `apiClient`.
- No hay expiración-observable en cliente salvo que `/auth/me` falle.

Recomendaciones
- Documentar en backend contrato de tokens (si existe refresh token).
- Considerar almacenamiento más seguro (cookies httpOnly) o mitigaciones XSS.

Pendientes
- Validar con equipo backend si hay refresh tokens y cuál es la política de expiración.
