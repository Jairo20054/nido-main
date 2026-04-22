# 📚 GUÍA COMPLETA: SUPABASE EN NIDO

## 📋 Tabla de Contenidos
1. [Instalación y Configuración](#instalación-y-configuración)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Autenticación](#autenticación)
4. [Base de Datos](#base-de-datos)
5. [Middleware](#middleware)
6. [Ejemplos de Uso](#ejemplos-de-uso)
7. [Seguridad](#seguridad)

---

## 🚀 Instalación y Configuración

### Paso 1: Instalar Dependencias

```bash
npm install @supabase/supabase-js
```

### Paso 2: Obtener Credenciales de Supabase

1. Ir a [https://app.supabase.com](https://app.supabase.com)
2. Crear un nuevo proyecto
3. Ir a **Project Settings** → **API**
4. Copiar:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_KEY`

### Paso 3: Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# Otros
DATABASE_URL=postgresql://...
JWT_SECRET=nido-local-secret
JWT_EXPIRES_IN=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 📁 Estructura del Proyecto

```
backend/src/
├── shared/
│   ├── supabase.js                 # Cliente de Supabase
│   ├── supabase-auth.js            # Servicios de autenticación
│   ├── supabase-auth-middleware.js # Middleware de autenticación
│   ├── env.js                      # Configuración de entorno
│   └── ...
├── modules/
│   ├── auth/
│   │   ├── auth.controller.js      # Controladores de auth (actualizado)
│   │   ├── auth.routes.js          # Rutas de auth (actualizado)
│   │   └── auth.schemas.js         # Validación de esquemas
│   ├── properties/                 # Propiedades (usar Supabase)
│   ├── users/                      # Usuarios (usar Supabase)
│   └── ...
└── app.js                          # Configuración de Express
```

---

## 🔐 Autenticación

### Flujo de Autenticación

```
Cliente                    Backend                  Supabase
   │                          │                          │
   ├──── POST /auth/login ────>│                          │
   │                          ├─── signIn() ────────────>│
   │                          │<─── { session, user } ───┤
   │<─── { accessToken } ─────┤                          │
   │                          │                          │
   ├─ Guardar token en localStorage                      │
   │                          │                          │
   ├── GET /api/properties (+ token) ──>│               │
   │                          ├─── validateToken() ─────>│
   │                          │<─── { user_id } ─────────┤
   │                          │                          │
   │<─── { properties } ──────┤                          │
```

### Registro

```javascript
// Frontend
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    password: 'SecurePassword123',
    phone: '+34612345678',
    role: 'TENANT' // o 'LANDLORD'
  })
});

const data = await response.json();
console.log(data);
// {
//   success: true,
//   message: 'Cuenta creada correctamente...',
//   data: {
//     user: { id, email, firstName, lastName }
//   }
// }
```

### Login

```javascript
// Frontend
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'juan@example.com',
    password: 'SecurePassword123'
  })
});

const data = await response.json();
console.log(data);
// {
//   success: true,
//   message: 'Sesión iniciada correctamente',
//   data: {
//     session: {
//       accessToken: 'eyJhbGc...',
//       refreshToken: 'eyJhbGc...',
//       expiresIn: 3600,
//       expiresAt: 1234567890
//     },
//     user: { id, email, firstName, lastName, role, ... }
//   }
// }

// Guardar token
localStorage.setItem('accessToken', data.data.session.accessToken);
localStorage.setItem('refreshToken', data.data.session.refreshToken);
```

### Usar Token en Peticiones

```javascript
// Frontend - Todas las peticiones autenticadas necesitan el token
const token = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:5000/api/properties', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`  // ← IMPORTANTE
  }
});
```

### Cambiar Contraseña

```javascript
// Frontend
const response = await fetch('http://localhost:5000/api/auth/change-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    newPassword: 'NewSecurePassword123'
  })
});

