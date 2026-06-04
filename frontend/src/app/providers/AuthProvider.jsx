import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../../lib/apiClient';
import { clearAuthToken, setAuthToken } from '../../lib/authToken';
import {
  getEmailConfirmationUrl,
  getOAuthCallbackUrl,
  getPasswordResetUrl,
  supabase,
} from '../../lib/supabaseClient';
import { normalizeAuthRedirectPath } from '../../features/auth/authRedirects';

const normalizeAuthError = (error, fallback = 'No fue posible completar la autenticación.') => {
  const message = error?.message || fallback;
  const normalized = message.toLowerCase();

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('email not confirmed') ||
    normalized.includes('invalid credentials')
  ) {
    return new Error('Correo o contraseña incorrectos, o la cuenta aún no está confirmada.');
  }

  if (normalized.includes('failed to fetch') || normalized.includes('network')) {
    return new Error('No pudimos conectar con el servicio de autenticación. Intenta nuevamente.');
  }

  if (
    normalized.includes('oauth') ||
    normalized.includes('provider') ||
    normalized.includes('access_denied')
  ) {
    return new Error('No pudimos completar el ingreso con Google. Intenta nuevamente.');
  }

  return new Error(message);
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

// Sincroniza el token recibido desde Supabase con el cliente HTTP y recupera
// el perfil enriquecido desde el backend para unificar permisos y datos de usuario.
const applySessionProfile = async (session, { silent = false } = {}) => {
  if (!session?.access_token) {
    clearAuthToken();
    return { profile: null, session: null };
  }

  setAuthToken(session.access_token);

  const response = await api.post('/auth/sync-user');

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
    throw new Error('Ingresa la contraseña.');
  }

  if (String(payload.password || '').length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.');
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
  const hydrateSession = useCallback(async (nextSession, options = {}) => {
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
  }, []);

  const refreshUser = useCallback(async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    return hydrateSession(currentSession, { keepError: true });
  }, [hydrateSession]);

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
  }, [hydrateSession]);

  const sessionFromApiPayload = (payload) => ({
    access_token: payload?.token || null,
    refresh_token: payload?.refreshToken || null,
    expires_at: payload?.expiresAt || null,
  });

  // Acciones de alto nivel consumidas por formularios y rutas protegidas.
  const login = async ({ email, identifier, password }) => {
    const resolvedIdentifier = String(identifier || email || '').trim();

    if (!resolvedIdentifier) {
      throw new Error('Ingresa tu correo o usuario.');
    }

    if (!String(password || '').trim()) {
      throw new Error('Ingresa la contraseña.');
    }

    const response = await api.post(
      '/auth/login',
      {
        identifier: resolvedIdentifier,
        password,
      },
      { auth: false }
    );
    const payload = response.data;

    if (!payload?.token || !payload?.refreshToken) {
      throw new Error('No pudimos establecer la sesión.');
    }

    const nextSession = sessionFromApiPayload(payload);

    if (supabase.auth.setSession) {
      const { data, error } = await supabase.auth.setSession({
        access_token: payload.token,
        refresh_token: payload.refreshToken,
      });

      if (error) {
        throw normalizeAuthError(error, 'Sesión creada, pero no fue posible persistirla.');
      }

      if (data.session?.access_token) {
        nextSession.access_token = data.session.access_token;
        nextSession.refresh_token = data.session.refresh_token;
        nextSession.expires_at = data.session.expires_at;
      }
    }

    setAuthToken(nextSession.access_token);
    setSession(nextSession);
    setUser(payload.user);
    setAuthError('');

    return payload.user;
  };

  // Compatibilidad para formularios antiguos: el alias admin usa el mismo login real.
  const devLogin = async ({ identifier, password }) => login({ identifier, password });

  const register = async (payload) => {
    validateRegisterPayload(payload);

    const role = payload.role === 'LANDLORD' ? 'LANDLORD' : 'TENANT';
    const email = normalizeEmail(payload.email);
    const emailRedirectTo = getEmailConfirmationUrl();

    if (import.meta.env.DEV) {
      console.info('[Auth Debug] signup email:', email);
      console.info('[Auth Debug] redirectTo:', emailRedirectTo);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: payload.password,
      options: {
        emailRedirectTo,
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

    const isRepeatedSignup =
      Array.isArray(data.user?.identities) && data.user.identities.length === 0;

    if (isRepeatedSignup) {
      clearAuthToken();
      setSession(null);
      setUser(null);
      setAuthError('');

      return {
        alreadyRegistered: true,
        email,
        profile: null,
        requiresEmailConfirmation: false,
        session: null,
      };
    }

    if (data.session) {
      try {
        const profile = await hydrateSession(data.session, { keepError: true });
        setAuthError('');
        return {
          email,
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
      email,
      profile: null,
      requiresEmailConfirmation: true,
      session: null,
    };
  };

  const signInWithGoogle = async ({ next } = {}) => {
    const callbackUrl = new URL(getOAuthCallbackUrl());
    const normalizedNext = normalizeAuthRedirectPath(next);

    if (normalizedNext) {
      callbackUrl.searchParams.set('next', normalizedNext);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      throw normalizeAuthError(error, 'No pudimos completar el ingreso con Google.');
    }
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

  const resendSignupConfirmation = async (email) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw new Error('Ingresa el correo.');
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: getEmailConfirmationUrl(),
      },
    });

    if (error) {
      throw normalizeAuthError(
        error,
        'No pudimos reenviar el correo de confirmacion en este momento.'
      );
    }

    return true;
  };

  const forgotPassword = async (email) => {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      throw new Error('Ingresa el correo.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: getPasswordResetUrl(),
    });

    if (error) {
      throw normalizeAuthError(error, 'No fue posible enviar el enlace de recuperación.');
    }
  };

  const resetPassword = async (password) => {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      throw normalizeAuthError(error, 'No fue posible actualizar la contraseña.');
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

  const value = useMemo(() => ({
    authError,
    devLogin,
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
    resendSignupConfirmation,
    resetPassword,
    session,
    signInWithGoogle,
    updateProfile,
    user,
  }), [
    authError,
    isPasswordRecovery,
    loading,
    session,
    user,
    refreshUser,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
