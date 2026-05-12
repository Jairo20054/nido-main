import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/apiClient';
import { clearAuthToken, setAuthToken } from '../../lib/authToken';
import {
  getEmailConfirmationUrl,
  getPasswordResetUrl,
  getSupabaseConfigError,
  resolveAuthEmail,
  supabase,
} from '../../lib/supabaseClient';

const AuthContext = createContext(null);

const normalizeAuthError = (error, fallback = 'No fue posible completar la autenticacion.') => {
  const message = error?.message || fallback;
  const normalized = message.toLowerCase();

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('email not confirmed') ||
    normalized.includes('invalid credentials')
  ) {
    return new Error('Correo o contrasena incorrectos, o la cuenta aun no esta confirmada.');
  }

  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return new Error('No pudimos conectar con el servicio de autenticacion. Intenta de nuevo.');
  }

  return new Error(message);
};

// Sincroniza el token recibido desde Supabase con el cliente HTTP y recupera
// el perfil enriquecido desde el backend para unificar permisos y datos de usuario.
const applySessionProfile = async (session, { silent = false } = {}) => {
  if (!session?.access_token) {
    clearAuthToken();
    return { profile: null, session: null };
  }

  setAuthToken(session.access_token);

  const response = await api.get('/auth/me');

  if (!silent) {
    // No-op placeholder for future toast integration.
  }

  return { profile: response.data, session };
};

const validateRegisterPayload = (payload) => {
  if (!String(payload.firstName || '').trim()) {
    throw new Error('Ingresa el nombre.');
  }

  if (!String(payload.lastName || '').trim()) {
    throw new Error('Ingresa el apellido.');
  }

  if (!String(payload.email || '').trim()) {
    throw new Error('Ingresa el correo.');
  }

  if (!String(payload.password || '').trim()) {
    throw new Error('Ingresa la contrasena.');
  }

  if (String(payload.password || '').length < 8) {
    throw new Error('La contrasena debe tener al menos 8 caracteres.');
  }
};

