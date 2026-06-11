const { randomBytes } = require('crypto');
const { supabaseService } = require('../../shared/supabase');
const { forbidden, notFound, serviceUnavailable } = require('../../shared/errors');
const { buildPaginationMeta, getPagination } = require('../../shared/pagination');
const { slugify } = require('../../shared/slugify');

const PROPERTY_SELECT = `
  *,
  property_images (
    id,
    image_url,
    alt_text,
    position,
    created_at
  )
`;

const PUBLIC_STATUS = 'published';
const APP_STATUS_TO_DB = {
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  RENTED: 'rented',
  ARCHIVED: 'archived',
};

const DB_STATUS_TO_APP = Object.fromEntries(
  Object.entries(APP_STATUS_TO_DB).map(([appStatus, dbStatus]) => [dbStatus, appStatus])
);

const BOOLEAN_EXTRAS = {
  furnished: 'furnished',
  petsAllowed: 'pets_allowed',
  elevator: 'elevator',
  balcony: 'balcony',
  security: 'security',
  gym: 'gym',
  gatedCommunity: 'gated_community',
};

const TEXT_FILTER_KEYS = ['q', 'city', 'department', 'neighborhood'];
const SEARCH_BATCH_SIZE = 1000;

const requireSupabase = () => {
  if (!supabaseService) {
    throw serviceUnavailable('Supabase no esta configurado en el servidor');
  }

  return supabaseService;
};

const isAdmin = (user) => user?.role === 'ADMIN';

const assertLandlordOrAdmin = (user) => {
  if (!['LANDLORD', 'ADMIN'].includes(user?.role)) {
    throw forbidden('Solo un arrendador o administrador puede gestionar propiedades');
  }
};

const normalizeText = (value) => String(value || '').trim();
const blankToNull = (value) => {
  const text = normalizeText(value);
  return text || null;
};
const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
const toNullableNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const compactList = (value) => (Array.isArray(value) ? value.map(normalizeText).filter(Boolean) : []);
const normalizePropertyType = (value) => normalizeText(value).toUpperCase();
const fromDbStatus = (status) => DB_STATUS_TO_APP[String(status || '').toLowerCase()] || 'DRAFT';
const toDbStatus = (status, fallback = 'draft') => APP_STATUS_TO_DB[normalizeText(status).toUpperCase()] || fallback;
const toDbPublishedStatus = (status) => {
  const normalized = normalizeText(status).toUpperCase();
  return normalized === 'DRAFT' ? 'draft' : PUBLIC_STATUS;
};

const normalizeSearchText = (value) =>
  normalizeText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const includesSearchText = (source, term) => {
  const normalizedTerm = normalizeSearchText(term);
  if (!normalizedTerm) return true;

  return normalizeSearchText(source).includes(normalizedTerm);
};

const firstPresent = (source, keys) => {
  const key = keys.find((item) => source[item] !== undefined && source[item] !== null && source[item] !== '');
  return key ? source[key] : undefined;
};

const normalizePropertyFilters = (filters = {}) => {
  const propertyType = firstPresent(filters, ['propertyType', 'tipo']);
  const propertyTypes = firstPresent(filters, ['propertyTypes', 'tipos']);

  return {
    ...filters,
    q: firstPresent(filters, ['q', 'search', 'location', 'ubicacion']),
    city: firstPresent(filters, ['city', 'ciudad']),
    department: firstPresent(filters, ['department', 'departamento']),
    neighborhood: firstPresent(filters, ['neighborhood', 'barrio']),
    propertyType,
    propertyTypes,
    minRent: firstPresent(filters, ['minRent', 'minPrice', 'min']),
    maxRent: firstPresent(filters, ['maxRent', 'maxPrice', 'priceMax', 'max']),
    bedrooms: firstPresent(filters, ['bedrooms', 'rooms', 'habitaciones', 'hab']),
    bathrooms: firstPresent(filters, ['bathrooms', 'banos']),
    areaMin: firstPresent(filters, ['areaMin', 'area']),
  };
};

