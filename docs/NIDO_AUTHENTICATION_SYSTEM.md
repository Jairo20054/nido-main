# Implementacion del sistema de autenticacion de NIDO

## Resumen general

Este documento describe el sistema completo de autenticacion implementado para NIDO, una plataforma de arriendo. El sistema usa Supabase Auth con Row-Level Security (RLS) en PostgreSQL para ofrecer gestion de usuarios segura y escalable.

## Arquitectura

### Componentes principales

1. **Supabase Auth**: maneja registro de usuarios, login, recuperacion de contrasena y sesiones.
2. **Tabla `profiles`**: informacion extendida del usuario enlazada a `auth.users`.
3. **Control de acceso basado en roles**: roles de admin, landlord y tenant con permisos adecuados.
4. **Row-Level Security**: politicas de control de acceso a nivel base de datos.
5. **Creacion automatica de perfiles**: triggers que crean perfiles y tablas especificas por rol al registrarse.

### Esquema de base de datos

#### Tabla `profiles`

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  role user_role_enum NOT NULL DEFAULT 'tenant',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  address TEXT,
  city TEXT,
  country TEXT,
  postal_code TEXT,
  id_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tablas especificas por rol

- **`landlords`**: datos adicionales para propietarios.
- **`tenants`**: datos adicionales para arrendatarios.

#### Enums

- `user_role_enum`: `'admin'`, `'landlord'`, `'tenant'`

## Flujos de autenticacion

### 1. Registro de usuario

**Solicitud desde frontend:**

```javascript
POST /auth/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+1234567890",
  "role": "tenant"
}
```

**Proceso en backend:**

1. Validar los datos de entrada.
2. Crear el usuario en Supabase Auth con metadata.
3. El trigger `handle_new_user()` crea el perfil automaticamente.
4. El trigger crea el registro especifico por rol (`tenant` o `landlord`).
5. Se inicia sesion automaticamente y se retorna el token de sesion.

**Respuesta:**

```javascript
{
  "success": true,
  "message": "Cuenta creada correctamente.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "tenant"
    }
  }
}
```

### 2. Login de usuario

**Solicitud desde frontend:**

```javascript
POST /auth/login
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Proceso en backend:**

1. Validar credenciales con Supabase Auth.
2. Recuperar datos extendidos del perfil.
3. Devolver token de sesion e informacion del usuario.

### 3. Recuperacion de contrasena

**Solicitud desde frontend:**

```javascript
POST /auth/forgot-password
{
  "email": "john@example.com"
}
```

**Proceso en backend:**

1. Enviar el correo de reseteo mediante Supabase Auth.
2. El usuario hace clic en el enlace y cambia su contrasena.
3. El frontend maneja la actualizacion de la nueva contrasena.

### 4. Gestion de sesion

**Solicitud desde frontend:**

```javascript
GET /auth/me
Authorization: Bearer <token>
```

**Proceso en backend:**

1. Validar el token JWT.
2. Devolver los datos actuales del perfil del usuario.

## Implementacion de seguridad

### Politicas Row-Level Security

#### Politicas de `profiles`

```sql
-- Los usuarios pueden ver su propio perfil
CREATE POLICY profiles_view_own ON profiles
  FOR SELECT USING (auth_id = auth.uid());

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Los admins pueden ver todos los perfiles
CREATE POLICY admin_profiles_all ON profiles
  USING (get_user_role(auth.uid()) = 'admin');
```

#### Acceso basado en roles

- **Admins**: acceso completo a todos los datos.
- **Landlords**: acceso a sus propiedades, arrendatarios y contratos.
- **Tenants**: acceso a sus postulaciones, contratos y pagos.

### Triggers y funciones

#### Trigger de creacion de perfil

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    auth_id, email, first_name, last_name, role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role_enum, 'tenant'::user_role_enum)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

#### Creacion de registros por rol

Se crean automaticamente registros de `landlord` o `tenant` segun el rol asignado.

## Integracion con frontend

### Configuracion de `AuthProvider`

```javascript
// AuthProvider.jsx
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials, { auth: false });
    setStoredToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload, { auth: false });
    setStoredToken(response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  // ... otros metodos
};
```

### Configuracion del cliente API

```javascript
// apiClient.js
const apiRequest = async (path, options = {}) => {
  const { method = 'GET', body, query, auth = true } = options;
  const token = auth ? getStoredToken() : null;

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Manejo de respuesta...
};
```

## Tipos TypeScript

Los tipos autogenerados desde el esquema de Supabase aportan seguridad de tipos:

```typescript
import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = Database['public']['Enums']['user_role_enum'];
```

## Consideraciones de seguridad

### Requisitos de contrasena

- minimo 8 caracteres
- validados por el backend

### Seguridad de sesion

- tokens JWT con expiracion
- refresco automatico del token
- almacenamiento seguro del token en localStorage

### Proteccion de datos

- RLS evita accesos no autorizados
- datos sensibles cifrados en reposo
- auditoria de eventos de seguridad

### Seguridad API

- CORS configurado para el dominio del frontend
- validacion de entrada en todos los endpoints
- rate limiting recomendado para produccion

## Despliegue a produccion

### Variables de entorno

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
CLIENT_URL=https://your-frontend-domain.com
JWT_SECRET=your-secure-jwt-secret
```

### Configuracion de Supabase

1. Habilitar confirmacion por correo en Auth settings.
2. Configurar SMTP para entrega de emails.
3. Configurar dominios personalizados si aplica.
4. Configurar URLs de redireccion para reseteo de contrasena.

### Monitoreo

- monitorear intentos fallidos de login
- seguir metricas de registro de usuarios
- auditar eventos de seguridad via tabla `audit_logs`

## Resolucion de problemas

### Problemas comunes

1. **El perfil no se crea al registrarse**
   - verificar que el trigger `handle_new_user` este activo
   - revisar que `user_metadata` tenga los campos requeridos

2. **RLS bloquea consultas**
   - confirmar que el usuario este autenticado
   - revisar las politicas basadas en roles
   - verificar que `auth.uid()` devuelva el ID correcto

3. **Expiracion del token**
   - implementar refresco automatico
   - manejar respuestas `401` redirigiendo a login

### Comandos de depuracion

```sql
-- Revisar perfiles de usuario
SELECT * FROM profiles WHERE email = 'user@example.com';

-- Revisar politicas RLS
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Probar funciones de autenticacion
SELECT get_current_user_profile();
```

## Mejoras futuras

- integracion OAuth (Google, Facebook)
- autenticacion multifactor
- verificacion de cuenta mediante documentos
- dashboard de sesiones
- auditoria avanzada

## Conclusion

El sistema de autenticacion entrega una base solida para NIDO con:

- registro y login seguros
- control de acceso por roles
- gestion automatica de perfiles
- medidas de seguridad listas para produccion
- integracion type-safe con frontend

El sistema es escalable, mantenible y sigue buenas practicas de seguridad.
