import { api } from './api';

/**
 * Servicio de autenticación para conectar frontend con backend
 */
export const authService = {
  /**
   * Iniciar sesión
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña del usuario
   * @returns {Promise<{success: boolean, user?: object, token?: string, error?: string}>}
   */
  async login(email, password) {
    try {
      const response = await api.auth.login({ email, password });

      if (response && response.user && response.tokens) {
        return {
          success: true,
          user: response.user,
          token: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken
        };
      }

      throw new Error('Respuesta del servidor inválida');
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Error al iniciar sesión'
      };
    }
  },

  /**
   * Registrar nuevo usuario
   * @param {object} userData - Datos del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña del usuario
   * @param {string} userData.firstName - Nombre del usuario
   * @param {string} userData.lastName - Apellido del usuario
   * @returns {Promise<{success: boolean, user?: object, token?: string, error?: string}>}
   */
  async register(userData) {
    try {
      const response = await api.auth.register(userData);

      if (response && response.user && response.tokens) {
        return {
          success: true,
          user: response.user,
          token: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken
        };
      }

      throw new Error('Respuesta del servidor inválida');
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.message || 'Error al registrarse'
      };
    }
  },

  /**
   * Cerrar sesión
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async logout() {
    try {
      await api.auth.logout();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Continuar con logout local aunque falle el servidor
      return { success: true };
    }
  },

  /**
   * Verificar token actual
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async verifyToken() {
    try {
      const user = await api.auth.me();
      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Token verification error:', error);
      return {
        success: false,
        error: error.message || 'Token inválido o expirado'
      };
    }
  },

  /**
   * Refrescar token de acceso
   * @param {string} refreshToken - Token de refresco
   * @returns {Promise<{success: boolean, token?: string, error?: string}>}
   */
  async refreshToken(refreshToken) {
    try {
      const response = await api.auth.refresh({ refreshToken });

      if (response && response.accessToken) {
        return {
          success: true,
          token: response.accessToken
        };
      }

      throw new Error('Respuesta del servidor inválida');
    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: error.message || 'Error al refrescar token'
      };
    }
  },

  /**
   * Solicitar recuperación de contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async forgotPassword(email) {
    try {
      await api.auth.forgotPassword(email);
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Error al enviar email de recuperación'
      };
    }
  },

  /**
   * Restablecer contraseña con token
   * @param {string} token - Token de restablecimiento
   * @param {string} password - Nueva contraseña
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async resetPassword(token, password) {
    try {
      await api.auth.resetPassword(token, password);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Error al restablecer contraseña'
      };
    }
  },

  /**
   * Validar formato de email
   * @param {string} email - Email a validar
   * @returns {boolean}
   */
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validar contraseña
   * @param {string} password - Contraseña a validar
   * @returns {object} - {isValid: boolean, errors: string[]}
   */
  validatePassword(password) {
    const errors = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default authService;