const hasTextFilters = (filters) => TEXT_FILTER_KEYS.some((key) => Boolean(normalizeText(filters[key])));

const rowMatchesTextFilters = (row, filters) => {
  const q = normalizeText(filters.q);
  if (q) {
    const searchableFields = [
      row.title,
      row.description,
      row.summary,
      row.city,
      row.state_region,
      row.department,
      row.neighborhood,
      row.address,
      row.zone_reference,
    ];

    if (!searchableFields.some((field) => includesSearchText(field, q))) {
      return false;
    }
  }

  if (filters.city && !includesSearchText(row.city, filters.city)) {
    return false;
  }

  if (
    filters.department &&
    ![row.state_region, row.department].some((field) => includesSearchText(field, filters.department))
  ) {
    return false;
  }

  if (filters.neighborhood && !includesSearchText(row.neighborhood, filters.neighborhood)) {
    return false;
  }

  return true;
};

const buildMediaRows = (propertyId, media = []) =>
  media
    .filter((item) => item?.url)
    .map((item, index) => ({
      property_id: propertyId,
      image_url: item.url,
      alt_text: item.alt || null,
      position: Number.isInteger(item.position) ? item.position : index,
    }));

const includesAmenity = (amenities, words) => {
  const text = compactList(amenities).join(' ').toLowerCase();
  return words.some((word) => text.includes(word));
};

const rowToMedia = (row) => {
  const images = (row.property_images || [])
    .slice()
    .sort((left, right) => (left.position || 0) - (right.position || 0))
    .map((image) => ({
      id: image.id,
      type: 'IMAGE',
      url: image.image_url,
      alt: image.alt_text,
      position: image.position || 0,
      createdAt: image.created_at,
    }));

  return {
    images,
    media: images,
    coverImage: row.cover_image_url || images[0]?.url || null,
  };
};

const rowToProperty = (row, favoriteIds = new Set()) => {
  if (!row) return null;

  const media = rowToMedia(row);

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary || row.description || '',
    description: row.description || row.summary || '',
    propertyType: normalizePropertyType(row.property_type),
    rentalType: row.rental_type || 'FULL_HOME',
    status: fromDbStatus(row.status),
    city: row.city,
    department: row.state_region || row.department || '',
    neighborhood: row.neighborhood || '',
    addressLine: row.address,
    addressDetail: row.address_line_2 || '',
    hideExactAddress: Boolean(row.hide_exact_address),
    zoneReference: row.zone_reference || '',
    monthlyRent: Number(row.monthly_rent || 0),
    maintenanceFee: Number(row.maintenance_fee || 0),
    administrationIncluded: Boolean(row.administration_included),
    securityDeposit: Number(row.security_deposit || 0),
    depositRequired: Boolean(row.deposit_required),
    servicesIncluded: row.services_included || [],
    availableImmediately: Boolean(row.available_immediately),
    availableFrom: row.available_from,
    bedrooms: Number(row.bedrooms || 0),
    bathrooms: Number(row.bathrooms || 0),
    areaM2: row.area_m2 === null || row.area_m2 === undefined ? null : Number(row.area_m2),
    floor: row.floor,
    parkingSpots: Number(row.parking_spots || 0),
    strata: row.strata,
    maxOccupants: Number(row.max_occupants || 1),
    furnished: Boolean(row.furnished),
    petsAllowed: Boolean(row.pets_allowed),
    utilitiesIncluded: Boolean(row.utilities_included),
    balcony: Boolean(row.balcony),
    equippedKitchen: Boolean(row.equipped_kitchen),
    laundryArea: Boolean(row.laundry_area),
    elevator: Boolean(row.elevator),
    doorman: Boolean(row.doorman),
    security: Boolean(row.security),
    gym: Boolean(row.gym),
    gatedCommunity: Boolean(row.gated_community),
    commonAreas: Boolean(row.common_areas),
    minLeaseMonths: Number(row.min_lease_months || 6),
    amenities: row.amenities || [],
    rules: row.rules || '',
    requirements: row.requirements || '',
    idealTenantProfile: row.ideal_tenant_profile || '',
    specialConditions: row.special_conditions || '',
    contactMethod: row.contact_method || '',
    verificationDetails: row.verification_details || '',
    contactName: row.contact_name || '',
    contactPhone: row.contact_phone || '',
    contactWhatsapp: row.contact_whatsapp || '',
    contactEmail: row.contact_email || '',
    contactPreference: row.contact_preference || '',
    publishingAuthorization: Boolean(row.publishing_authorization),
    acceptsStudents: Boolean(row.accepts_students),
    acceptsFamilies: Boolean(row.accepts_families),
    acceptsCosigner: Boolean(row.accepts_cosigner),
    requiresRentalStudy: Boolean(row.requires_rental_study),
    visitsAllowed: Boolean(row.visits_allowed),
    visitHours: row.visit_hours || '',
    visitNotes: row.visit_notes || '',
    rejectionReason: row.rejection_reason || '',
    latitude: row.latitude === null || row.latitude === undefined ? null : Number(row.latitude),
    longitude: row.longitude === null || row.longitude === undefined ? null : Number(row.longitude),
    approvedAt: row.approved_at,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    owner: null,
    isFavorite: favoriteIds.has(row.id),
    requestCount: 0,
    approvalHistory: [],
    ...media,
  };
};

