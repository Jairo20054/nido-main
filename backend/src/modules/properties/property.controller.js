// ============================================================================
// IMPORTACIONES
// ============================================================================
// PropertyStatus: Enum con los estados posibles de una propiedad (DRAFT, PUBLISHED, RENTED, ARCHIVED)
const { PropertyStatus } = require('@prisma/client');

// prisma: Cliente ORM para interactuar con la base de datos
const { prisma } = require('../../shared/prisma');

// Funciones para manejar errores HTTP personalizados
const { badRequest, forbidden, notFound } = require('../../shared/errors');

// Utilidad para generar URLs amigables (slugs) a partir de texto
const { slugify } = require('../../shared/slugify');

// Función para serializar propiedades antes de enviarlas al cliente
const { serializeProperty } = require('../../shared/serializers');

// ============================================================================
// CONFIGURACIÓN DE RELACIONES Y CAMPOS A INCLUIR
// ============================================================================
// Esta función retorna un objeto de configuración que especifica qué relaciones
// y campos adicionales incluir cuando se obtiene una propiedad de la base de datos.
// Adapta los datos según si el usuario está autenticado o no.
const propertyInclude = (currentUserId) => ({
  // Incluir los datos del propietario (dueño) de la propiedad
  owner: true,
  
  // Incluir todas las imágenes asociadas a la propiedad
  images: true,
  
  // Si el usuario está autenticado, incluir solo los favoritos del usuario actual
  // Si no está autenticado, excluir los favoritos (false)
  favorites: currentUserId
    ? {
        where: {
          userId: currentUserId,
        },
      }
    : false,
  
  // Incluir conteos de datos relacionados
  _count: {
    select: {
      // Contar el número de solicitudes de arrendamiento para esta propiedad
      rentalRequests: true,
    },
  },
});

// ============================================================================
// CONSTRUCTOR DE FILTROS DE BÚSQUEDA
// ============================================================================
// Esta función construye un objeto de filtro (where) para Prisma basado en
// los parámetros de búsqueda proporcionados en la query string.
const buildWhere = (query) => {
  // Inicializar con el filtro base: solo propiedades publicadas
  const where = {
    status: PropertyStatus.PUBLISHED,
  };

  // FILTRO 1: BÚSQUEDA DE TEXTO
  // Si el usuario proporciona un término de búsqueda (q), buscar en múltiples campos
  if (query.q) {
    where.OR = [
      { title: { contains: query.q, mode: 'insensitive' } },
      { summary: { contains: query.q, mode: 'insensitive' } },
      { neighborhood: { contains: query.q, mode: 'insensitive' } },
      { city: { contains: query.q, mode: 'insensitive' } },
    ];
  }

  // FILTRO 2: BÚSQUEDA POR CIUDAD
  if (query.city) {
    where.city = {
      contains: query.city,
      mode: 'insensitive',
    };
  }

  // FILTRO 3: TIPO DE PROPIEDAD
  // Filtrar por tipo específico (APARTMENT, HOUSE, STUDIO, etc.)
  if (query.propertyType) {
    where.propertyType = query.propertyType;
  }

  // FILTRO 4: RANGO DE PRECIO DE RENTA MENSUAL
  // Buscar propiedades dentro del rango de precio especificado
  if (query.minRent || query.maxRent) {
    where.monthlyRent = {};
    if (query.minRent) {
      where.monthlyRent.gte = query.minRent; // gte = mayor o igual (greater than or equal)
    }
    if (query.maxRent) {
      where.monthlyRent.lte = query.maxRent; // lte = menor o igual (less than or equal)
    }
  }

  // FILTRO 5: NÚMERO MÍNIMO DE DORMITORIOS
  if (query.bedrooms !== undefined) {
    where.bedrooms = { gte: query.bedrooms };
  }

  // FILTRO 6: NÚMERO MÍNIMO DE BAÑOS
  if (query.bathrooms !== undefined) {
    where.bathrooms = { gte: query.bathrooms };
  }

  // FILTRO 7: AMUEBLAMIENTO
  // Filtrar solo propiedades amuebladas o sin amueblar
  if (query.furnished !== undefined) {
    where.furnished = query.furnished;
  }

  // FILTRO 8: MASCOTAS PERMITIDAS
  // Filtrar propiedades que permitan o no mascotas
  if (query.petsAllowed !== undefined) {
    where.petsAllowed = query.petsAllowed;
  }

  // FILTRO 9: DURACIÓN MÍNIMA DEL ARRENDAMIENTO
  // Buscar propiedades que acepten contratos más cortos que el especificado
  if (query.minLeaseMonths) {
    where.minLeaseMonths = { lte: query.minLeaseMonths };
  }

  // FILTRO 10: FECHA DE DISPONIBILIDAD
  // Buscar propiedades disponibles antes o en la fecha especificada
  if (query.availableFrom) {
    where.availableFrom = { lte: query.availableFrom };
  }

  return where;
};

