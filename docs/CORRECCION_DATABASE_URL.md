# INFORME DE CORRECCIÓN DE ERROR: DATABASE_URL

## 🔴 PROBLEMA ORIGINAL

```
PrismaClientInitializationError: 
Invalid `prisma.property.findMany()` invocation in
C:\Users\jviafara\Music\NIDO\nido-main\backend\src\modules\properties\property.controller.js:144:39

error: Environment variable not found: DATABASE_URL.
  -->  schema.prisma:7
```

---

## 🔍 CAUSA RAÍZ

El error ocurrió porque **Prisma no pudo encontrar la variable de entorno `DATABASE_URL`**.

### Análisis Técnico:

1. **Ubicación del archivo .env**: El archivo `.env` estaba ubicado en `backend/.env`
2. **Cómo carga dotenv**: El módulo `dotenv` en `backend/src/shared/env.js` ejecuta `require('dotenv').config()` **SIN especificar una ruta**, lo que hace que busque el archivo `.env` en el **directorio actual de trabajo (cwd)**
3. **El directorio actual era**: La raíz del proyecto (`c:\Users\jviafara\Music\NIDO\nido-main\`)
4. **Resultado**: El archivo `.env` en `backend/.env` nunca fue encontrado, y la variable `DATABASE_URL` nunca se cargó
5. **Impacto**: Cuando Prisma intentó inicializar, no encontró la URL de conexión y lanzó el error

### Diagrama del Flujo de Ejecución:

```
npm run dev
  ↓
Ejecuta: nodemon backend/src/server.js
  ↓
cwd = c:\Users\jviafara\Music\NIDO\nido-main\ (RAÍZ)
  ↓
Carga: backend/src/server.js
  ↓
Importa: backend/src/app.js
  ↓
Importa: backend/src/shared/env.js
  ↓
require('dotenv').config() — Busca .env en la RAÍZ
  ↓
❌ No encuentra c:\Users\jviafara\Music\NIDO\nido-main\backend\.env
  ↓
DATABASE_URL no se carga
  ↓
Importa: backend/src/shared/prisma.js
  ↓
new PrismaClient() — Necesita DATABASE_URL
  ↓
❌ ERROR: Environment variable not found: DATABASE_URL
```

---

## ✅ SOLUCIÓN APLICADA

Se realizaron **tres cambios complementarios**:

### 1. **Crear archivo `.env` en la raíz del proyecto** ✓

Ubicación: `c:\Users\jviafara\Music\NIDO\nido-main\.env`

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nido"
JWT_SECRET="nido-local-secret"
JWT_EXPIRES_IN="7d"
PORT=5000
CLIENT_URL="http://localhost:5173"
VITE_API_BASE_URL="/api"
```

**Razón**: Ahora cuando `dotenv.config()` busque el archivo `.env`, lo encontrará en el directorio actual de trabajo.

---

### 2. **Mejorar `backend/src/shared/env.js`** ✓

**Cambio**: Especificar la ruta explícita del archivo `.env`

```javascript
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
```

**Razones**:
- Es más explícito y resistente a cambios en el cwd
- Se asegura que dotenv busque en la raíz del proyecto
- Añadí DATABASE_URL al objeto `env` exportado

**Antes**:
```javascript
require('dotenv').config();
```

**Después**:
```javascript
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT || 5000),
  CLIENT_URL: process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'nido-local-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nido',
};
```

---

### 3. **Agregar comentarios en español** ✓

Se añadieron comentarios detallados en los siguientes archivos:

- `backend/src/shared/env.js` - Explicar carga de variables y configuración
- `backend/src/shared/prisma.js` - Explicar patrón Singleton y PrismaClient
- `backend/src/modules/properties/property.controller.js` - Comentar cada función y bloque de código

**Ejemplo de comentarios agregados**:

```javascript
// ============================================================================
// CONTROLADOR: OBTENER PROPIEDADES DESTACADAS
// ============================================================================
// Retorna las 4 propiedades más recientes publicadas para mostrar en
// la página de inicio. Este es el endpoint donde ocurría el error original.
const getFeaturedPropiedades = async (req, res) => {
  // Obtener ID del usuario actual para personalizar favoritos
  const currentUserId = req.user?.id || null;
  
  // AQUÍ OCURRÍA EL ERROR ORIGINAL:
  // ❌ Error: Environment variable not found: DATABASE_URL
  // Cause: El archivo .env no estaba en la ruta correcta para dotenv
  // Solution: Mover .env a la raíz del proyecto y configurar la ruta en env.js
```

---

## 📊 RESUMEN DE CAMBIOS

| Componente | Cambio | Impacto |
|-----------|--------|---------|
| `.env` (nuevo) | Crear en raíz | ✅ Variables encontradas |
| `env.js` | Especificar ruta + agregar DATABASE_URL | ✅ dotenv busca en la ruta correcta |
| `prisma.js` | Agregar comentarios | 📝 Documentación |
| `property.controller.js` | Agregar comentarios en español | 📝 Documentación |

---

## 🚀 VERIFICACIÓN

El error debería estar resuelto. Para verificar:

```bash
npm run dev
# O específicamente
npm run dev:backend
```

Si Prisma se inicializa correctamente, verás:

```
[1] NIDO API corriendo en http://localhost:5000
```

Sin errores de `DATABASE_URL`.

---

## 📚 FUNCIONALIDAD COMENTADA

### Archivos con Comentarios en Español:

1. **env.js**: Configuración de variables de entorno
   - Carga de dotenv
   - Validación y valores por defecto
   - DATABASE_URL crítica para Prisma

2. **prisma.js**: Cliente ORM
   - Patrón Singleton
   - Gestión de instancias
   - Configuración de logs

3. **property.controller.js**: Controladores de propiedades
   - `propertyInclude()` - Relaciones a incluir
   - `buildWhere()` - Constructores de filtros (10 tipos)
   - `buildOrderBy()` - Ordenamiento
   - `normalizePropertyInput()` - Normalización de datos
   - `generateSlug()` - Generación de slugs
   - `listPropiedades()` - Listar con paginación
   - `getFeaturedPropiedades()` - Propiedades destacadas (donde ocurría el error)
   - `getMyPropiedades()` - Propiedades del usuario
   - `getPropertyById()` - Detalle individual
   - `createProperty()` - Crear nueva
   - `updateProperty()` - Actualizar
   - `deleteProperty()` - Eliminar con validaciones

---

## ⚠️ NOTAS IMPORTANTES

1. **Seguridad**: El `.env` contiene credenciales. Asegúrate de que está en `.gitignore`
2. **Base de datos**: La URL apunta a `localhost:5432`. Asegúrate que PostgreSQL está corriendo
3. **Desarrollo vs Producción**: En producción, usar variables de entorno del servidor, no archivo `.env`

---

**Generado**: 22 de Abril de 2026

