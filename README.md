# Nido Media Service

Backend service for uploading, processing and serving images and videos for Nido social rental platform.

This repo includes:
- Fastify API in TypeScript
- Prisma + Postgres schema
- MinIO for local S3-compatible storage
- Redis + BullMQ queue for background processing
- ClamAV for virus scanning
- Worker with FFmpeg + sharp (Dockerized)

Quickstart (local):

1. Copy env file:

   cp .env.example .env

2. Start services:

   docker-compose up --build

3. Install dependencies and run migrations:

   npm install
   npx prisma generate
   npx prisma migrate dev --name init

4. Start server:

   npm run dev

Endpoints (examples):

- POST /api/properties/:propertyId/media/initiate
  Body: { filename, mimeType, size, kind }

  Example:

  curl -X POST http://localhost:4000/api/properties/PROP_ID/media/initiate \
    -H "Content-Type: application/json" \
    -d '{"filename":"photo.jpg","mimeType":"image/jpeg","size":102400,"kind":"image"}'

See more details in the repository.
# Nido - Sistema de Autenticación Completo

Aplicación web completa para alquiler de viviendas con sistema de autenticación JWT y OAuth (Google y Facebook).

## 🚀 Características

- **Autenticación tradicional**: Registro y login con email/contraseña
- **OAuth Social**: Login con Google y Facebook
- **JWT Tokens**: Autenticación stateless con tokens seguros
- **Rutas protegidas**: Middleware para proteger endpoints
- **Frontend moderno**: React con componentes reutilizables
- **Backend robusto**: Node.js/Express con validaciones
- **Base de datos**: MongoDB con Mongoose

## 📋 Requisitos Previos

- Node.js (v16 o superior)
- MongoDB (local o Atlas)
- npm o yarn
- Cuentas de desarrollador en Google y Facebook para OAuth

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd nido-main
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del frontend

```bash
cd ..
npm install
```

### 4. Configurar variables de entorno

#### Backend (.env)
Copia el archivo de ejemplo y configura las variables:

```bash
cp backend/.env.example backend/.env
```

Edita `backend/.env` con tus valores:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/nido

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui

# URLs
FRONTEND_URL=http://localhost:3000

# Google OAuth (obtén de Google Cloud Console)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# Facebook OAuth (obtén de Facebook Developers)
FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret
```

#### Configurar OAuth

**Google OAuth:**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita Google+ API
4. Crea credenciales OAuth 2.0
5. Agrega `http://localhost:5000/api/auth/google/callback` como URI de redirección autorizada

**Facebook OAuth:**
1. Ve a [Facebook Developers](https://developers.facebook.com/)
2. Crea una app
3. Agrega producto "Facebook Login"
4. Configura OAuth redirect URIs: `http://localhost:5000/api/auth/facebook/callback`

### 5. Iniciar MongoDB

Asegúrate de que MongoDB esté ejecutándose localmente o configura la URI de Atlas.

### 6. Ejecutar la aplicación

#### Opción 1: Ejecutar por separado

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
npm start
```

#### Opción 2: Ejecutar simultáneamente

```bash
npm run dev
```

## 🔧 Uso

### Endpoints de API

#### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login tradicional
- `GET /api/auth/google` - Iniciar OAuth Google
- `GET /api/auth/facebook` - Iniciar OAuth Facebook
- `GET /api/auth/profile` - Obtener perfil (requiere token)
- `POST /api/auth/logout` - Logout

#### Rutas protegidas
Todas las rutas bajo `/api/` requieren autenticación JWT en el header:
```
Authorization: Bearer <token>
```

### Frontend

- **Login**: `/login` - Formulario con botones sociales
- **Registro**: `/register` - Registro tradicional
- **Dashboard**: `/dashboard` - Área protegida para usuarios autenticados

## 🧪 Pruebas

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
npm test
```

## 📁 Estructura del Proyecto

```
nido-main/
├── backend/                 # API REST
│   ├── controllers/         # Controladores
│   ├── models/             # Modelos de MongoDB
│   ├── routes/             # Definición de rutas
│   ├── services/           # Servicios de negocio
│   ├── middleware/         # Middlewares personalizados
│   ├── config/             # Configuración
│   └── server.js           # Punto de entrada
├── src/                    # Frontend React
│   ├── components/         # Componentes reutilizables
│   ├── pages/             # Páginas de la aplicación
│   ├── context/           # Context API
│   ├── services/          # Servicios del frontend
│   └── utils/             # Utilidades
├── public/                 # Archivos estáticos
└── package.json           # Dependencias del frontend
```

## 🔒 Seguridad

- **Hashing de contraseñas**: bcryptjs
- **JWT tokens**: Expiración de 24 horas
- **Rate limiting**: Protección contra ataques de fuerza bruta
- **Validación de entrada**: express-validator
- **CORS**: Configurado para orígenes específicos
- **Helmet**: Headers de seguridad HTTP

## 🚀 Despliegue

### Backend
```bash
cd backend
npm run build
npm start
```

### Frontend
```bash
npm run build
# Servir con nginx/apache o servicio de hosting
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o preguntas, por favor abre un issue en el repositorio.

---

¡Gracias por usar Nido! 🏠✨