const propertyRowFromPayload = (payload, user, { existing = null, forCreate = false, landlordId = null } = {}) => {
  const status = forCreate ? toDbPublishedStatus(payload.status) : toDbStatus(payload.status, existing?.status || 'draft');
  const now = new Date().toISOString();
  const coverImage = (payload.media || []).find((item) => item?.url)?.url || existing?.cover_image_url || null;
  const amenities = compactList(payload.amenities);

  return {
    ...(forCreate ? { landlord_id: landlordId || user.id } : {}),
    title: payload.title,
    summary: payload.summary || null,
    description: payload.description || payload.summary,
    slug: existing?.slug || slugify(`${payload.title}-${payload.city}`) || `propiedad-${randomBytes(3).toString('hex')}`,
    property_type: normalizePropertyType(payload.propertyType),
    rental_type: payload.rentalType || 'FULL_HOME',
    status,
    address: payload.addressLine,
    city: payload.city,
    country: payload.country || 'Colombia',
    country_code: 'CO',
    currency_code: 'COP',
    state_region: blankToNull(payload.department),
    neighborhood: blankToNull(payload.neighborhood),
    address_line_2: blankToNull(payload.addressDetail),
    hide_exact_address: Boolean(payload.hideExactAddress),
    zone_reference: blankToNull(payload.zoneReference),
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    bedrooms: toNumber(payload.bedrooms, 0),
    bathrooms: toNumber(payload.bathrooms, 1),
    area_m2: toNullableNumber(payload.areaM2),
    floor: toNullableNumber(payload.floor),
    parking_spots: toNumber(payload.parkingSpots, 0),
    strata: toNullableNumber(payload.strata),
    max_occupants: toNumber(payload.maxOccupants, 1),
    furnished: Boolean(payload.furnished),
    pets_allowed: Boolean(payload.petsAllowed),
    monthly_rent: toNumber(payload.monthlyRent, 0),
    security_deposit: toNumber(payload.securityDeposit, 0),
    maintenance_fee: toNumber(payload.maintenanceFee, 0),
    min_lease_months: toNumber(payload.minLeaseMonths, 6),
    available_from: payload.availableImmediately ? null : payload.availableFrom || null,
    available_immediately: Boolean(payload.availableImmediately),
    administration_included: Boolean(payload.administrationIncluded),
    deposit_required: Boolean(payload.depositRequired),
    services_included: compactList(payload.servicesIncluded),
    amenities,
    utilities_included: Boolean(payload.utilitiesIncluded || payload.servicesIncluded?.length),
    balcony: Boolean(payload.balcony),
    equipped_kitchen: Boolean(payload.equippedKitchen),
    laundry_area: Boolean(payload.laundryArea),
    elevator: Boolean(payload.elevator),
    doorman: Boolean(payload.doorman),
    security: Boolean(payload.security),
    gym: Boolean(payload.gym) || includesAmenity(amenities, ['gimnasio', 'gym']),
    gated_community: Boolean(payload.gatedCommunity) || includesAmenity(amenities, ['conjunto cerrado', 'unidad cerrada']),
    common_areas: Boolean(payload.commonAreas),
    rules: blankToNull(payload.rules),
    requirements: blankToNull(payload.requirements),
    ideal_tenant_profile: blankToNull(payload.idealTenantProfile),
    special_conditions: blankToNull(payload.specialConditions),
    contact_method: blankToNull(payload.contactMethod),
    verification_details: blankToNull(payload.verificationDetails),
    contact_name: blankToNull(payload.contactName),
    contact_phone: blankToNull(payload.contactPhone),
    contact_whatsapp: blankToNull(payload.contactWhatsapp),
    contact_email: blankToNull(payload.contactEmail),
    contact_preference: blankToNull(payload.contactPreference),
    publishing_authorization: Boolean(payload.publishingAuthorization),
    accepts_students: Boolean(payload.acceptsStudents),
    accepts_families: Boolean(payload.acceptsFamilies),
    accepts_cosigner: Boolean(payload.acceptsCosigner),
    requires_rental_study: Boolean(payload.requiresRentalStudy),
    visits_allowed: Boolean(payload.visitsAllowed),
    visit_hours: blankToNull(payload.visitHours),
    visit_notes: blankToNull(payload.visitNotes),
    cover_image_url: coverImage,
    approved_at: status === PUBLIC_STATUS || status === 'approved' ? existing?.approved_at || now : existing?.approved_at || null,
    published_at: status === PUBLIC_STATUS ? existing?.published_at || now : existing?.published_at || null,
    updated_at: now,
  };
};

