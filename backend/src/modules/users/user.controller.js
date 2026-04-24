const { supabaseAdmin } = require('../../shared/supabase');
const { badRequest } = require('../../shared/errors');
const { serializeUser } = require('../../shared/serializers');

const getProfile = async (req, res) => {
  res.json({
    success: true,
    data: serializeUser(req.user, true),
  });
};

const updateProfile = async (req, res) => {
  const payload = {
    id: req.user.id,
    email: req.user.email,
    first_name: req.body.firstName ?? req.user.firstName ?? '',
    last_name: req.body.lastName ?? req.user.lastName ?? '',
    phone: req.body.phone ?? null,
    bio: req.body.bio ?? null,
    avatar_url: req.body.avatarUrl ?? null,
    primary_role: req.body.role ?? req.user.role ?? 'tenant',
    locale: req.body.locale ?? req.user.locale ?? 'es-CO',
    country_code: req.body.countryCode ?? req.user.countryCode ?? 'CO',
    timezone: req.body.timezone ?? req.user.timezone ?? 'America/Bogota',
  };

  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .upsert([payload], { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    throw badRequest(error.message);
  }

  res.json({
    success: true,
    message: 'Perfil actualizado',
    data: serializeUser(user, true),
  });
};

const deleteProfile = async (req, res) => {
  const { error: authError } = await supabaseAdmin.auth.signInWithPassword({
    email: req.user.email,
    password: req.body.password,
  });

  if (authError) {
    throw badRequest('La contrasena no coincide');
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(req.user.id);

  if (error) {
    throw badRequest(error.message);
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
