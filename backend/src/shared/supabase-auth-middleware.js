// ============================================================================
// MIDDLEWARE DE AUTENTICACIÓN CON SUPABASE
// ============================================================================
// Este módulo proporciona middleware para validar y adjuntar el usuario
// autenticado a cada request. Se utiliza en rutas protegidas.
//
// Flujo:
// 1. Extraer token del header Authorization
// 2. Validar el token con Supabase
// 3. Obtener datos extendidos del usuario
// 4. Adjuntar usuario al request (req.user)

const { supabase, supabaseAdmin, getUserData } = require('./supabase');
const { unauthorized } = require('./errors');

// ============================================================================
// EXTRACCIÓN DEL TOKEN JWT
// ============================================================================
/**
 * Extraer el token JWT del header Authorization
 * 
 * Espera formato: "Bearer <token>"
 * 
 * @param {Object} req - Request de Express
 * @returns {string|null} - Token JWT o null si no existe
 */
const extractToken = (req) => {
  // Obtener el header Authorization
  const authorization = req.headers.authorization;

  // Validar que existe y comienza con "Bearer "
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  // Extraer y retornar el token (sin "Bearer ")
  return authorization.slice(7);
};

// ============================================================================
// ADJUNTAR USUARIO AL REQUEST
// ============================================================================
/**
 * Validar token de Supabase y adjuntar usuario al request
 * 
 * @param {Object} req - Request de Express
 * @param {boolean} strict - Si es true, lanza error si no hay token válido
 * @throws {UnauthorizedError} - Si strict=true y el token es inválido
 */
const attachUser = async (req, strict = false) => {
  try {
    // ========================================================================
    // PASO 1: Extraer token del request
    // ========================================================================
    const token = extractToken(req);

    if (!token) {
      if (strict) {
        // Si es una ruta protegida, lanzar error
        throw unauthorized('Token no proporcionado');
      }
      // Si no es una ruta protegida, simplemente no adjuntar usuario
      req.user = null;
      return;
    }

    // ========================================================================
    // PASO 2: Validar token con Supabase
    // ========================================================================
    // Supabase verifica la firma del JWT automáticamente
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      if (strict) {
        throw unauthorized('Token inválido o expirado');
      }
      req.user = null;
      return;
    }

    const authUser = data.user;

    // ========================================================================
    // PASO 3: Obtener datos extendidos del usuario
    // ========================================================================
    // El usuario existe en Supabase Auth, ahora obtener datos de nuestra tabla
    const userProfile = await getUserData(authUser.id);

    // ========================================================================
    // PASO 4: Adjuntar usuario completo al request
    // ========================================================================
    // Combinar datos de Auth con datos extendidos
    req.user = {
      // Datos de Supabase Auth
      id: authUser.id,
      email: authUser.email,
      emailConfirmedAt: authUser.email_confirmed_at,
      phone: authUser.phone,
      lastSignInAt: authUser.last_sign_in_at,
      
      // Datos extendidos de nuestra tabla
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      avatarUrl: userProfile?.avatarUrl || null,
      bio: userProfile?.bio || null,
      phone: userProfile?.phone || null,
      role: userProfile?.role || 'TENANT',
      
      // Metadata de Supabase Auth
      metadata: authUser.user_metadata || {},
    };
  } catch (error) {
    console.error('Error attaching user:', error);
    
    if (strict) {
      throw unauthorized(error.message || 'Error al validar usuario');
    }
    
    req.user = null;
  }
};

// ============================================================================
// MIDDLEWARE PARA RUTAS PÚBLICAS (OPCIONALES)
// ============================================================================
/**
 * Middleware que adjunta usuario si existe, pero no lo requiere
 * Úsalo en rutas que pueden accederse con o sin autenticación
 * 
 * Ejemplo:
 *   router.get('/properties', requireAuthOptional, getProperties);
 */
const requireAuthOptional = async (req, res, next) => {
  try {
    await attachUser(req, false); // strict = false
    next();
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// MIDDLEWARE PARA RUTAS PROTEGIDAS (REQUIEREN AUTENTICACIÓN)
// ============================================================================
/**
 * Middleware que requiere autenticación válida
 * Úsalo en rutas que necesitan un usuario autenticado
 * 
 * Ejemplo:
 *   router.post('/properties', requireAuth, createProperty);
 */
const requireAuth = async (req, res, next) => {
  try {
    await attachUser(req, true); // strict = true - Lanza error si no hay token
    next();
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// MIDDLEWARE PARA VALIDAR ROL DEL USUARIO
// ============================================================================
/**
 * Middleware que verifica que el usuario tenga un rol específico
 * 
 * Ejemplo:
 *   router.post('/admin/users', requireAuth, requireRole('ADMIN'), deleteUser);
 * 
 * @param {string|Array<string>} requiredRoles - Rol(es) requerido(s)
 * @returns {Function} - Middleware de Express
 */
const requireRole = (requiredRoles) => {
  return async (req, res, next) => {
    try {
      // Primero, asegurar que el usuario está autenticado
      await attachUser(req, true);

      // Convertir requiredRoles a array si es un string
      const rolesArray = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];

      // Verificar si el rol del usuario está en la lista de roles permitidos
      if (!rolesArray.includes(req.user.role)) {
        throw unauthorized(
          `Se requiere uno de los siguientes roles: ${rolesArray.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// ============================================================================
// MIDDLEWARE PARA VALIDAR PROPIEDAD DE RECURSO
// ============================================================================
/**
 * Middleware que verifica que el usuario sea el propietario de un recurso
 * 
 * Ejemplo:
 *   router.put('/properties/:id', requireAuth, requireOwnership('properties', 'ownerId'), updateProperty);
 * 
 * @param {string} tableName - Nombre de la tabla en Supabase
 * @param {string} ownerFieldName - Nombre del campo que contiene el ID del propietario
 * @param {string} idParamName - Nombre del parámetro de URL que contiene el ID (default: 'id')
 * @returns {Function} - Middleware de Express
 */
const requireOwnership = (tableName, ownerFieldName = 'userId', idParamName = 'id') => {
  return async (req, res, next) => {
    try {
      // Primero, asegurar que el usuario está autenticado
      await attachUser(req, true);

      // Obtener el ID del recurso desde los parámetros
      const resourceId = req.params[idParamName];

      if (!resourceId) {
        throw unauthorized(`Parámetro ${idParamName} no proporcionado`);
      }

      // Obtener el recurso de la tabla
      const { data: resource, error } = await supabaseAdmin
        .from(tableName)
        .select(ownerFieldName)
        .eq('id', resourceId)
        .single();

      if (error || !resource) {
        throw unauthorized('Recurso no encontrado');
      }

      // Verificar que el usuario es el propietario
      if (resource[ownerFieldName] !== req.user.id) {
        throw unauthorized('No tienes permiso para acceder a este recurso');
      }

      // Adjuntar el recurso al request para uso posterior
      req.resource = resource;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// ============================================================================
// EXPORTACIÓN DE MIDDLEWARE
// ============================================================================
module.exports = {
  extractToken,           // Función utilitaria
  attachUser,             // Función utilitaria
  requireAuthOptional,    // Middleware para rutas públicas
  requireAuth,            // Middleware para rutas protegidas
  requireRole,            // Middleware para validar rol
  requireOwnership,       // Middleware para validar propiedad
};
