const { supabaseService } = require('../../shared/supabase');
const { badRequest, forbidden, notFound, serviceUnavailable } = require('../../shared/errors');
const { buildPaginationMeta, getPagination } = require('../../shared/pagination');
const { serializeUser } = require('../../shared/serializers');
const { PROPERTY_SELECT, rowToProperty } = require('../properties/property.controller');

const PROFILE_SELECT = [
  'id',
  'email',
  'first_name',
  'last_name',
  'phone',
  'bio',
  'avatar_url',
  'role',
  'created_at',
  'updated_at',
].join(', ');

const APPLICATION_ACTIVE_STATUSES = [
  'pending',
  'prequalified',
  'documents_pending',
  'under_review',
  'approved',
  'contracting',
  'active',
];

const DB_REQUEST_STATUS_TO_APP = {
  draft: 'PENDING',
  pending: 'PENDING',
  prequalified: 'PENDING',
  documents_pending: 'PENDING',
  under_review: 'PENDING',
  contracting: 'APPROVED',
  active: 'APPROVED',
  completed: 'APPROVED',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  withdrawn: 'WITHDRAWN',
  cancelled: 'WITHDRAWN',
};

const APP_REVIEW_STATUS_TO_DB = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const requireSupabase = () => {
  if (!supabaseService) {
    throw serviceUnavailable('Supabase no esta configurado en el servidor');
  }

  return supabaseService;
};

const logSupabaseError = (context, error) => {
  if (!error) return;

  console.error(`[${context}] Supabase error`, {
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
  });
};

const fromDbRequestStatus = (status) =>
  DB_REQUEST_STATUS_TO_APP[String(status || '').toLowerCase()] || 'PENDING';

const unique = (items) => [...new Set(items.filter(Boolean))];

const getRoleIdForUser = async (client, table, user, { ensure = false } = {}) => {
  if (!user?.id) return null;

  const { data: existing, error: selectError } = await client
    .from(table)
    .select('id, profile_id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (selectError) {
    logSupabaseError(`REQUESTS_${table.toUpperCase()}_LOOKUP`, selectError);
    throw serviceUnavailable('No fue posible cargar tu perfil operativo en Supabase');
  }

  if (existing?.id || !ensure) {
    return existing?.id || null;
  }

  const { data: created, error: insertError } = await client
    .from(table)
    .insert({ id: user.id, profile_id: user.id })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return getRoleIdForUser(client, table, user, { ensure: false });
    }

    logSupabaseError(`REQUESTS_${table.toUpperCase()}_CREATE`, insertError);
    throw serviceUnavailable('No fue posible sincronizar tu perfil operativo en Supabase');
  }

  return created.id;
};

const getTenantIdForUser = (client, user, options) => getRoleIdForUser(client, 'tenants', user, options);

const getLandlordIdForUser = (client, user, options) => getRoleIdForUser(client, 'landlords', user, options);

const fetchRowsByIds = async (client, table, ids, select) => {
  const rowIds = unique(ids);
  if (!rowIds.length) return [];

  const { data, error } = await client.from(table).select(select).in('id', rowIds);

  if (error) {
    logSupabaseError(`REQUESTS_${table.toUpperCase()}_FETCH`, error);
    throw serviceUnavailable('No fue posible cargar datos relacionados de la solicitud');
  }

  return data || [];
};

const fallbackProperty = (propertyId) => ({
  id: propertyId,
  title: 'Propiedad no disponible',
  city: '',
  neighborhood: '',
  monthlyRent: 0,
});

const profileForRoleId = ({ roleId, roleRowsById, profilesById, currentUserId }) => {
  const roleRow = roleRowsById.get(roleId);
  const profile = roleRow ? profilesById.get(roleRow.profile_id) : null;

  if (!profile) {
    return { id: roleId, fullName: 'Usuario NIDO' };
  }

  return serializeUser(profile, profile.id === currentUserId);
};

const applicationRowToRequest = (row, context) => {
  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  const monthlyIncome = metadata.monthlyIncome ?? metadata.monthly_income ?? null;

  return {
    id: row.id,
    status: fromDbRequestStatus(row.status),
    desiredMoveIn: row.desired_move_in,
    leaseMonths: row.lease_months,
    occupants: row.occupants,
    monthlyIncome,
    hasPets: Boolean(row.has_pets),
    phone: metadata.phone || '',
    message: row.cover_letter || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    property: context.propertiesById.get(row.property_id) || fallbackProperty(row.property_id),
    tenant: profileForRoleId({
      roleId: row.tenant_id,
      roleRowsById: context.tenantsById,
      profilesById: context.profilesById,
      currentUserId: context.currentUserId,
    }),
    landlord: profileForRoleId({
      roleId: row.landlord_id,
      roleRowsById: context.landlordsById,
      profilesById: context.profilesById,
      currentUserId: context.currentUserId,
    }),
  };
};