// ============================================================================
// CONSTRUCTOR DE ORDEN DE RESULTADOS
// ============================================================================
// Esta función determina el criterio de ordenamiento (sorting) para los
// resultados de búsqueda basándose en el parámetro 'sort' proporcionado.
const buildOrderBy = (sort) => {
  switch (sort) {
    // Ordenar de precio menor a mayor, con las más recientes primero como desempate
    case 'rent-asc':
      return [{ monthlyRent: 'asc' }, { createdAt: 'desc' }];
    
    // Ordenar de precio mayor a menor, con las más recientes primero como desempate
    case 'rent-desc':
      return [{ monthlyRent: 'desc' }, { createdAt: 'desc' }];
    
    // Ordenar por fecha de creación más reciente primero
    case 'latest':
      return [{ createdAt: 'desc' }];
    
    // Por defecto, mostrar las propiedades más recientes primero
    default:
      return [{ createdAt: 'desc' }];
  }
};

// ============================================================================
// NORMALIZACIÓN DE DATOS DE ENTRADA DE PROPIEDAD
// ============================================================================
// Esta función procesa y normaliza los datos recibidos del cliente para
// asegurar que tengan el formato correcto y valores por defecto apropiados
// antes de ser guardados en la base de datos.
const normalizePropertyInput = (payload) => ({
  // Mantener todos los datos existentes y agregarlos normalizados
  ...payload,
  
  // Si no se proporciona barrio (neighborhood), usar null
  neighborhood: payload.neighborhood || null,
  
  // Usar la primera imagen como portada, o null si no hay imágenes
  coverImage: payload.images?.[0] || null,
  
  // Usar latitud proporcionada o null. El operador ?? solo usa el null literal,
  // permitiendo 0 como valor válido (a diferencia de || que considera 0 como falso)
  latitude: payload.latitude ?? null,
  
  // Usar longitud proporcionada o null
  longitude: payload.longitude ?? null,
});

// ============================================================================
// GENERACIÓN DE SLUG ÚNICO PARA PROPIEDAD
// ============================================================================
// Un slug es un identificador amigable para URLs (ej: "apartamento-moderno-santiago-abc123")
// Esta función combina el título, ciudad e ID para crear un slug único y descriptivo.
const generateSlug = async (title, city, propertyId = '') => {
  // Convertir título y ciudad a formato slug (minúsculas, sin caracteres especiales)
  const base = slugify(`${title}-${city}`);
  
  // Si existe un ID de propiedad, usar los últimos 6 caracteres
  // Si no, usar la fecha/hora actual en formato reducido
  // Esto asegura unicidad incluso si hay títulos duplicados
  const shortId = propertyId ? propertyId.slice(-6) : Date.now().toString(36);
  
  // Combinar base + identificador corto para crear slug único
  return `${base}-${shortId}`;
};

