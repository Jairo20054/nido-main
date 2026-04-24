// ============================================================================
// SERVICIOS DE AUTENTICACIÓN CON SUPABASE
// ============================================================================
// Este módulo proporciona todas las funciones necesarias para manejar
// la autenticación de usuarios usando Supabase Auth.
//
// Incluye:
// - Registro de nuevos usuarios
// - Inicio de sesión
// - Cierre de sesión
// - Refresh de tokens
// - Verificación de emails
// - Cambio de contraseña

const { supabase, supabaseAdmin, createUserProfile } = require('./supabase');
const { env } = require('./env');

// ============================================================================
// SERVICIO DE REGISTRO (SIGN UP)
// ============================================================================
/**
 * Registrar un nuevo usuario en Supabase
 * 
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {Object} userData - Datos adicionales del usuario (firstName, lastName, etc.)
 * @returns {Promise<Object>} - { success: boolean, user: Object, error: string }
 */
const signUp = async (email, password, userData) => {
  try {
    // ========================================================================
    // PASO 1: Crear usuario en Supabase Auth
    // ========================================================================
    // Supabase Auth manejará la encriptación de la contraseña automáticamente
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Datos que se guardarán en user_metadata
        data: {
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
        },
      },
    });

    if (authError || !authData.user) {
      return {
        success: false,
        user: null,
        error: authError?.message || 'Error al registrar usuario',
      };
    }

    const authUser = authData.user;

    // ========================================================================
    // PASO 2: Crear perfil extendido en tabla 'users'
    // ========================================================================
    // Además del registro en Auth, guardamos datos adicionales en nuestra tabla
    const requestedRole = (userData?.role || 'tenant').toString().toLowerCase() === 'landlord'
      ? 'landlord'
      : 'tenant';

    const userProfile = await createUserProfile({
      id: authUser.id, // Usar el mismo ID de Supabase Auth
      email: authUser.email,
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      avatarUrl: userData?.avatarUrl || null,
      bio: userData?.bio || null,
      phone: userData?.phone || null,
      role: requestedRole,
    });

    if (!userProfile) {
      // Si falla la creación del perfil, limpiar el usuario de Auth
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      return {
        success: false,
        user: null,
        error: 'Error al crear perfil de usuario',
      };
    }

    return {
      success: true,
      user: {
        id: authUser.id,
        email: authUser.email,
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        role: requestedRole,
      },
      error: null,
    };
  } catch (error) {
    console.error('SignUp error:', error);
    return {
      success: false,
      user: null,
      error: error.message,
    };
  }
};

// ============================================================================
// SERVICIO DE INICIO DE SESIÓN (SIGN IN)
// ============================================================================
/**
 * Iniciar sesión de un usuario
 * 
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} - { success: boolean, session: Object, user: Object, error: string }
 */
const signIn = async (email, password) => {
  try {
    // Usar Supabase Auth para iniciar sesión
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return {
        success: false,
        session: null,
        user: null,
        error: error?.message || 'Email o contraseña incorrectos',
      };
    }

    const session = data.session;
    const authUser = data.user;

    // Obtener datos extendidos del usuario desde nuestra tabla
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    return {
      success: true,
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresIn: session.expires_in,
        expiresAt: session.expires_at,
      },
      user: userProfile || {
        id: authUser.id,
        email: authUser.email,
      },
      error: null,
    };
  } catch (error) {
    console.error('SignIn error:', error);
    return {
      success: false,
      session: null,
      user: null,
      error: error.message,
    };
  }
};

// ============================================================================
// SERVICIO DE CIERRE DE SESIÓN (SIGN OUT)
// ============================================================================
/**
 * Cerrar sesión del usuario
 * 
 * @param {string} accessToken - Token de acceso del usuario
 * @returns {Promise<Object>} - { success: boolean, error: string }
 */
const signOut = async (accessToken) => {
  try {
    // Usar el token para cerrar la sesión
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('SignOut error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// SERVICIO DE REFRESH TOKEN
// ============================================================================
/**
 * Refrescar el token de acceso usando el refresh token
 * 
 * @param {string} refreshToken - Token de actualización
 * @returns {Promise<Object>} - { success: boolean, session: Object, error: string }
 */
const refreshSession = async (refreshToken) => {
  try {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      return {
        success: false,
        session: null,
        error: error?.message || 'Error al refrescar sesión',
      };
    }

    const session = data.session;

    return {
      success: true,
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresIn: session.expires_in,
        expiresAt: session.expires_at,
      },
      error: null,
    };
  } catch (error) {
    console.error('Refresh session error:', error);
    return {
      success: false,
      session: null,
      error: error.message,
    };
  }
};

// ============================================================================
// SERVICIO DE CAMBIO DE CONTRASEÑA
// ============================================================================
/**
 * Cambiar la contraseña del usuario autenticado
 * 
 * @param {string} accessToken - Token de acceso del usuario
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} - { success: boolean, error: string }
 */
const updatePassword = async (accessToken, newPassword) => {
  try {
    // Supabase requiere validar el token primero
    const { error } = await supabase.auth.updateUser(
      { password: newPassword },
      { access_token: accessToken }
    );

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// SERVICIO DE RECUPERACIÓN DE CONTRASEÑA
// ============================================================================
/**
 * Enviar enlace de recuperación de contraseña al email del usuario
 * 
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} - { success: boolean, error: string }
 */
const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${env.CLIENT_URL}/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// SERVICIO DE CONFIRMACIÓN DE NUEVA CONTRASEÑA
// ============================================================================
/**
 * Confirmar la nueva contraseña después de hacer click en el enlace de recuperación
 * 
 * @param {string} accessToken - Token de sesión
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} - { success: boolean, error: string }
 */
const updatePasswordAfterReset = async (accessToken, newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser(
      { password: newPassword },
      { access_token: accessToken }
    );

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Update password after reset error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// SERVICIO DE VERIFICACIÓN DE EMAIL
// ============================================================================
/**
 * Verificar el email del usuario usando el token de confirmación
 * 
 * @param {string} email - Email a verificar
 * @param {string} token - Token de confirmación
 * @param {string} type - Tipo de token ('email_change', 'signup', etc.)
 * @returns {Promise<Object>} - { success: boolean, error: string }
 */
const verifyEmail = async (email, token, type = 'email_change') => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Verify email error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// EXPORTACIÓN DE SERVICIOS
// ============================================================================
module.exports = {
  signUp,
  signIn,
  signOut,
  refreshSession,
  updatePassword,
  resetPassword,
  updatePasswordAfterReset,
  verifyEmail,
};