/**
 * Componente de uso transversal para autenticacion.
 * Debe envolver todo el arbol que necesite conocer sesion, usuario, roles o helpers
 * como login, logout, registro y actualizacion de perfil.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const authTaskTimers = useRef(new Set());

  // Rehidrata el estado local cada vez que cambia la sesion remota.
  const hydrateSession = async (nextSession, options = {}) => {
    try {
      if (!nextSession?.access_token) {
        clearAuthToken();
        setSession(null);
        setUser(null);
        setIsPasswordRecovery(false);
        if (!options.keepError) {
          setAuthError('');
        }
        return null;
      }

      const result = await applySessionProfile(nextSession, options);
      setSession(result.session);
      setUser(result.profile);
      if (!options.keepError) {
        setAuthError('');
      }
      return result.profile;
    } catch (error) {
      clearAuthToken();
      setSession(null);
      setUser(null);
      if (!options.keepError) {
        setAuthError(normalizeAuthError(error).message);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    return hydrateSession(currentSession, { keepError: true });
  };

  useEffect(() => {
    let mounted = true;

    // En el arranque intentamos reutilizar la sesion persistida por Supabase.
    const bootstrap = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (!mounted) {
          return;
        }

        await hydrateSession(currentSession, { keepError: true });
      } catch (error) {
        if (!mounted) {
          return;
        }

        clearAuthToken();
        setSession(null);
        setUser(null);
        setAuthError(normalizeAuthError(error).message);
        setLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // El callback de Supabase puede ejecutarse durante el render; por eso se
      // delega a la cola de tareas para evitar estados inconsistentes.
      const taskId = setTimeout(() => {
        authTaskTimers.current.delete(taskId);

        if (!mounted) {
          return;
        }

        if (event === 'SIGNED_OUT') {
          clearAuthToken();
          setSession(null);
          setUser(null);
          setIsPasswordRecovery(false);
          setAuthError('');
          setLoading(false);
          return;
        }

        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

        if (nextSession?.access_token) {
          void hydrateSession(nextSession, { keepError: true }).catch((error) => {
            if (mounted) {
              setAuthError(normalizeAuthError(error).message);
            }
          });
        }
      }, 0);

      authTaskTimers.current.add(taskId);
    });

    return () => {
      mounted = false;
      authTaskTimers.current.forEach((taskId) => clearTimeout(taskId));
      authTaskTimers.current.clear();
      subscription.unsubscribe();
    };
  }, []);

  // Acciones de alto nivel consumidas por formularios y rutas protegidas.
  const login = async ({ email, identifier, password }) => {
    const resolvedEmail = resolveAuthEmail(identifier || email);

    if (!resolvedEmail) {
      throw new Error('Ingresa tu correo o usuario.');
    }

    if (!String(password || '').trim()) {
      throw new Error('Ingresa la contrasena.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password,
    });

    if (error) {
      throw error.message === getSupabaseConfigError() ? error : normalizeAuthError(error);
    }

    try {
      const profile = await hydrateSession(data.session, { keepError: true });
      setAuthError('');
      return profile;
    } catch (profileError) {
      throw normalizeAuthError(profileError, 'Sesion creada, pero no fue posible cargar tu perfil.');
    }
  };

  const register = async (payload) => {
    validateRegisterPayload(payload);

    const role = payload.role === 'LANDLORD' ? 'LANDLORD' : 'TENANT';
    const { data, error } = await supabase.auth.signUp({
      email: String(payload.email || '').trim().toLowerCase(),
      password: payload.password,
      options: {
        emailRedirectTo: getEmailConfirmationUrl(),
        data: {
          first_name: String(payload.firstName || '').trim(),
          last_name: String(payload.lastName || '').trim(),
          phone: String(payload.phone || '').trim() || null,
          role,
        },
      },
    });

    if (error) {
      throw normalizeAuthError(error, 'No fue posible crear la cuenta.');
    }

    if (data.session) {
      try {
        const profile = await hydrateSession(data.session, { keepError: true });
        setAuthError('');
        return {
          profile,
          requiresEmailConfirmation: false,
          session: data.session,
        };
      } catch (profileError) {
        throw normalizeAuthError(profileError, 'Cuenta creada, pero no fue posible cargar tu perfil.');
      }
    }

    clearAuthToken();
    setSession(null);
    setUser(null);
    setAuthError('');

    return {
      profile: null,
      requiresEmailConfirmation: true,
      session: null,
    };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      clearAuthToken();
      setSession(null);
      setUser(null);
      setIsPasswordRecovery(false);
      setAuthError('');
    }
  };

  const forgotPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getPasswordResetUrl(),
    });

    if (error) {
      throw normalizeAuthError(error, 'No fue posible enviar el enlace de recuperacion.');
    }
  };

  const resetPassword = async (password) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw normalizeAuthError(error, 'No fue posible actualizar la contrasena.');
    }

    setIsPasswordRecovery(false);

    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    if (currentSession?.access_token) {
      await hydrateSession(currentSession, { keepError: true });
    }

    setAuthError('');
    return true;
  };

  const updateProfile = async (payload) => {
    const response = await api.patch('/users/me', payload);
    setUser(response.data);
    return response.data;
  };

  const value = {
    authError,
    forgotPassword,
    hasRole: (...roles) => roles.includes(user?.role),
    isAdmin: user?.role === 'ADMIN',
    isAuthenticated: Boolean(session?.access_token && user),
    isLandlord: user?.role === 'LANDLORD' || user?.role === 'ADMIN',
    isPasswordRecovery,
    isTenant: user?.role === 'TENANT',
    loading,
    login,
    logout,
    refreshUser,
    register,
    resetPassword,
    session,
    updateProfile,
    user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }

  return context;
}
