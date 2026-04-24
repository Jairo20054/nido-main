// ============================================================================
// CONTROLADOR DE AUTENTICACIÓN CON SUPABASE
// ============================================================================
// Este módulo proporciona los controladores para:
// - Registro de nuevos usuarios
// - Inicio de sesión
// - Obtener datos del usuario autenticado
// - Cierre de sesión
// - Cambio de contraseña
// - Recuperación de contraseña

// ============================================================================
// IMPORTACIONES
// ============================================================================
// Servicios de autenticación con Supabase
const {
  signUp,
  signIn,
  resetPassword,
} = require('../../shared/supabase-auth');
const { supabaseAdmin } = require('../../shared/supabase');

// Función para serializar datos del usuario (remover información sensible)
const { serializeUser } = require('../../shared/serializers');

// Funciones para lanzar errores personalizados
const { badRequest, unauthorized } = require('../../shared/errors');

// ============================================================================
// CONTROLADOR: REGISTRO DE NUEVO USUARIO
// ============================================================================
/**
 * Registrar un nuevo usuario en la plataforma
 * 
 * Request body:
 *   - firstName: string (requerido)
 *   - lastName: string (requerido)
 *   - email: string (requerido, debe ser válido)
 *   - password: string (requerido, mínimo 8 caracteres)
 *   - phone: string (opcional)
 *   - role: string (opcional, default: 'TENANT')
 */
const register = async (req, res) => {
  const { firstName, lastName, email, password, phone, role } = req.body;

  // ========================================================================
  // VALIDAR DATOS DE ENTRADA
  // ========================================================================
  if (!firstName || !lastName) {
    throw badRequest('firstName y lastName son requeridos');
  }

  if (!email || !password) {
    throw badRequest('email y password son requeridos');
  }

  if (password.length < 8) {
    throw badRequest('La contraseña debe tener al menos 8 caracteres');
  }

  // ========================================================================
  // LLAMAR SERVICIO DE REGISTRO
  // ========================================================================
  // El servicio maneja:
  // 1. Crear usuario en Supabase Auth
  // 2. Crear perfil extendido en tabla 'users'
  // 3. Encriptación automática de contraseña
  const result = await signUp(email, password, {
    firstName,
    lastName,
    phone,
    role,
  });

  if (!result.success) {
    // Si el email ya existe, Supabase retorna un error específico
    if (result.error.includes('already registered')) {
      throw badRequest('Ya existe una cuenta con este correo');
    }
    throw badRequest(result.error);
  }

  // ========================================================================
  // RETORNAR RESPUESTA
  // ========================================================================
  res.status(201).json({
    success: true,
    message: 'Cuenta creada correctamente. Por favor confirma tu email.',
    data: {
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
    },
  });
};

// ============================================================================
// CONTROLADOR: INICIO DE SESIÓN
// ============================================================================
/**
 * Iniciar sesión de un usuario existente
 * 
 * Request body:
 *   - email: string (requerido)
 *   - password: string (requerido)
 * 
 * Response:
 *   - session: { accessToken, refreshToken, expiresIn, expiresAt }
 *   - user: Datos del usuario autenticado
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  // ========================================================================
  // VALIDAR DATOS DE ENTRADA
  // ========================================================================
  if (!email || !password) {
    throw badRequest('email y password son requeridos');
  }

  // ========================================================================
  // LLAMAR SERVICIO DE INICIO DE SESIÓN
  // ========================================================================
  // Supabase valida las credenciales automáticamente
  const result = await signIn(email, password);

  if (!result.success) {
    // No revelar si el email existe o no (seguridad)
    throw unauthorized('Email o contraseña incorrectos');
  }

  // ========================================================================
  // RETORNAR RESPUESTA
  // ========================================================================
  res.json({
    success: true,
    message: 'Sesión iniciada correctamente',
    data: {
      session: result.session,
      user: serializeUser(result.user, true),
    },
  });
};

// ============================================================================
// CONTROLADOR: OBTENER DATOS DEL USUARIO AUTENTICADO
// ============================================================================
/**
 * Obtener los datos del usuario actualmente autenticado
 * 
 * Requiere: Token JWT válido en header Authorization
 * 
 * Response:
 *   - user: Datos completos del usuario autenticado
 */
const me = async (req, res) => {
  // El usuario ya fue adjuntado al request por el middleware requireAuth
  // req.user contiene todos los datos del usuario autenticado

  res.json({
    success: true,
    data: serializeUser(req.user, true),
  });
};