// ============================================================================
// CONTROLADOR: LISTAR PROPIEDADES CON FILTROS Y PAGINACIÓN
// ============================================================================
// Obtiene una lista paginada de propiedades publicadas aplicando filtros
// de búsqueda, ordenamiento y paginación.
const listProperties = async (req, res) => {
  // Desestructurar parámetros de consulta: page, limit para paginación
  // El resto de parámetros son filtros de búsqueda
  const { page, limit, sort, ...filters } = req.query;
  
  // Calcular el desplazamiento (offset) para la paginación
  // Ej: página 1 = skip 0, página 2 = skip 10 (si limit es 10)
  const skip = (page - 1) * limit;
  
  // Obtener ID del usuario autenticado, o null si no está autenticado
  const currentUserId = req.user?.id || null;

  // Construir el objeto de filtro basado en los parámetros de búsqueda
  const where = buildWhere(filters);
  
  // Ejecutar dos consultas en paralelo usando Promise.all:
  // 1. Obtener las propiedades paginadas con filtros
  // 2. Contar el número total de propiedades que coinciden con los filtros
  const [items, total] = await Promise.all([
    prisma.property.findMany({
      where,
      include: propertyInclude(currentUserId), // Incluir relaciones
      orderBy: buildOrderBy(sort),              // Aplicar ordenamiento
      skip,                                      // Saltar registros para paginación
      take: limit,                               // Limitar número de registros
    }),
    prisma.property.count({ where }),           // Contar total sin paginación
  ]);

  // Enviar respuesta con datos paginados y metadatos
  res.json({
    success: true,
    data: items.map((property) => serializeProperty(property, currentUserId)),
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit), // Calcular número total de páginas
    },
  });
};

// ============================================================================
// CONTROLADOR: OBTENER PROPIEDADES DESTACADAS
// ============================================================================
// Retorna las 4 propiedades más recientes publicadas para mostrar en
// la página de inicio. Este es el endpoint donde ocurría el error original.
const getFeaturedProperties = async (req, res) => {
  // Obtener ID del usuario actual para personalizar favoritos
  const currentUserId = req.user?.id || null;
  
  // AQUÍ OCURRÍA EL ERROR ORIGINAL:
  // ❌ Error: Environment variable not found: DATABASE_URL
  // Cause: El archivo .env no estaba en la ruta correcta para dotenv
  // Solution: Mover .env a la raíz del proyecto y configurar la ruta en env.js
  
  // Obtener las 4 propiedades publicadas más recientes
  const items = await prisma.property.findMany({
    where: {
      status: PropertyStatus.PUBLISHED, // Solo propiedades publicadas
    },
    include: propertyInclude(currentUserId), // Incluir relaciones
    orderBy: [{ createdAt: 'desc' }],        // Más recientes primero
    take: 4,                                   // Límite de 4 propiedades
  });

  // Serializar los datos y enviar respuesta
  res.json({
    success: true,
    data: items.map((property) => serializeProperty(property, currentUserId)),
  });
};

// ============================================================================
// CONTROLADOR: OBTENER PROPIEDADES DEL USUARIO AUTENTICADO
// ============================================================================
// Retorna todas las propiedades (en cualquier estado) pertenecientes al usuario
// autenticado. Solo el propietario puede ver sus propias propiedades no publicadas.
const getMyProperties = async (req, res) => {
  // Obtener todas las propiedades del usuario (independiente del estado)
  const items = await prisma.property.findMany({
    where: {
      ownerId: req.user.id, // Filtrar solo propiedades del usuario autenticado
    },
    include: propertyInclude(req.user.id),  // Incluir relaciones
    orderBy: [{ updatedAt: 'desc' }],       // Ordenar por fecha de actualización
  });

  res.json({
    success: true,
    data: items.map((property) => serializeProperty(property, req.user.id)),
  });
};

// ============================================================================
// CONTROLADOR: OBTENER DETALLE DE UNA PROPIEDAD POR ID
// ============================================================================
// Retorna los detalles completos de una propiedad específica.
// Las propiedades no publicadas solo pueden ser vistas por su propietario.
const getPropertyById = async (req, res) => {
  // Buscar la propiedad por su ID único
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
    include: propertyInclude(req.user?.id || null),
  });

  // Si la propiedad no existe, lanzar error 404
  if (!property) {
    throw notFound('La propiedad no existe');
  }

  // Verificar si el usuario autenticado es el propietario
  const isOwner = req.user?.id === property.ownerId;

  // Si no es el propietario y la propiedad no está publicada, denegar acceso
  if (!isOwner && property.status !== PropertyStatus.PUBLISHED) {
    throw notFound('La propiedad no esta disponible');
  }

  res.json({
    success: true,
    data: serializeProperty(property, req.user?.id || null),
  });
};