const data = await response.json();
// { success: true, message: 'Contraseña actualizada correctamente' }
```

### Recuperación de Contraseña

```javascript
// Paso 1: Frontend - Solicitar enlace de recuperación
const response1 = await fetch('http://localhost:5000/api/auth/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'juan@example.com'
  })
});

// El usuario recibe un email con un enlace como:
// https://app-domain.com/reset-password?token=eyJhbGc...

// Paso 2: Frontend - Confirmar nueva contraseña
const response2 = await fetch('http://localhost:5000/api/auth/reset-password-confirm', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token_from_email_link}`
  },
  body: JSON.stringify({
    newPassword: 'NewSecurePassword123'
  })
});
```

---

## 🗄️ Base de Datos

### Crear Tabla de Usuarios

En Supabase SQL Editor:

```sql
-- Crear tabla users
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  firstName TEXT,
  lastName TEXT,
  avatarUrl TEXT,
  bio TEXT,
  phone TEXT,
  role TEXT DEFAULT 'TENANT' CHECK (role IN ('TENANT', 'LANDLORD', 'ADMIN')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_role_idx ON users(role);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);
```

### Crear Tabla de Propiedades

```sql
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ownerId UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
  propertyType TEXT NOT NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'RENTED', 'ARCHIVED')),
  city TEXT NOT NULL,
  neighborhood TEXT,
  addressLine TEXT NOT NULL,
  monthlyRent DECIMAL(10, 2),
  maintenanceFee DECIMAL(10, 2),
  securityDeposit DECIMAL(10, 2),
  bedrooms INTEGER,
  bathrooms INTEGER,
  areaM2 DECIMAL(10, 2),
  parkingSpots INTEGER,
  maxOccupants INTEGER,
  furnished BOOLEAN DEFAULT FALSE,
  petsAllowed BOOLEAN DEFAULT FALSE,
  availableFrom DATE,
  minLeaseMonths INTEGER,
  amenities JSONB,
  coverImage TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Crear índices
CREATE INDEX properties_ownerId_idx ON properties(ownerId);
CREATE INDEX properties_status_idx ON properties(status);
CREATE INDEX properties_city_idx ON properties(city);

-- Habilitar RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Política: Ver propiedades publicadas o propias
CREATE POLICY "View published or own properties" ON public.properties
  FOR SELECT
  USING (status = 'PUBLISHED' OR ownerId = auth.uid());

-- Política: Solo el propietario puede actualizar
CREATE POLICY "Owner can update property" ON public.properties
  FOR UPDATE
  USING (ownerId = auth.uid());

-- Política: Solo el propietario puede eliminar
CREATE POLICY "Owner can delete property" ON public.properties
  FOR DELETE
  USING (ownerId = auth.uid());
```

---

## 🔒 Middleware

### Middleware Básicos

#### `requireAuth` - Requiere Autenticación

```javascript
// backend/src/modules/properties/property.routes.js
const { requireAuth } = require('../../shared/supabase-auth-middleware');

router.post('/properties', requireAuth, controller.createProperty);
// Ahora req.user contiene los datos del usuario autenticado
```

#### `requireAuthOptional` - Autenticación Opcional

```javascript
// Para rutas que pueden accederse con o sin autenticación
router.get('/properties', requireAuthOptional, controller.listProperties);
// req.user será null si no está autenticado, o los datos si sí
```

#### `requireRole` - Validar Rol

```javascript
router.delete(
  '/admin/users/:id',
  requireAuth,
  requireRole('ADMIN'),
  controller.deleteUser
);

// Múltiples roles
router.post(
  '/properties',
  requireAuth,
  requireRole(['LANDLORD', 'ADMIN']),
  controller.createProperty
);
```

#### `requireOwnership` - Validar Propiedad del Recurso

```javascript
router.put(
  '/properties/:id',
  requireAuth,
  requireOwnership('properties', 'ownerId', 'id'),
  controller.updateProperty
);

// El middleware verifica que:
// 1. El usuario está autenticado
// 2. La propiedad existe
// 3. El usuario es el propietario (req.resource estará disponible)
```

