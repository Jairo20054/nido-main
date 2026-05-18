const { badRequest, unauthorized } = require('../../shared/errors');
const { supabaseAnon } = require('../../shared/supabase');
const { decorateProfile, ensureProfile } = require('../../shared/auth');
const { serializeUser } = require('../../shared/serializers');
const { env } = require('../../shared/env');
const { ensureDatabaseUserProfile } = require('../users/user.service');

// Normaliza la respuesta de autenticacion para que el frontend reciba siempre
// token, expiracion y perfil bajo la misma estructura.
const buildAuthPayload = (session, user) => ({
  token: session?.access_token || null,
  refreshToken: session?.refresh_token || null,
  expiresAt: session?.expires_at || null,
  user: serializeUser(user, true),
});

const normalizeIdentifier = (value) => String(value || '').trim().toLowerCase();

const adminAliases = () =>
  [
    process.env.ADMIN_LOGIN_ALIAS,
    process.env.SUPER_ADMIN_LOGIN_ALIAS,
    'admin',
  ]
    .map(normalizeIdentifier)
    .filter(Boolean);

const resolveLoginEmail = (identifier) => {
  const normalized = normalizeIdentifier(identifier);

  if (!normalized) {
    return '';
  }

  if (adminAliases().includes(normalized)) {
    return normalizeIdentifier(
      process.env.ADMIN_LOGIN_EMAIL ||
        process.env.SUPER_ADMIN_LOGIN_EMAIL ||
        'admin@nido.local'
    );
  }

  return normalized;
};

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
    throw badRequest('Supabase no está configurado en el servidor');
  }

  const { firstName, lastName, email, password, phone, role } = req.body;
  const normalizedRole = normalizeRole(role);

  const { data, error } = await supabaseAnon.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${env.CLIENT_URL}/email-confirmed`,
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
  const decoratedProfile = profile ? await decorateProfile(data.user, profile) : null;
  const databaseProfile = decoratedProfile ? await ensureDatabaseUserProfile(decoratedProfile) : null;
  const syncedProfile = decoratedProfile
    ? {
        ...decoratedProfile,
        role: databaseProfile.role,
      }
    : null;

  res.status(201).json({
    success: true,
    message: data.session
      ? 'Cuenta creada correctamente.'
      : 'Cuenta creada. Revisa tu correo para confirmar el acceso.',
    data: {
      ...buildAuthPayload(data.session, syncedProfile),
      requiresEmailConfirmation: !data.session,
    },
  });
};

// Inicia sesion contra Supabase y devuelve el perfil enriquecido con permisos.
const login = async (req, res) => {
  if (!supabaseAnon) {
    throw badRequest('Supabase no está configurado en el servidor');
  }

  const { email, identifier, password } = req.body;
  const resolvedEmail = resolveLoginEmail(identifier || email);

  const { data, error } = await supabaseAnon.auth.signInWithPassword({
    email: resolvedEmail,
    password,
  });

  if (error || !data.user) {
    throw unauthorized('Correo o contraseña incorrectos');
  }

  const profile = await ensureProfile(data.user);
  const decoratedProfile = await decorateProfile(data.user, profile);
  const databaseProfile = await ensureDatabaseUserProfile(decoratedProfile);
  const syncedProfile = {
    ...decoratedProfile,
    role: databaseProfile.role,
  };

  res.json({
    success: true,
    message: 'Sesión iniciada',
    data: buildAuthPayload(data.session, syncedProfile),
  });
};

// Compatibilidad para clientes viejos: usa el mismo flujo real de Supabase.
const devLogin = async (req, res) => {
  return login(req, res);
};

const me = async (req, res) => {
  res.json({
    success: true,
    data: serializeUser(req.user, true),
  });
};

// Endpoint idempotente para sincronizar la sesion Supabase con el perfil Prisma.
// requireAuth valida el JWT, ejecuta ensureProfile con upsert y deja req.user listo.
const syncUser = async (req, res) => {
  res.json({
    success: true,
    data: serializeUser(req.user, true),
  });
};

// El frontend invalida la sesion real; este endpoint sirve como confirmacion semantica.
const logout = async (_req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada',
  });
};

// Dispara el correo de recuperacion apuntando al flujo de reset del cliente.
const forgotPassword = async (req, res) => {
  if (!supabaseAnon) {
    throw badRequest('Supabase no está configurado en el servidor');
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
    message: 'Si el correo existe, recibirás instrucciones para restablecer la contraseña.',
  });
};

module.exports = {
  devLogin,
  forgotPassword,
  login,
  logout,
  me,
  register,
  syncUser,
};