// ============================================================================
// CONTROLADOR: CREAR NUEVA PROPIEDAD
// ============================================================================
// Permite a un usuario crear una nueva propiedad. Si el usuario es un TENANT,
// se le cambiaría automáticamente a LANDLORD (aunque esto podría no ser ideal UX).
const createProperty = async (req, res) => {
  // Normalizar los datos de entrada para asegurar consistencia
  const payload = normalizePropertyInput(req.body);
  
  // Generar un slug único basado en el título y ciudad
  const slug = await generateSlug(payload.title, payload.city);

  // Crear la propiedad en la base de datos con todos sus datos
  const property = await prisma.property.create({
    data: {
      slug,                          // Identificador URL amigable
      ownerId: req.user.id,         // El usuario actual es el propietario
      title: payload.title,          // Título de la propiedad
      summary: payload.summary,      // Resumen breve
      description: payload.description, // Descripción detallada
      propertyType: payload.propertyType, // Tipo (APARTMENT, HOUSE, etc.)
      status: payload.status,        // Estado inicial (usualmente DRAFT)
      city: payload.city,            // Ciudad
      neighborhood: payload.neighborhood, // Barrio/Vecindario
      addressLine: payload.addressLine, // Dirección completa
      monthlyRent: payload.monthlyRent, // Renta mensual
      maintenanceFee: payload.maintenanceFee, // Cuota de mantenimiento
      securityDeposit: payload.securityDeposit, // Depósito de seguridad
      bedrooms: payload.bedrooms,    // Número de dormitorios
      bathrooms: payload.bathrooms,  // Número de baños
      areaM2: payload.areaM2,        // Área en metros cuadrados
      parkingSpots: payload.parkingSpots, // Lugares de estacionamiento
      maxOccupants: payload.maxOccupants, // Número máximo de ocupantes
      furnished: payload.furnished,  // ¿Está amueblada?
      petsAllowed: payload.petsAllowed, // ¿Se permiten mascotas?
      availableFrom: payload.availableFrom, // Fecha de disponibilidad
      minLeaseMonths: payload.minLeaseMonths, // Duración mínima del contrato
      amenities: payload.amenities,  // Lista de amenidades (JSON)
      coverImage: payload.coverImage, // Imagen de portada
      latitude: payload.latitude,    // Coordenada de latitud para mapa
      longitude: payload.longitude,  // Coordenada de longitud para mapa
      
      // Crear imágenes asociadas a la propiedad
      images: {
        create: (payload.images || []).map((url, index) => ({
          url,                       // URL de la imagen
          position: index,           // Posición en la galería
          alt: payload.title,        // Texto alternativo para accesibilidad
        })),
      },
    },
    include: propertyInclude(req.user.id), // Incluir relaciones en respuesta
  });

  // Si el usuario era un TENANT, promoverlo a LANDLORD
  if (req.user.role === 'TENANT') {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { role: 'LANDLORD' },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Propiedad creada',
    data: serializeProperty(property, req.user.id),
  });
};