const getLandlordIdForUser = async (client, user, { ensure = false } = {}) => {
  if (!user?.id) return null;

  const { data: existing, error: selectError } = await client
    .from('landlords')
    .select('id')
    .eq('profile_id', user.id)
    .maybeSingle();

  if (selectError) {
    throw serviceUnavailable('No fue posible sincronizar el perfil de arrendador en Supabase');
  }

  if (existing?.id || !ensure) {
    return existing?.id || null;
  }

  const { data: created, error: insertError } = await client
    .from('landlords')
    .insert({ profile_id: user.id })
    .select('id')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return getLandlordIdForUser(client, user, { ensure: false });
    }

    throw serviceUnavailable('No fue posible sincronizar el perfil de arrendador en Supabase');
  }

  return created.id;
};

const favoriteIdsFor = async (client, userId, propertyIds) => {
  if (!userId || !propertyIds.length) return new Set();

  const { data, error } = await client
    .from('favorites')
    .select('property_id')
    .eq('tenant_id', userId)
    .in('property_id', propertyIds);

  if (error) return new Set();

  return new Set((data || []).map((item) => item.property_id));
};

const applySearchFilters = (query, filters, user) => {
  const canSeeAllStatuses = isAdmin(user);

  const propertyTypes = compactList(String(filters.propertyTypes || '').split(',')).map(normalizePropertyType);
  if (filters.propertyType) propertyTypes.push(normalizePropertyType(filters.propertyType));
  const uniqueTypes = [...new Set(propertyTypes.filter(Boolean))];

  if (uniqueTypes.length === 1) {
    query = query.ilike('property_type', uniqueTypes[0]);
  } else if (uniqueTypes.length > 1) {
    query = query.in('property_type', uniqueTypes);
  }

  if (filters.minRent !== undefined) query = query.gte('monthly_rent', filters.minRent);
  if (filters.maxRent !== undefined) query = query.lte('monthly_rent', filters.maxRent);
  if (filters.bedrooms !== undefined) query = query.gte('bedrooms', filters.bedrooms);
  if (filters.bathrooms !== undefined) query = query.gte('bathrooms', filters.bathrooms);
  if (filters.areaMin !== undefined) query = query.gte('area_m2', filters.areaMin);
  if (filters.parking === true) query = query.gt('parking_spots', 0);

  Object.entries(BOOLEAN_EXTRAS).forEach(([filterKey, column]) => {
    if (filters[filterKey] !== undefined) {
      query = query.eq(column, filters[filterKey]);
    }
  });

  if (filters.availableFrom) {
    query = query.or(`available_immediately.eq.true,available_from.lte.${filters.availableFrom}`);
  }

  if (filters.status && canSeeAllStatuses) {
    query = query.eq('status', toDbStatus(filters.status));
  } else if (!canSeeAllStatuses) {
    query = query.eq('status', PUBLIC_STATUS);
  }

  return query;
};

