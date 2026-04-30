// ============================================================================
// EJEMPLO COMPLETO: MÓDULO DE PROPIEDADES CON SUPABASE
// ============================================================================
// Este archivo muestra cómo implementar un módulo CRUD completo usando Supabase
// en lugar de Prisma. Copia y adapta este código para tus controladores.

// ============================================================================
// IMPORTACIONES
// ============================================================================
const { supabaseAdmin, getUserData } = require('../../shared/supabase');
const { badRequest, forbidden, notFound } = require('../../shared/errors');
const { slugify } = require('../../shared/slugify');
const { serializeProperty } = require('../../shared/serializers');

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Generar slug único para la propiedad
 */
const generateSlug = async (title, city, propertyId = '') => {
  const base = slugify(`${title}-${city}`);
  const shortId = propertyId ? propertyId.slice(-6) : Date.now().toString(36);
  return `${base}-${shortId}`;
};

/**
 * Construir objeto de filtros WHERE para Supabase
 */
const buildWhere = (query) => {
  const filters = [];

  // Búsqueda por texto
  if (query.q) {
    filters.push(
      `or=(title.ilike.*${query.q}*,summary.ilike.*${query.q}*,city.ilike.*${query.q}*)`
    );
  }

  // Búsqueda por ciudad
  if (query.city) {
    filters.push(`city=ilike.*${query.city}*`);
  }

  // Búsqueda por tipo de propiedad
  if (query.propertyType) {
    filters.push(`propertyType=eq.${query.propertyType}`);
  }

  // Rango de precio
  if (query.minRent) {
    filters.push(`monthlyRent=gte.${query.minRent}`);
  }
  if (query.maxRent) {
    filters.push(`monthlyRent=lte.${query.maxRent}`);
  }

  // Filtro por dormitorios
  if (query.bedrooms) {
    filters.push(`bedrooms=gte.${query.bedrooms}`);
  }

  // Filtro por baños
  if (query.bathrooms) {
    filters.push(`bathrooms=gte.${query.bathrooms}`);
  }

  return filters.join(',');
};

/**
 * Determinar orden de resultados
 */
const buildOrderBy = (sort) => {
  switch (sort) {
    case 'rent-asc':
      return 'monthlyRent.asc,created_at.desc';
    case 'rent-desc':
      return 'monthlyRent.desc,created_at.desc';
    case 'latest':
      return 'created_at.desc';
    default:
      return 'created_at.desc';
  }
};

// ============================================================================
// CONTROLADORES
// ============================================================================

/**
 * CREAR una nueva propiedad (Protegido - Solo LANDLORD/ADMIN)
 * 
 * POST /api/properties
 * Body: { title, city, monthlyRent, ... }
 * Header: Authorization: Bearer <token>
 */
const createProperty = async (req, res) => {
  const {
    title,
    city,
    summary,
    description,
    propertyType,
    monthlyRent,
    bedrooms,
    bathrooms,
    furnished,
    petsAllowed,
    ...restData
  } = req.body;

  const userId = req.user.id;

  // ========================================================================
  // VALIDAR DATOS
  // ========================================================================
  if (!title || !city || !monthlyRent) {
    throw badRequest('title, city y monthlyRent son requeridos');
  }

  // ========================================================================
  // GENERAR SLUG ÚNICO
  // ========================================================================
  const slug = await generateSlug(title, city);

  // ========================================================================
  // INSERTAR EN SUPABASE
  // ========================================================================
  const { data, error } = await supabaseAdmin
    .from('properties')
    .insert([
      {
        ownerId: userId,
        slug,
        title,
        city,
        summary,
        description,
        propertyType,
        monthlyRent: parseFloat(monthlyRent),
        bedrooms: parseInt(bedrooms) || 0,
        bathrooms: parseInt(bathrooms) || 0,
        furnished: furnished === true || furnished === 'true',
        petsAllowed: petsAllowed === true || petsAllowed === 'true',
        status: 'DRAFT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...restData,
      },
    ])
    .select()
    .single();

  if (error) {
    throw badRequest(error.message);
  }

  res.status(201).json({
    success: true,
    message: 'Propiedad creada correctamente',
    data: serializeProperty(data, userId),
  });
};

/**
 * LISTAR propiedades con filtros y paginación (Público)
 * 
 * GET /api/properties?city=Madrid&minRent=500&maxRent=1000&page=1&limit=10
 */
const listProperties = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    sort = 'latest',
    ...filters
  } = req.query;

  const userId = req.user?.id || null;

  // ========================================================================
  // CALCULAR PAGINACIÓN
  // ========================================================================
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // ========================================================================
  // CONSTRUIR CONSULTA CON FILTROS
  // ========================================================================
  let query = supabaseAdmin
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('status', 'PUBLISHED');

  // Aplicar filtros
  if (filters.city) {
    query = query.ilike('city', `%${filters.city}%`);
  }
  if (filters.minRent) {
    query = query.gte('monthlyRent', parseFloat(filters.minRent));
  }
  if (filters.maxRent) {
    query = query.lte('monthlyRent', parseFloat(filters.maxRent));
  }
  if (filters.bedrooms) {
    query = query.gte('bedrooms', parseInt(filters.bedrooms));
  }

  // Aplicar ordenamiento
  const orderBy = buildOrderBy(sort);
  const [orderField, orderDirection] = orderBy.split('.');
  query = query.order(orderField, { ascending: orderDirection === 'asc' });

  // Aplicar paginación
  query = query.range(skip, skip + parseInt(limit) - 1);

  // ========================================================================
  // EJECUTAR CONSULTA
  // ========================================================================
  const { data, error, count } = await query;

  if (error) {
    throw badRequest(error.message);
  }

  res.json({
    success: true,
    data: data.map((property) => serializeProperty(property, userId)),
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      pages: Math.ceil(count / parseInt(limit)),
    },
  });
};

