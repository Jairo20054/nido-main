const { badRequest, unauthorized } = require('../../shared/errors');
const { supabaseAnon } = require('../../shared/supabase');
const { ensureProfile } = require('../../shared/auth');
const { serializeUser } = require('../../shared/serializers');
const { env } = require('../../shared/env');

// Normaliza la respuesta de autenticacion para que el frontend reciba siempre
// token, expiracion y perfil bajo la misma estructura.
const buildAuthPayload = (session, user) => ({
  token: session?.access_token || null,
  refreshToken: session?.refresh_token || null,
  expiresAt: session?.expires_at || null,
  user: serializeUser(user, true),
});

// El registro publico solo permite roles de negocio esperados por la plataforma.
const normalizeRole = (role) => {
  if (typeof role !== 'string') {
    return 'TENANT';
  }

  const normalized = role.toUpperCase();
  return ['TENANT', 'LANDLORD'].includes(normalized) ? normalized : 'TENANT';
};

// Crea la cuenta en Supabase y garantiza la existencia del perfil en la capa de negocio.
const register = async (req, res) => {
  if (!supabaseAnon) {
    throw badRequest('Supabase no esta configurado en el servidor');
  }

  const { firstName, lastName, email, password, phone, role } = req.body;
  const normalizedRole = normalizeRole(role);

  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.CLIENT_URL}/login`,
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        role: normalizedRole,
      },
    },
  });

  if (error) {
    throw badRequest(error.message);
  }

  const profile = data.user ? await ensureProfile(data.user) : null;

  res.status(201).json({
    success: true,
    message: data.session
      ? 'Cuenta creada correctamente'
      : 'Cuenta creada. Revisa tu correo para confirmar el acceso.',
    data: {
      ...buildAuthPayload(data.session, profile),
      requiresEmailConfirmation: !data.session,
    },
  });
};

// Inicia sesion contra Supabase y devuelve el perfil enriquecido con permisos.
const login = async (req, res) => {
  if (!supabaseAnon) {
    throw badRequest('Supabase no esta configurado en el servidor');
  }

  const { email, password } = req.body;

  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    throw unauthorized('Correo o contrasena incorrectos');
  }

  const profile = await ensureProfile(data.user);

  res.json({
    success: true,
    message: 'Sesion iniciada',
    data: buildAuthPayload(data.session, profile),
  });
};

// Expone el usuario autenticado ya cargado por el middleware de seguridad.
const me = async (req, res) => {
  res.json({
    success: true,
    data: serializeUser(req.user, true),
  });
};

// El frontend invalida la sesion real; este endpoint sirve como confirmacion semantica.
const logout = async (_req, res) => {
  res.json({
    success: true,
    message: 'Sesion cerrada',
  });
};

// Dispara el correo de recuperacion apuntando al flujo de reset del cliente.
const forgotPassword = async (req, res) => {
  if (!supabaseAnon) {
    throw badRequest('Supabase no esta configurado en el servidor');
  }

  const { email } = req.body;

  const { error } = await supabaseAnon.auth.resetPasswordForEmail(email, {
    redirectTo: `${env.CLIENT_URL}/reset-password`,
  });

  if (error) {
    throw badRequest(error.message);
  }

  res.json({
    success: true,
    message: 'Si el correo existe, recibiras instrucciones para restablecer la contrasena.',
  });
};

module.exports = {
  forgotPassword,
  login,
  logout,
  me,
  register,
};