const buildPropertiesListQuery = (client, filters, user, { count = false } = {}) => {
  let query = count
    ? client.from('properties').select(PROPERTY_SELECT, { count: 'exact' })
    : client.from('properties').select(PROPERTY_SELECT);

  query = applySearchFilters(query, filters, user);
  return applyOrdering(query, filters.sort);
};

const applyOrdering = (query, sort) => {
  if (sort === 'rent-asc') return query.order('monthly_rent', { ascending: true }).order('created_at', { ascending: false });
  if (sort === 'rent-desc') return query.order('monthly_rent', { ascending: false }).order('created_at', { ascending: false });
  if (sort === 'latest') return query.order('created_at', { ascending: false });
  if (sort === 'area-desc') return query.order('area_m2', { ascending: false }).order('created_at', { ascending: false });

  return query.order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
};

const fetchPropertyRow = async (client, propertyId) => {
  const { data, error } = await client
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('id', propertyId)
    .maybeSingle();

  if (error) {
    throw serviceUnavailable('No fue posible cargar la propiedad desde Supabase');
  }

  return data;
};

const canManageProperty = (user, row, landlordId = null) =>
  isAdmin(user) || row?.landlord_id === user?.id || row?.landlord_id === landlordId;

const syncPropertyImages = async (client, propertyId, media = []) => {
  const { error: deleteError } = await client.from('property_images').delete().eq('property_id', propertyId);
  if (deleteError) throw serviceUnavailable('No fue posible actualizar las imagenes de la propiedad');

  const imageRows = buildMediaRows(propertyId, media);
  if (!imageRows.length) return;

  const { error: insertError } = await client.from('property_images').insert(imageRows);
  if (insertError) throw serviceUnavailable('No fue posible guardar las imagenes de la propiedad');
};

const listProperties = async (req, res) => {
  const client = requireSupabase();
  const filters = normalizePropertyFilters(req.query);
  const { page, limit, skip } = getPagination(req.query);

  if (hasTextFilters(filters)) {
    const rows = [];
    let batchOffset = 0;

    while (true) {
      const { data, error } = await buildPropertiesListQuery(client, filters, req.user)
        .range(batchOffset, batchOffset + SEARCH_BATCH_SIZE - 1);

      if (error) {
        throw serviceUnavailable('No fue posible consultar propiedades en Supabase');
      }

      rows.push(...(data || []));

      if (!data || data.length < SEARCH_BATCH_SIZE) {
        break;
      }

      batchOffset += SEARCH_BATCH_SIZE;
    }

    const filteredRows = rows.filter((property) => rowMatchesTextFilters(property, filters));
    const pageRows = filteredRows.slice(skip, skip + limit);
    const favoriteIds = await favoriteIdsFor(client, req.user?.id, pageRows.map((item) => item.id));

    return res.json({
      success: true,
      data: pageRows.map((property) => rowToProperty(property, favoriteIds)),
      meta: buildPaginationMeta({ page, limit, total: filteredRows.length }),
    });
  }

  const { data, error, count } = await buildPropertiesListQuery(client, filters, req.user, { count: true })
    .range(skip, skip + limit - 1);

  if (error) {
    throw serviceUnavailable('No fue posible consultar propiedades en Supabase');
  }

  const favoriteIds = await favoriteIdsFor(client, req.user?.id, (data || []).map((item) => item.id));

  res.json({
    success: true,
    data: (data || []).map((property) => rowToProperty(property, favoriteIds)),
    meta: buildPaginationMeta({ page, limit, total: count || 0 }),
  });
};

