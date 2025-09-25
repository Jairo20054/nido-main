# TODO: Implementación Sistema de Autenticación Completo

## Backend (Node.js/Express - Puerto 5000)

### 1. Actualizar Modelo de Usuario
- [x] Cambiar firstName/lastName por name único
- [x] Agregar googleId y facebookId opcionales
- [x] Mantener createdAt
- [x] Comentarios en español

### 2. Instalar Dependencias Faltantes
- [x] passport, passport-google-oauth20, passport-facebook
- [x] Verificar dependencias existentes: express, mongoose, bcryptjs, jsonwebtoken, cors, helmet

### 3. Crear Servicio de Autenticación (AuthService)
- [x] Generar JWT válido por 24 horas
- [x] Verificar y refrescar tokens
- [x] Comentarios en español

### 4. Actualizar Controlador de Autenticación
- [x] POST /api/auth/register: Validar email único, hashear contraseña, guardar usuario, retornar JWT
- [x] POST /api/auth/login: Validar credenciales, generar JWT
- [x] GET /api/auth/profile: Ruta protegida para perfil
- [x] Manejo de errores en español

### 5. Configurar Passport para OAuth
- [x] Estrategia Google OAuth2
- [x] Estrategia Facebook OAuth2
- [x] Callbacks para crear/encontrar usuario y generar JWT

### 6. Actualizar Rutas de Autenticación
- [x] GET /api/auth/google: Iniciar con Google
- [x] GET /api/auth/google/callback: Callback Google
- [x] GET /api/auth/facebook: Iniciar con Facebook
- [x] GET /api/auth/facebook/callback: Callback Facebook
- [x] Middleware para verificar JWT en rutas protegidas

### 7. Configurar Variables de Entorno
- [x] .env.example con JWT_SECRET, MONGO_URI, GOOGLE_CLIENT_ID, etc.
- [x] Validar variables requeridas

## Frontend (React - Puerto 3000)

### 8. Instalar Dependencias Faltantes
- [x] axios para peticiones HTTP
- [x] @react-oauth/google para Google Login
- [x] react-facebook-login para Facebook Login

### 9. Actualizar Contexto de Autenticación
- [x] Integrar login social
- [x] Almacenar token en localStorage
- [x] Manejo de estado global con Context API

### 10. Actualizar Formulario de Login
- [x] Agregar botones para Google y Facebook
- [x] Mantener validación básica
- [x] Mensajes en español

### 11. Crear Componentes de Login Social
- [x] GoogleLoginButton: Popup/auth con @react-oauth/google
- [x] FacebookLoginButton: Auth con react-facebook-login
- [x] Enviar tokens a backend

### 12. Crear Componente Ruta Protegida
- [x] ProtectedRoute: Verificar token, redirigir si inválido
- [x] Usar en rutas que requieren autenticación

### 13. Crear Dashboard
- [x] Ruta protegida que muestra perfil
- [x] Fetch /api/profile con token en headers

### 14. Actualizar Formulario de Registro
- [x] Campo único name
- [x] Validación básica
- [x] Mensajes en español

### 15. Configurar Proxy
- [x] package.json proxy a http://localhost:5000

## General

### 16. Pruebas de Funcionalidad
- [ ] Registro nuevo usuario
- [ ] Login tradicional
- [ ] Login Google (nuevo/existente)
- [ ] Login Facebook (nuevo/existente)
- [ ] Acceso a rutas protegidas
- [ ] Logout

### 17. Instrucciones de Setup
- [x] Archivo README con setup en español
- [x] Comandos para instalar dependencias
- [x] Configurar variables de entorno
- [x] Ejecutar backend y frontend