// ============================================================================
// CONTROLADOR: ACTUALIZAR PROPIEDAD EXISTENTE
// ============================================================================
// Permite al propietario actualizar los datos de una propiedad existente.
// Solo el propietario puede modificar sus propiedades.
const updateProperty = async (req, res) => {
  // Buscar la propiedad existente para verificar permisos y datos actuales
  const existing = await prisma.property.findUnique({
    where: { id: req.params.id },
  });

  // Si la propiedad no existe, lanzar error 404
  if (!existing) {
    throw notFound('La propiedad no existe');
  }

  // Verificar que solo el propietario puede actualizar
  if (existing.ownerId !== req.user.id) {
    throw forbidden(); // Retorna error 403 Forbidden
  }

  // Normalizar los datos de entrada, combinando datos existentes con nuevos
  // Esto asegura que los campos no incluidos en la solicitud mantengan sus valores
  const payload = normalizePropertyInput({
    ...existing,
    ...req.body,
    images: req.body.images || null, // Las imágenes se manejan por separado
  });

  // Determinar cómo actualizar las imágenes
  // Si se proporcionan nuevas imágenes, eliminar las antiguas y crear nuevas
  const imageMutation = req.body.images
    ? {
        deleteMany: {},  // Eliminar todas las imágenes anteriores
        create: req.body.images.map((url, index) => ({
          url,
          position: index,
          alt: payload.title,
        })),
      }
    : undefined; // Si no hay nuevas imágenes, no cambiar las existentes

  // Actualizar la propiedad en la base de datos
  const property = await prisma.property.update({
    where: { id: req.params.id },
    data: {
      title: payload.title,
      summary: payload.summary,
      description: payload.description,
      propertyType: payload.propertyType,
      status: payload.status,
      city: payload.city,
      neighborhood: payload.neighborhood,
      addressLine: payload.addressLine,
      monthlyRent: payload.monthlyRent,
      maintenanceFee: payload.maintenanceFee,
      securityDeposit: payload.securityDeposit,
      bedrooms: payload.bedrooms,
      bathrooms: payload.bathrooms,
      areaM2: payload.areaM2,
      parkingSpots: payload.parkingSpots,
      maxOccupants: payload.maxOccupants,
      furnished: payload.furnished,
      petsAllowed: payload.petsAllowed,
      availableFrom: payload.availableFrom,
      minLeaseMonths: payload.minLeaseMonths,
      amenities: payload.amenities,
      // Actualizar portada: usar primera imagen nueva o mantener la actual
      coverImage: req.body.images ? req.body.images[0] || null : existing.coverImage,
      latitude: payload.latitude,
      longitude: payload.longitude,
      images: imageMutation, // Aplicar los cambios de imágenes si los hay
    },
    include: propertyInclude(req.user.id),
  });

  res.json({
    success: true,
    message: 'Propiedad actualizada',
    data: serializeProperty(property, req.user.id),
  });
};

// ============================================================================
// CONTROLADOR: ELIMINAR PROPIEDAD
// ============================================================================
// Permite al propietario eliminar una propiedad. Solo se puede eliminar si no
// tiene solicitudes de arrendamiento activas (PENDING o APPROVED).
const deleteProperty = async (req, res) => {
  // Buscar la propiedad a eliminar
  const property = await prisma.property.findUnique({
    where: { id: req.params.id },
  });

  // Si la propiedad no existe, lanzar error 404
  if (!property) {
    throw notFound('La propiedad no existe');
  }

  // Verificar que solo el propietario puede eliminar
  if (property.ownerId !== req.user.id) {
    throw forbidden(); // Retorna error 403 Forbidden
  }

  // Contar solicitudes de arrendamiento activas (PENDING o APPROVED)
  // No se puede eliminar una propiedad si hay solicitudes activas
  const activeRequests = await prisma.rentalRequest.count({
    where: {
      propertyId: property.id,
      status: {
        in: ['PENDING', 'APPROVED'],
      },
    },
  });

  // Si hay solicitudes activas, denegar la eliminación
  if (activeRequests > 0) {
    throw badRequest('No puedes eliminar una propiedad con solicitudes activas');
  }

  // Eliminar la propiedad y todas sus relaciones cascada (imágenes, favoritos, etc.)
  await prisma.property.delete({
    where: { id: req.params.id },
  });

  res.json({
    success: true,
    message: 'Propiedad eliminada',
  });
};

// ============================================================================
// EXPORTACIÓN DE CONTROLADORES
// ============================================================================
// Exportar todos los controladores para que puedan ser importados en las rutas
module.exports = {
  createProperty,
  deleteProperty,
  getFeaturedProperties,
  getMyProperties,
  getPropertyById,
  listProperties,
  updateProperty,
};