const getFeaturedProperties = async (req, res) => {
  const client = requireSupabase();
  const { data, error } = await client
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('status', PUBLIC_STATUS)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    throw serviceUnavailable('No fue posible consultar propiedades destacadas');
  }

  const favoriteIds = await favoriteIdsFor(client, req.user?.id, (data || []).map((item) => item.id));

  res.json({
    success: true,
    data: (data || []).map((property) => rowToProperty(property, favoriteIds)),
  });
};

const getMyProperties = async (req, res) => {
  assertLandlordOrAdmin(req.user);

  const client = requireSupabase();
  const { page, limit, skip } = getPagination(req.query);
  let query = client.from('properties').select(PROPERTY_SELECT, { count: 'exact' });

  if (!isAdmin(req.user)) {
    const landlordId = await getLandlordIdForUser(client, req.user);
    query = query.eq('landlord_id', landlordId || '00000000-0000-0000-0000-000000000000');
  }

  const { data, error, count } = await query
    .order('updated_at', { ascending: false })
    .range(skip, skip + limit - 1);

  if (error) {
    throw serviceUnavailable('No fue posible cargar tus propiedades');
  }

  res.json({
    success: true,
    data: (data || []).map((property) => rowToProperty(property)),
    meta: buildPaginationMeta({ page, limit, total: count || 0 }),
  });
};

const getPropertyById = async (req, res) => {
  const client = requireSupabase();
  const row = await fetchPropertyRow(client, req.params.id);
  const landlordId = req.user ? await getLandlordIdForUser(client, req.user) : null;

  if (!row || (!canManageProperty(req.user, row, landlordId) && row.status !== PUBLIC_STATUS)) {
    throw notFound('La propiedad no esta disponible');
  }

  const favoriteIds = await favoriteIdsFor(client, req.user?.id, [row.id]);

  res.json({
    success: true,
    data: rowToProperty(row, favoriteIds),
  });
};

const createProperty = async (req, res) => {
  assertLandlordOrAdmin(req.user);

  const client = requireSupabase();
  const landlordId = await getLandlordIdForUser(client, req.user, { ensure: true });

  const row = propertyRowFromPayload(req.body, req.user, { forCreate: true, landlordId });
  const { data, error } = await client.from('properties').insert(row).select(PROPERTY_SELECT).single();

  if (error) {
    throw serviceUnavailable('No fue posible guardar la propiedad en Supabase');
  }

  try {
    await syncPropertyImages(client, data.id, req.body.media || []);
  } catch (error) {
    await client.from('properties').delete().eq('id', data.id);
    throw error;
  }

  const created = await fetchPropertyRow(client, data.id);

  res.status(201).json({
    success: true,
    message: created.status === PUBLIC_STATUS ? 'Propiedad publicada correctamente' : 'Propiedad guardada correctamente',
    data: rowToProperty(created),
  });
};

const updateProperty = async (req, res) => {
  const client = requireSupabase();
  const existing = await fetchPropertyRow(client, req.params.id);
  const landlordId = await getLandlordIdForUser(client, req.user);

  if (!existing) {
    throw notFound('La propiedad no existe');
  }

  if (!canManageProperty(req.user, existing, landlordId)) {
    throw forbidden();
  }

  const mergedPayload = {
    ...rowToProperty(existing),
    ...req.body,
  };
  const row = propertyRowFromPayload(mergedPayload, req.user, { existing });

  const { error } = await client.from('properties').update(row).eq('id', req.params.id);

  if (error) {
    throw serviceUnavailable('No fue posible actualizar la propiedad en Supabase');
  }

  if (req.body.media) {
    await syncPropertyImages(client, req.params.id, req.body.media);
  }

  const updated = await fetchPropertyRow(client, req.params.id);

  res.json({
    success: true,
    message: 'Propiedad actualizada correctamente',
    data: rowToProperty(updated),
  });
};