### Crear Middleware Personalizado

```javascript
// backend/src/shared/supabase-auth-middleware.js (ya existe)

// Ejemplo: Crear middleware para validar estado de pago
const requirePaidUser = async (req, res, next) => {
  try {
    await attachUser(req, true);
    
    const { data: payment } = await supabaseAdmin
      .from('payments')
      .select('status')
      .eq('userId', req.user.id)
      .eq('status', 'completed')
      .single();
    
    if (!payment) {
      throw unauthorized('Debes completar el pago para acceder');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requirePaidUser };
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Crear una Propiedad (Protegida)

```javascript
// backend/src/modules/properties/property.controller.js
const { supabaseAdmin } = require('../../shared/supabase');

const createProperty = async (req, res) => {
  const { title, city, monthlyRent, ... } = req.body;
  const userId = req.user.id; // Del middleware requireAuth

  const { data, error } = await supabaseAdmin
    .from('properties')
    .insert([{
      ownerId: userId,
      title,
      city,
      monthlyRent,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...
    }])
    .select()
    .single();

  if (error) {
    throw badRequest(error.message);
  }

  res.status(201).json({
    success: true,
    data
  });
};
```

### Ejemplo 2: Listar Propiedades (Pública con Filtros)

```javascript
const listProperties = async (req, res) => {
  const { city, minRent, maxRent, bedrooms } = req.query;
  const userId = req.user?.id || null;

  let query = supabaseAdmin
    .from('properties')
    .select('*')
    .eq('status', 'PUBLISHED');

  if (city) {
    query = query.ilike('city', `%${city}%`);
  }

  if (minRent) {
    query = query.gte('monthlyRent', minRent);
  }

  if (maxRent) {
    query = query.lte('monthlyRent', maxRent);
  }

  if (bedrooms) {
    query = query.gte('bedrooms', bedrooms);
  }

  const { data, error, count } = await query;

  if (error) {
    throw badRequest(error.message);
  }

  res.json({
    success: true,
    data,
    meta: { count }
  });
};
```

### Ejemplo 3: Actualizar Perfil de Usuario

```javascript
const updateProfile = async (req, res) => {
  const { firstName, lastName, bio, phone } = req.body;
  const userId = req.user.id;

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({
      firstName,
      lastName,
      bio,
      phone,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw badRequest(error.message);
  }

  res.json({
    success: true,
    data
  });
};
```

---

## 🛡️ Seguridad

### 1. Nunca Expongas el Service Key

```javascript
// ❌ MALO
const supabasePublic = createClient(URL, SERVICE_KEY);
app.get('/unsafe', (req, res) => {
  // El cliente podría interceptar esto
  res.json({ key: SERVICE_KEY });
});

// ✅ BIEN
const supabaseAdmin = createClient(URL, SERVICE_KEY);
// Solo usar en el servidor, nunca enviar al cliente
```

### 2. Usa RLS (Row Level Security)

```sql
-- Las políticas RLS aseguran que los usuarios solo vean sus datos
CREATE POLICY "Users can view own properties" ON public.properties
  FOR SELECT
  USING (ownerId = auth.uid());
```

### 3. Valida Datos de Entrada

```javascript
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  // ...
});

const { value, error } = schema.validate(req.body);
if (error) {
  throw badRequest(error.details[0].message);
}
```

### 4. No Confíes en el Cliente

```javascript
// ❌ MALO
const userId = req.body.userId; // El cliente podría cambiar esto

// ✅ BIEN
const userId = req.user.id; // Del token JWT validado
```

### 5. Usa HTTPS en Producción

```
SUPABASE_URL=https://your-project.supabase.co (✅ HTTPS)
No: http://your-project.supabase.co (❌ HTTP)
```

---

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Última actualización**: 22 de Abril de 2026