/**
 * OBTENER DETALLE de una propiedad por ID (Público para publicadas)
 * 
 * GET /api/properties/:id
 */
const getPropertyById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || null;

  // ========================================================================
  // OBTENER PROPIEDAD
  // ========================================================================
  const { data: property, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !property) {
    throw notFound('La propiedad no existe');
  }

  // ========================================================================
  // VALIDAR PERMISOS
  // ========================================================================
  // Solo el propietario puede ver propiedades no publicadas
  const isOwner = userId === property.ownerId;
  if (!isOwner && property.status !== 'PUBLISHED') {
    throw notFound('La propiedad no existe');
  }

  res.json({
    success: true,
    data: serializeProperty(property, userId),
  });
};

/**
 * OBTENER propiedades del usuario autenticado (Protegido)
 * 
 * GET /api/properties/my-properties
 * Header: Authorization: Bearer <token>
 */
const getMyProperties = async (req, res) => {
  const userId = req.user.id;

  // ========================================================================
  // OBTENER TODAS LAS PROPIEDADES DEL USUARIO
  // ========================================================================
  const { data, error } = await supabaseAdmin
    .from('properties')
    .select('*')
    .eq('ownerId', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw badRequest(error.message);
  }

  res.json({
    success: true,
    data: data.map((property) => serializeProperty(property, userId)),
  });
};

/**
 * ACTUALIZAR una propiedad (Protegido - Solo propietario)
 * 
 * PUT /api/properties/:id
 * Body: { title, city, monthlyRent, ... }
 * Header: Authorization: Bearer <token>
 */
const updateProperty = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const updates = req.body;

  // ========================================================================
  // VALIDAR QUE EXISTE LA PROPIEDAD Y QUE ES DEL USUARIO
  // ========================================================================
  const { data: property, error: fetchError } = await supabaseAdmin
    .from('properties')
    .select('ownerId')
    .eq('id', id)
    .single();

  if (fetchError || !property) {
    throw notFound('La propiedad no existe');
  }

  if (property.ownerId !== userId) {
    throw forbidden('No tienes permiso para actualizar esta propiedad');
  }

  // ========================================================================
  // ACTUALIZAR PROPIEDAD
  // ========================================================================
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  // Convertir tipos de datos si es necesario
  if (updates.monthlyRent) {
    updateData.monthlyRent = parseFloat(updates.monthlyRent);
  }
  if (updates.bedrooms) {
    updateData.bedrooms = parseInt(updates.bedrooms);
  }

  const { data, error } = await supabaseAdmin
    .from('properties')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw badRequest(error.message);
  }

  res.json({
    success: true,
    message: 'Propiedad actualizada correctamente',
    data: serializeProperty(data, userId),
  });
};

/**
 * ELIMINAR una propiedad (Protegido - Solo propietario)
 * 
 * DELETE /api/properties/:id
 * Header: Authorization: Bearer <token>
 */
const deleteProperty = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  // ========================================================================
  // VALIDAR QUE EXISTE Y PERMISOS
  // ========================================================================
  const { data: property, error: fetchError } = await supabaseAdmin
    .from('properties')
    .select('ownerId')
    .eq('id', id)
    .single();

  if (fetchError || !property) {
    throw notFound('La propiedad no existe');
  }

  if (property.ownerId !== userId) {
    throw forbidden('No tienes permiso para eliminar esta propiedad');
  }

  // ========================================================================
  // VERIFICAR QUE NO TIENE SOLICITUDES ACTIVAS
  // ========================================================================
  const { data: requests } = await supabaseAdmin
    .from('rentalRequests')
    .select('id', { count: 'exact' })
    .eq('propertyId', id)
    .in('status', ['PENDING', 'APPROVED']);

  if (requests && requests.length > 0) {
    throw badRequest('No puedes eliminar una propiedad con solicitudes activas');
  }

  // ========================================================================
  // ELIMINAR PROPIEDAD
  // ========================================================================
  const { error } = await supabaseAdmin
    .from('properties')
    .delete()
    .eq('id', id);

  if (error) {
    throw badRequest(error.message);
  }

  res.json({
    success: true,
    message: 'Propiedad eliminada correctamente',
  });
};

// ============================================================================
// EXPORTACIÓN
// ============================================================================
module.exports = {
  createProperty,
  listProperties,
  getPropertyById,
  getMyProperties,
  updateProperty,
  deleteProperty,
};