const updatePropertyLocation = async (req, res) => {
  const client = requireSupabase();
  const existing = await fetchPropertyRow(client, req.params.id);
  const landlordId = await getLandlordIdForUser(client, req.user);

  if (!existing) {
    throw notFound('La propiedad no existe');
  }

  if (!canManageProperty(req.user, existing, landlordId)) {
    throw forbidden();
  }

  const now = new Date().toISOString();
  const patch = {
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    updated_at: now,
  };

  const address = blankToNull(req.body.addressLine ?? req.body.address);
  const city = blankToNull(req.body.city);
  const country = blankToNull(req.body.country);

  if (address !== null) patch.address = address;
  if (city !== null) patch.city = city;
  if (country !== null) patch.country = country;

  const { error } = await client.from('properties').update(patch).eq('id', req.params.id);

  if (error) {
    throw serviceUnavailable('No fue posible actualizar la ubicacion de la propiedad');
  }

  const updated = await fetchPropertyRow(client, req.params.id);

  res.json({
    success: true,
    message: 'Ubicacion actualizada correctamente',
    data: rowToProperty(updated),
  });
};

const changePropertyStatus = async (req, res) => {
  if (!isAdmin(req.user)) {
    throw forbidden('Solo el administrador puede cambiar el estado de publicaciones');
  }

  const client = requireSupabase();
  const existing = await fetchPropertyRow(client, req.params.id);
  const landlordId = await getLandlordIdForUser(client, req.user);

  if (!existing) {
    throw notFound('La propiedad no existe');
  }

  const status = toDbStatus(req.body.status);
  const now = new Date().toISOString();
  const { error } = await client
    .from('properties')
    .update({
      status,
      rejection_reason: status === 'rejected' ? req.body.reviewNote || null : null,
      approved_at: ['approved', PUBLIC_STATUS].includes(status) ? existing.approved_at || now : existing.approved_at,
      published_at: status === PUBLIC_STATUS ? existing.published_at || now : existing.published_at,
      updated_at: now,
    })
    .eq('id', req.params.id);

  if (error) {
    throw serviceUnavailable('No fue posible actualizar el estado de la propiedad');
  }

  const updated = await fetchPropertyRow(client, req.params.id);

  res.json({
    success: true,
    message: 'Estado actualizado correctamente',
    data: rowToProperty(updated),
  });
};

const deleteProperty = async (req, res) => {
  const client = requireSupabase();
  const existing = await fetchPropertyRow(client, req.params.id);
  const landlordId = await getLandlordIdForUser(client, req.user);

  if (!existing) {
    throw notFound('La propiedad no existe');
  }

  if (!canManageProperty(req.user, existing, landlordId)) {
    throw forbidden();
  }

  const { error } = await client.from('properties').delete().eq('id', req.params.id);

  if (error) {
    throw serviceUnavailable('No fue posible eliminar la propiedad');
  }

  res.json({
    success: true,
    message: 'Propiedad eliminada',
  });
};

const getAdminPropertyStats = async (_req, res) => {
  const client = requireSupabase();
  const { data, error } = await client.from('properties').select('status');

  if (error) {
    throw serviceUnavailable('No fue posible cargar estadisticas de propiedades');
  }

  const grouped = (data || []).reduce((acc, row) => {
    const status = fromDbStatus(row.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      propertiesByStatus: Object.entries(grouped).map(([status, total]) => ({ status, total })),
      usersByRole: [],
      totals: {
        properties: data?.length || 0,
        requests: 0,
        favorites: 0,
      },
    },
  });
};

module.exports = {
  changePropertyStatus,
  createProperty,
  deleteProperty,
  getAdminPropertyStats,
  getFeaturedProperties,
  getMyProperties,
  getPropertyById,
  listProperties,
  updatePropertyLocation,
  updateProperty,
};
