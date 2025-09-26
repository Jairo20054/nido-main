# TODO: Solucionar Errores en la Aplicación

## Información Recopilada
- Errores de carga de imágenes (ERR_CERT_AUTHORITY_INVALID) para URLs de Unsplash en socialMocks.js debido a problemas de certificado en Codespaces.
- Error de CORS en manifest.json por redirecciones de túnel en Codespaces.
- Error de renderizado en GoogleLoginButton por llamada fallida a API hardcoded.
- Fallos de WebSocket a ws://localhost:5000/ws desde webpack-dev-server (HMR mal configurado para puerto 5000).
- Archivos clave: GoogleLoginButton.jsx, socialMocks.js, public/index.html, api.js.
- Proyecto: React CRA frontend, backend Node en puerto 5000.

## Plan de Cambios
- [x] 1. Actualizar GoogleLoginButton.jsx: Usar API configurable en lugar de hardcoded.
- [x] 2. Reemplazar imágenes en socialMocks.js: Usar URLs directas o placeholders locales.
2. Crear src/setupProxy.js: Proxy para /api y /ws a localhost:5000.
3. Configurar .env: REACT_APP_API_URL y PUBLIC_URL.
4. Actualizar package.json: Script start con --host 0.0.0.0.
5. Verificar manifest.json: start_url y scope correctos.

## Archivos Dependientes
- src/components/user/Auth/GoogleLoginButton.jsx
- src/utils/socialMocks.js
- src/setupProxy.js (nuevo)
- .env (nuevo o editar)
- package.json
- public/manifest.json

## Pasos de Seguimiento
- Reiniciar frontend y backend.
- Probar carga de app, login Google, páginas sociales.
- Verificar consola sin errores.
