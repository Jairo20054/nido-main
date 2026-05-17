const { badRequest, serviceUnavailable, unauthorized } = require('../../shared/errors');
const { serializeUser } = require('../../shared/serializers');
const { deleteAuthUser } = require('../../shared/auth');
const { supabaseAnon } = require('../../shared/supabase');
const { supabaseAdmin } = require('../../shared/supabaseAdmin');

const PROFILE_TABLE = 'profiles';
const PROFILE_SELECT = [
  'id',
  'email',
  'first_name',
  'last_name',
  'phone',
  'bio',
  'avatar_url',
  'role',
  'country_code',
  'locale',
  'timezone',
  'created_at',
  'updated_at',
].join(', ');

const requireSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    throw serviceUnavailable('Supabase de administración no está configurado en el servidor');
  }

  return supabaseAdmin;
};

const buildProfileUpdatePayload = (body) => {
  const payload = {};

  if (body.firstName !== undefined) payload.first_name = body.firstName;
  if (body.lastName !== undefined) payload.last_name = body.lastName;
  if (body.phone !== undefined) payload.phone = body.phone || null;
  if (body.bio !== undefined) payload.bio = body.bio || null;
  if (body.avatarUrl !== undefined) payload.avatar_url = body.avatarUrl || null;

  if (Object.keys(payload).length) {
    payload.updated_at = new Date().toISOString();
  }

  return payload;
};

// Devuelve el perfil autenticado ya serializado para el cliente.
const getProfile = async (req, res) => {
  res.json({
    success: true,
    data: serializeUser(req.user, true),
  });
};

// Actualiza solo los campos editables del perfil publico del usuario.
const updateProfile = async (req, res) => {
  const client = requireSupabaseAdmin();
  const payload = buildProfileUpdatePayload(req.body);
  const { data: user, error } = await client
    .from(PROFILE_TABLE)
    .update(payload)
    .eq('id', req.user.id)
    .select(PROFILE_SELECT)
    .single();

  if (error) {
    throw serviceUnavailable('No fue posible actualizar el perfil en Supabase');
  }

  res.json({
    success: true,
    message: 'Perfil actualizado',
    data: serializeUser(
      {
        ...user,
        role: req.user.role,
        isPlatformAdmin: req.user.isPlatformAdmin,
      },
      true
    ),
  });
};

// Reautentica con contrasena antes de eliminar la cuenta y el usuario de Supabase.
const deleteProfile = async (req, res) => {
  if (!supabaseAnon) {
    throw badRequest('Supabase no está configurado en el servidor');
  }

  const { error } = await supabaseAnon.auth.signInWithPassword({
    email: req.user.email,
    password: req.body.password,
  });

  if (error) {
    throw unauthorized('La contraseña no coincide');
  }

  await deleteAuthUser(req.user.id);

  const { error: profileError } = await requireSupabaseAdmin()
    .from(PROFILE_TABLE)
    .delete()
    .eq('id', req.user.id);

  if (profileError) {
    throw serviceUnavailable('No fue posible eliminar el perfil en Supabase');
  }

  res.json({
    success: true,
    message: 'Tu cuenta fue eliminada',
  });
};

module.exports = {
  deleteProfile,
  getProfile,
  updateProfile,
};