// ============================================================================
// CONTROLADOR: CIERRE DE SESIÓN
// ============================================================================
/**
 * Cerrar la sesión del usuario autenticado
 * 
 * Requiere: Token JWT válido en header Authorization
 * 
 * Nota: El cierre de sesión es principalmente en el cliente.
 * El servidor simplemente valida que existe una sesión activa.
 */
const logout = async (req, res) => {
  // En una arquitectura stateless con JWT, el logout es manejado por el cliente
  // El cliente simplemente descarta el token.
  // Opcionalmente, podrías mantener una lista negra (blacklist) de tokens,
  // pero para simplificar, solo devolvemos una confirmación.

  res.json({
    success: true,
    message: 'Sesión cerrada correctamente',
  });
};

// ============================================================================
// CONTROLADOR: CAMBIAR CONTRASEÑA
// ============================================================================
/**
 * Cambiar la contraseña del usuario autenticado
 * 
 * Requiere: Token JWT válido en header Authorization
 * 
 * Request body:
 *   - newPassword: string (requerido, mínimo 8 caracteres)
 */
const changePassword = async (req, res) => {
  const { newPassword } = req.body;

  // ========================================================================
  // VALIDAR DATOS DE ENTRADA
  // ========================================================================
  if (!newPassword) {
    throw badRequest('newPassword es requerido');
  }

  if (newPassword.length < 8) {
    throw badRequest('La nueva contraseña debe tener al menos 8 caracteres');
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
    password: newPassword,
  });

  if (error) {
    throw badRequest(error.message);
  }

  // ========================================================================
  // RETORNAR RESPUESTA
  // ========================================================================
  res.json({
    success: true,
    message: 'Contraseña actualizada correctamente',
  });
};

// ============================================================================
// CONTROLADOR: SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ============================================================================
/**
 * Enviar un enlace de recuperación de contraseña al email del usuario
 * 
 * Request body:
 *   - email: string (requerido)
 * 
 * Nota: Supabase enviará un email con un enlace que contiene un token
 */
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // ========================================================================
  // VALIDAR DATOS DE ENTRADA
  // ========================================================================
  if (!email) {
    throw badRequest('email es requerido');
  }

  // ========================================================================
  // LLAMAR SERVICIO DE RECUPERACIÓN
  // ========================================================================
  // Supabase enviará un email al usuario con un enlace
  const result = await resetPassword(email);

  if (!result.success) {
    throw badRequest(result.error);
  }

  // ========================================================================
  // RETORNAR RESPUESTA
  // ========================================================================
  // Nota: Siempre retornar éxito (incluso si el email no existe)
  // para evitar que alguien descubra qué emails están registrados
  res.json({
    success: true,
    message: 'Si existe una cuenta con este email, recibirás un enlace de recuperación',
  });
};

// ============================================================================
// CONTROLADOR: CONFIRMAR NUEVA CONTRASEÑA DESDE ENLACE DE RECUPERACIÓN
// ============================================================================
/**
 * Confirmar la nueva contraseña después de hacer click en el enlace de recuperación
 * 
 * Request body:
 *   - token: string (token de la URL de recuperación)
 *   - newPassword: string (requerido, mínimo 8 caracteres)
 */
const resetPasswordConfirm = async (req, res) => {
  const { newPassword } = req.body;

  // ========================================================================
  // VALIDAR DATOS DE ENTRADA
  // ========================================================================
  if (!newPassword) {
    throw badRequest('newPassword es requerido');
  }

  if (newPassword.length < 8) {
    throw badRequest('La nueva contraseña debe tener al menos 8 caracteres');
  }

  const token = req.headers.authorization?.slice(7);

  if (!token) {
    throw unauthorized('Token no proporcionado');
  }

  const { data, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !data.user) {
    throw unauthorized(userError?.message || 'Token no válido');
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
    password: newPassword,
  });

  if (error) {
    throw badRequest(error.message);
  }

  // ========================================================================
  // RETORNAR RESPUESTA
  // ========================================================================
  res.json({
    success: true,
    message: 'Contraseña restablecida correctamente. Por favor inicia sesión.',
  });
};

// ============================================================================
// EXPORTACIÓN DE CONTROLADORES
// ============================================================================
module.exports = {
  register,               // POST /auth/register
  login,                  // POST /auth/login
  me,                     // GET /auth/me
  logout,                 // POST /auth/logout
  changePassword,         // POST /auth/change-password
  forgotPassword,         // POST /auth/forgot-password
  resetPasswordConfirm,   // POST /auth/reset-password-confirm
};

