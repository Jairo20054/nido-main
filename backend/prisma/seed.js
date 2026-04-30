const {
  PrismaClient,
  MediaType,
  PropertyStatus,
  PropertyType,
  RentalType,
  RequestStatus,
  UserRole,
} = require('@prisma/client');
const { randomBytes } = require('crypto');

const prisma = new PrismaClient();

// Replica la logica de slug del dominio y elimina acentos para mantener URLs limpias.
const slugify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

// Agrega un sufijo corto aleatorio para evitar colisiones entre seeds repetidos.
const slugWithSuffix = (value) => `${slugify(value)}-${randomBytes(3).toString('hex')}`;

// Banco de assets demo reutilizado por las propiedades sembradas.
const propertyAssets = {
  aptA: '/images/properties/apartment-a.svg',
  aptB: '/images/properties/apartment-b.svg',
  houseA: '/images/properties/house-a.svg',
  loftA: '/images/properties/loft-a.svg',
  studioA: '/images/properties/studio-a.svg',
  roomA: '/images/properties/room-a.svg',
};

// Reinicia el entorno demo y reconstruye un dataset coherente para frontend y panel admin.
async function main() {
  await prisma.favorite.deleteMany();
  await prisma.rentalRequest.deleteMany();
  await prisma.propertyApprovalHistory.deleteMany();
  await prisma.propertyMedia.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const [admin, landlord, tenant] = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Equipo',
        lastName: 'Nido',
        email: 'admin@nido.local',
        phone: '+57 300 000 0000',
        bio: 'Administrador del entorno demo.',
        role: UserRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Camila',
        lastName: 'Rojas',
        email: 'landlord@nido.local',
        phone: '+57 310 456 1881',
        bio: 'Arrendadora demo con propiedades enfocadas en estancias urbanas.',
        role: UserRole.LANDLORD,
      },
    }),
    prisma.user.create({
      data: {
        firstName: 'Mateo',
        lastName: 'Salazar',
        email: 'tenant@nido.local',
        phone: '+57 320 987 4112',
        bio: 'Usuario demo para solicitudes de arrendamiento y favoritos.',
        role: UserRole.TENANT,
      },
    }),
  ]);

  const rawProperties = [
    {
      title: 'Apartamento sereno cerca al Parque de la 93',
      summary: 'Espacio luminoso con sala integrada, cocina abierta y alcoba principal amplia.',
      description:
        'Apartamento sobrio y muy iluminado, ideal para quien busca vivir cerca de oficinas, restaurantes y zonas caminables sin sacrificar calma ni comodidad diaria.',
      propertyType: PropertyType.APARTMENT,
      rentalType: RentalType.FULL_HOME,
      status: PropertyStatus.PUBLISHED,
      city: 'Bogota',
      neighborhood: 'Chico Norte',
      addressLine: 'Carrera 13 #94-18',
      zoneReference: 'A dos cuadras del parque y restaurantes.',
      monthlyRent: 4200000,
      maintenanceFee: 580000,
      securityDeposit: 4200000,
      availableImmediately: false,
      availableFrom: new Date('2026-05-01'),
      areaM2: 84,
      bedrooms: 2,
      bathrooms: 2,
      floor: 8,
      parkingSpots: 1,
      strata: 6,
      maxOccupants: 3,
      furnished: true,
      petsAllowed: false,
      utilitiesIncluded: false,
      minLeaseMonths: 12,
      amenities: ['Porteria 24/7', 'Lavanderia', 'Balcon', 'Estudio', 'Parqueadero cubierto'],
      rules: 'No fiestas. Horario de ruido hasta las 10 pm.',
      requirements: 'Documento, ingresos demostrables y codeudor.',
      idealTenantProfile: 'Profesionales o pareja sin mascotas.',
      specialConditions: 'Contrato minimo de 12 meses.',
      contactMethod: 'Agenda visita por WhatsApp o formulario.',
      verificationDetails: 'Propiedad verificada por el equipo Nido.',
      media: [propertyAssets.aptA, propertyAssets.aptB, propertyAssets.loftA, propertyAssets.studioA],
    },
    {
      title: 'Casa amplia para familia en Cedritos',
      summary: 'Casa de tres niveles con patio interior, estudio independiente y almacenamiento amplio.',
      description:
        'Casa pensada para familias que buscan estabilidad, espacio interior y cercania a colegios, parques y servicios de barrio con buena movilidad.',
      propertyType: PropertyType.HOUSE,
      rentalType: RentalType.FULL_HOME,
      status: PropertyStatus.PENDING,
      city: 'Bogota',
      neighborhood: 'Cedritos',
      addressLine: 'Calle 147 #10-22',
      zoneReference: 'Sector residencial cerca a parques y colegios.',
      monthlyRent: 6800000,
      maintenanceFee: 0,
      securityDeposit: 6800000,
      availableImmediately: true,
      availableFrom: null,
      areaM2: 210,
      bedrooms: 4,
      bathrooms: 3,
      floor: 1,
      parkingSpots: 2,
      strata: 5,
      maxOccupants: 6,
      furnished: false,
      petsAllowed: true,
      utilitiesIncluded: false,
      minLeaseMonths: 12,
      amenities: ['Patio', 'Chimenea', 'Estudio', 'Deposito', 'Parqueadero doble'],
      rules: 'Mascotas con condiciones de convivencia.',
      requirements: 'Ingresos superiores a tres canones.',
      idealTenantProfile: 'Familia con estabilidad laboral.',
      specialConditions: 'Disponible para visitas desde ya.',
      contactMethod: 'Escribe por WhatsApp para coordinar.',
      verificationDetails: 'Documentacion del inmueble al dia.',
      media: [propertyAssets.houseA, propertyAssets.aptB, propertyAssets.aptA, propertyAssets.roomA],
    },
    {
      title: 'Loft minimalista en Chapinero Alto',
      summary: 'Loft con ventanales piso a techo, cocina integrada y acabados sobrios.',
      description:
        'Loft de lineas limpias con excelente luz natural. Es una opcion practica para profesionales que valoran diseno, ubicacion central y espacios flexibles.',
      propertyType: PropertyType.LOFT,
      rentalType: RentalType.FULL_HOME,
      status: PropertyStatus.APPROVED,
      city: 'Bogota',
      neighborhood: 'Chapinero Alto',
      addressLine: 'Calle 63 #4-11',
      zoneReference: 'Zona con cafes, coworkings y acceso rapido.',
      monthlyRent: 3200000,
      maintenanceFee: 410000,
      securityDeposit: 3200000,
      availableImmediately: false,
      availableFrom: new Date('2026-04-25'),
      areaM2: 62,
      bedrooms: 1,
      bathrooms: 1,
      floor: 7,
      parkingSpots: 1,
      strata: 4,
      maxOccupants: 2,
      furnished: true,
      petsAllowed: false,
      utilitiesIncluded: false,
      minLeaseMonths: 6,
      amenities: ['Coworking', 'Gimnasio', 'Lavanderia', 'Bicicletero'],
      rules: 'No subarriendos.',
      requirements: 'Soporte de ingresos y referencias.',
      idealTenantProfile: 'Profesional independiente o pareja.',
      specialConditions: 'Lista para publicar al activar.',
      contactMethod: 'Formulario y WhatsApp.',
      verificationDetails: 'Aprobada por administracion.',
      media: [propertyAssets.loftA, propertyAssets.studioA, propertyAssets.aptA, propertyAssets.aptB],
    },
    {
      title: 'Studio funcional para una persona en Laureles',
      summary: 'Studio compacto con iluminacion natural y acceso rapido a comercio local.',
      description:
        'Studio eficiente para quien prioriza ubicacion y practicidad. Tiene distribucion clara, buena luz natural y conexion rapida con el comercio del sector.',
      propertyType: PropertyType.STUDIO,
      rentalType: RentalType.FULL_HOME,
      status: PropertyStatus.REJECTED,
      city: 'Medellin',
      neighborhood: 'Laureles',
      addressLine: 'Circular 3 #70-16',
      zoneReference: 'Cerca a vias principales y comercio.',
      monthlyRent: 2500000,
      maintenanceFee: 280000,
      securityDeposit: 2500000,
      availableImmediately: false,
      availableFrom: new Date('2026-05-03'),
      areaM2: 38,
      bedrooms: 1,
      bathrooms: 1,
      floor: 4,
      parkingSpots: 0,
      strata: 5,
      maxOccupants: 1,
      furnished: true,
      petsAllowed: false,
      utilitiesIncluded: true,
      minLeaseMonths: 6,
      amenities: ['Internet', 'Amoblado', 'Porteria', 'Zona de ropas'],
      rules: 'Solo una persona.',
      requirements: 'Perfil con ingresos demostrables.',
      idealTenantProfile: 'Profesional en estancia individual.',
      specialConditions: 'Pendiente ajustar algunas fotos.',
      contactMethod: 'Aplicacion desde Nido.',
      verificationDetails: 'Falta actualizar una certificacion.',
      media: [propertyAssets.studioA, propertyAssets.roomA, propertyAssets.aptA, propertyAssets.loftA],
      rejectionReason: 'Faltan evidencias del reglamento del edificio.',
    },
    {
      title: 'Habitacion premium con bano privado en Envigado',
      summary: 'Habitacion dentro de apartamento compartido con acceso independiente y closet amplio.',
      description:
        'Habitacion dentro de apartamento compartido con reglas claras de convivencia, acceso independiente y una ubicacion bien conectada para estancias estables.',
      propertyType: PropertyType.ROOM,
      rentalType: RentalType.ROOM_ONLY,
      status: PropertyStatus.PUBLISHED,
      city: 'Envigado',
      neighborhood: 'Alcala',
      addressLine: 'Carrera 42B #35 Sur-44',
      zoneReference: 'Cerca a estacion de metro y comercio.',
      monthlyRent: 1450000,
      maintenanceFee: 120000,
      securityDeposit: 1450000,
      availableImmediately: true,
      availableFrom: null,
      areaM2: 18,
      bedrooms: 1,
      bathrooms: 1,
      floor: 10,
      parkingSpots: 0,
      strata: 4,
      maxOccupants: 1,
      furnished: true,
      petsAllowed: false,
      utilitiesIncluded: true,
      minLeaseMonths: 6,
      amenities: ['Bano privado', 'Servicios incluidos', 'Acceso a cocina', 'Aseo semanal'],
      rules: 'No fumadores y visitas limitadas.',
      requirements: 'Documento y referencias basicas.',
      idealTenantProfile: 'Persona sola con rutina tranquila.',
      specialConditions: 'Incluye limpieza de zonas comunes.',
      contactMethod: 'Aplicacion por la plataforma.',
      verificationDetails: 'Verificacion documental completada.',
      media: [propertyAssets.roomA, propertyAssets.aptA, propertyAssets.studioA, propertyAssets.aptB],
    },
    {
      title: 'Apartamento familiar con balcon en Pance',
      summary: 'Apartamento moderno con balcon amplio, cocina cerrada y zonas comunes tranquilas.',
      description:
        'Apartamento pensado para familias que valoran espacio, verde y acceso a vias principales. Ofrece un ambiente tranquilo y una distribucion muy funcional.',
      propertyType: PropertyType.APARTMENT,
      rentalType: RentalType.FULL_HOME,
      status: PropertyStatus.DRAFT,
      city: 'Cali',
      neighborhood: 'Pance',
      addressLine: 'Calle 18 #121-29',
      zoneReference: 'Conjunto tranquilo junto a vias principales.',
      monthlyRent: 3900000,
      maintenanceFee: 520000,
      securityDeposit: 3900000,
      availableImmediately: false,
      availableFrom: new Date('2026-06-01'),
      areaM2: 97,
      bedrooms: 3,
      bathrooms: 2,
      floor: 5,
      parkingSpots: 2,
      strata: 6,
      maxOccupants: 5,
      furnished: false,
      petsAllowed: true,
      utilitiesIncluded: false,
      minLeaseMonths: 12,
      amenities: ['Balcon', 'Piscina', 'Porteria', 'Zona infantil', 'Parqueadero doble'],
      rules: 'Reglamento interno del conjunto.',
      requirements: 'Aseguradora o codeudor.',
      idealTenantProfile: 'Familia o pareja con hijos.',
      specialConditions: 'Pendiente completar video de recorrido.',
      contactMethod: 'Contacto por formulario.',
      verificationDetails: 'En preparacion para envio.',
      media: [propertyAssets.aptB, propertyAssets.houseA, propertyAssets.aptA, propertyAssets.loftA],
    },
  ];

  const properties = [];

  // Persiste propiedades con su media inicial y deja trazabilidad editorial desde el origen.
  for (const item of rawProperties) {
    const property = await prisma.property.create({
      data: {
        slug: slugWithSuffix(`${item.title}-${item.city}`),
        ownerId: landlord.id,
        title: item.title,
        summary: item.summary,
        description: item.description,
        propertyType: item.propertyType,
        rentalType: item.rentalType,
        status: item.status,
        city: item.city,
        neighborhood: item.neighborhood,
        addressLine: item.addressLine,
        zoneReference: item.zoneReference,
        monthlyRent: item.monthlyRent,
        maintenanceFee: item.maintenanceFee,
        securityDeposit: item.securityDeposit,
        availableImmediately: item.availableImmediately,
        availableFrom: item.availableFrom,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        areaM2: item.areaM2,
        floor: item.floor,
        parkingSpots: item.parkingSpots,
        strata: item.strata,
        maxOccupants: item.maxOccupants,
        furnished: item.furnished,
        petsAllowed: item.petsAllowed,
        utilitiesIncluded: item.utilitiesIncluded,
        minLeaseMonths: item.minLeaseMonths,
        amenities: item.amenities,
        rules: item.rules,
        requirements: item.requirements,
        idealTenantProfile: item.idealTenantProfile,
        specialConditions: item.specialConditions,
        contactMethod: item.contactMethod,
        verificationDetails: item.verificationDetails,
        rejectionReason: item.rejectionReason || null,
        coverImage: item.media[0],
        approvedAt:
          item.status === PropertyStatus.APPROVED || item.status === PropertyStatus.PUBLISHED
            ? new Date('2026-04-18')
            : null,
        publishedAt: item.status === PropertyStatus.PUBLISHED ? new Date('2026-04-19') : null,
        media: {
          create: item.media.map((url, index) => ({
            type: MediaType.IMAGE,
            url,
            position: index,
            alt: item.title,
          })),
        },
      },
    });

    await prisma.propertyApprovalHistory.create({
      data: {
        propertyId: property.id,
        actorId: admin.id,
        fromStatus: null,
        toStatus: item.status,
        note:
          item.status === PropertyStatus.REJECTED
            ? item.rejectionReason
            : item.status === PropertyStatus.PENDING
              ? 'Pendiente de revision inicial'
              : 'Estado inicial de la demo',
      },
    });

    properties.push(property);
  }

  // Genera interacciones de ejemplo para poblar favoritos y solicitudes reales del dashboard.
  await prisma.favorite.createMany({
    data: [
      { userId: tenant.id, propertyId: properties[0].id },
      { userId: tenant.id, propertyId: properties[4].id },
    ],
  });

  await prisma.rentalRequest.create({
    data: {
      propertyId: properties[0].id,
      tenantId: tenant.id,
      landlordId: landlord.id,
      desiredMoveIn: new Date('2026-05-10'),
      leaseMonths: 12,
      occupants: 2,
      monthlyIncome: 9800000,
      hasPets: false,
      phone: tenant.phone,
      message:
        'Busco mudarme en mayo y me interesa una estancia estable. Tengo capacidad de respuesta y referencias laborales.',
      status: RequestStatus.PENDING,
    },
  });

  console.log('Seed completado.');
  console.log('Admin demo: admin@nido.local');
  console.log('Landlord demo: landlord@nido.local');
  console.log('Tenant demo: tenant@nido.local');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