const hydrateApplications = async (client, rows, currentUserId) => {
  const propertyIds = rows.map((row) => row.property_id);
  const tenantIds = rows.map((row) => row.tenant_id);
  const landlordIds = rows.map((row) => row.landlord_id);

  const [properties, tenants, landlords] = await Promise.all([
    fetchRowsByIds(client, 'properties', propertyIds, PROPERTY_SELECT),
    fetchRowsByIds(client, 'tenants', tenantIds, 'id, profile_id'),
    fetchRowsByIds(client, 'landlords', landlordIds, 'id, profile_id'),
  ]);

  const profileIds = unique([
    ...tenants.map((row) => row.profile_id),
    ...landlords.map((row) => row.profile_id),
  ]);
  const profiles = await fetchRowsByIds(client, 'profiles', profileIds, PROFILE_SELECT);

  const context = {
    currentUserId,
    propertiesById: new Map(properties.map((row) => [row.id, rowToProperty(row)])),
    tenantsById: new Map(tenants.map((row) => [row.id, row])),
    landlordsById: new Map(landlords.map((row) => [row.id, row])),
    profilesById: new Map(profiles.map((row) => [row.id, row])),
  };

  return rows.map((row) => applicationRowToRequest(row, context));
};

const listApplicationsForRole = async (req, res, { roleTable, foreignKey }) => {
  const client = requireSupabase();
  const { page, limit, skip } = getPagination(req.query);
  const roleId = await getRoleIdForUser(client, roleTable, req.user);

  if (!roleId) {
    return res.json({
      success: true,
      data: [],
      meta: buildPaginationMeta({ page, limit, total: 0 }),
    });
  }

  const { data, error, count } = await client
    .from('applications')
    .select('*', { count: 'exact' })
    .eq(foreignKey, roleId)
    .order('created_at', { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) {
    logSupabaseError('REQUESTS_LIST_APPLICATIONS', error);
    throw serviceUnavailable('No fue posible cargar las solicitudes');
  }

  const requests = await hydrateApplications(client, data || [], req.user.id);

  return res.json({
    success: true,
    data: requests,
    meta: buildPaginationMeta({ page, limit, total: count || 0 }),
  });
};

const fetchApplicationOrThrow = async (client, id) => {
  const { data, error } = await client.from('applications').select('*').eq('id', id).maybeSingle();

  if (error) {
    logSupabaseError('REQUESTS_FETCH_APPLICATION', error);
    throw serviceUnavailable('No fue posible cargar la solicitud');
  }

  if (!data) {
    throw notFound('La solicitud no existe');
  }

  return data;
};

const assertRequestAccess = async (client, req, application) => {
  const [tenantId, landlordId] = await Promise.all([
    getTenantIdForUser(client, req.user),
    getLandlordIdForUser(client, req.user),
  ]);

  if (application.tenant_id !== tenantId && application.landlord_id !== landlordId) {
    throw forbidden();
  }

  return { tenantId, landlordId };
};

const createRequest = async (req, res) => {
  const client = requireSupabase();

  const { data: property, error: propertyError } = await client
    .from('properties')
    .select('id, landlord_id, status')
    .eq('id', req.body.propertyId)
    .maybeSingle();

  if (propertyError) {
    logSupabaseError('REQUESTS_PROPERTY_LOOKUP', propertyError);
    throw serviceUnavailable('No fue posible validar la propiedad');
  }

  if (!property || property.status !== 'published') {
    throw notFound('La propiedad no esta disponible');
  }

  const [tenantId, landlordId] = await Promise.all([
    getTenantIdForUser(client, req.user, { ensure: true }),
    getLandlordIdForUser(client, req.user),
  ]);

  if (landlordId && property.landlord_id === landlordId) {
    throw badRequest('No puedes solicitar tu propia propiedad');
  }

  const { data: existingRequest, error: existingError } = await client
    .from('applications')
    .select('id')
    .eq('property_id', property.id)
    .eq('tenant_id', tenantId)
    .in('status', APPLICATION_ACTIVE_STATUSES)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    logSupabaseError('REQUESTS_DUPLICATE_LOOKUP', existingError);
    throw serviceUnavailable('No fue posible validar tus solicitudes activas');
  }

  if (existingRequest) {
    throw badRequest('Ya tienes una solicitud activa para esta propiedad');
  }

  const now = new Date().toISOString();
  const { data: created, error: insertError } = await client
    .from('applications')
    .insert({
      property_id: property.id,
      tenant_id: tenantId,
      landlord_id: property.landlord_id,
      desired_move_in: req.body.desiredMoveIn,
      lease_months: req.body.leaseMonths,
      occupants: req.body.occupants,
      has_pets: Boolean(req.body.hasPets),
      cover_letter: req.body.message,
      status: 'pending',
      workflow_stage: 'document_collection',
      submitted_at: now,
      metadata: {
        phone: req.body.phone,
        monthlyIncome: req.body.monthlyIncome ?? null,
      },
    })
    .select('*')
    .single();

  if (insertError) {
    logSupabaseError('REQUESTS_CREATE_APPLICATION', insertError);
    throw serviceUnavailable('No fue posible enviar la solicitud');
  }

  const [request] = await hydrateApplications(client, [created], req.user.id);

  res.status(201).json({
    success: true,
    message: 'Solicitud enviada',
    data: request,
  });
};

const getMyRequests = async (req, res) =>
  listApplicationsForRole(req, res, { roleTable: 'tenants', foreignKey: 'tenant_id' });

const getReceivedRequests = async (req, res) =>
  listApplicationsForRole(req, res, { roleTable: 'landlords', foreignKey: 'landlord_id' });

const getRequestById = async (req, res) => {
  const client = requireSupabase();
  const application = await fetchApplicationOrThrow(client, req.params.id);
  await assertRequestAccess(client, req, application);
  const [request] = await hydrateApplications(client, [application], req.user.id);

  res.json({
    success: true,
    data: request,
  });
};

const updateRequest = async (req, res) => {
  const client = requireSupabase();
  const application = await fetchApplicationOrThrow(client, req.params.id);
  const { tenantId } = await assertRequestAccess(client, req, application);

  if (application.tenant_id !== tenantId) {
    throw forbidden();
  }

  if (application.status !== 'pending') {
    throw badRequest('Solo puedes editar solicitudes pendientes');
  }

  const metadata = application.metadata && typeof application.metadata === 'object' ? application.metadata : {};
  const patch = {
    updated_at: new Date().toISOString(),
    metadata: {
      ...metadata,
      ...(req.body.phone !== undefined ? { phone: req.body.phone } : {}),
      ...(req.body.monthlyIncome !== undefined ? { monthlyIncome: req.body.monthlyIncome } : {}),
    },
  };

  if (req.body.desiredMoveIn !== undefined) patch.desired_move_in = req.body.desiredMoveIn;
  if (req.body.leaseMonths !== undefined) patch.lease_months = req.body.leaseMonths;
  if (req.body.occupants !== undefined) patch.occupants = req.body.occupants;
  if (req.body.hasPets !== undefined) patch.has_pets = req.body.hasPets;
  if (req.body.message !== undefined) patch.cover_letter = req.body.message;

  const { data: updated, error } = await client
    .from('applications')
    .update(patch)
    .eq('id', application.id)
    .select('*')
    .single();

  if (error) {
    logSupabaseError('REQUESTS_UPDATE_APPLICATION', error);
    throw serviceUnavailable('No fue posible actualizar la solicitud');
  }

  const [request] = await hydrateApplications(client, [updated], req.user.id);

  res.json({
    success: true,
    message: 'Solicitud actualizada',
    data: request,
  });
};

const reviewRequest = async (req, res) => {
  const client = requireSupabase();
  const application = await fetchApplicationOrThrow(client, req.params.id);
  const { landlordId } = await assertRequestAccess(client, req, application);

  if (application.landlord_id !== landlordId) {
    throw forbidden();
  }

  const status = APP_REVIEW_STATUS_TO_DB[req.body.status];
  const now = new Date().toISOString();
  const { data: updated, error } = await client
    .from('applications')
    .update({
      status,
      workflow_stage: status === 'approved' ? 'contracting' : application.workflow_stage,
      approved_at: status === 'approved' ? application.approved_at || now : application.approved_at,
      updated_at: now,
    })
    .eq('id', application.id)
    .select('*')
    .single();

  if (error) {
    logSupabaseError('REQUESTS_REVIEW_APPLICATION', error);
    throw serviceUnavailable('No fue posible actualizar el estado de la solicitud');
  }

  const [request] = await hydrateApplications(client, [updated], req.user.id);

  res.json({
    success: true,
    message: 'Estado actualizado',
    data: request,
  });
};

const deleteRequest = async (req, res) => {
  const client = requireSupabase();
  const application = await fetchApplicationOrThrow(client, req.params.id);
  const { tenantId } = await assertRequestAccess(client, req, application);

  if (application.tenant_id !== tenantId) {
    throw forbidden();
  }

  if (application.status === 'approved') {
    throw badRequest('No puedes eliminar una solicitud aprobada');
  }

  const { error } = await client
    .from('applications')
    .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
    .eq('id', application.id);

  if (error) {
    logSupabaseError('REQUESTS_WITHDRAW_APPLICATION', error);
    throw serviceUnavailable('No fue posible retirar la solicitud');
  }

  res.json({
    success: true,
    message: 'Solicitud eliminada',
  });
};

module.exports = {
  createRequest,
  deleteRequest,
  getMyRequests,
  getReceivedRequests,
  getRequestById,
  reviewRequest,
  updateRequest,
};
