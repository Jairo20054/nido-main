const bcrypt = require('bcryptjs');
const { PrismaClient, PropertyStatus, PropertyType, RequestStatus, UserRole } = require('@prisma/client');
const { randomBytes } = require('crypto');

const prisma = new PrismaClient();

const slugify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const slugWithSuffix = (value) => `${slugify(value)}-${randomBytes(3).toString('hex')}`;

const propertyAssets = {
  aptA: '/images/properties/apartment-a.svg',
  aptB: '/images/properties/apartment-b.svg',
  houseA: '/images/properties/house-a.svg',
  loftA: '/images/properties/loft-a.svg',
  studioA: '/images/properties/studio-a.svg',
  roomA: '/images/properties/room-a.svg',
};

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.rentalRequest.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Nido1234*', 10);

  const [admin, landlord, tenant] = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'Equipo',
        lastName: 'Nido',
        email: 'admin@nido.local',
        passwordHash,
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
        passwordHash,
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
        passwordHash,
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
      city: 'Bogota',
      neighborhood: 'Chico Norte',
      addressLine: 'Carrera 13 #94-18',
      monthlyRent: 4200000,
      maintenanceFee: 580000,
      securityDeposit: 4200000,
      areaM2: 84,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpots: 1,
      maxOccupants: 3,
      furnished: true,
      petsAllowed: false,
      availableFrom: new Date('2026-05-01'),
      minLeaseMonths: 12,
      amenities: ['Porteria 24/7', 'Lavanderia', 'Balcon', 'Estudio', 'Parqueadero cubierto'],
      coverImage: propertyAssets.aptA,
      images: [propertyAssets.aptA, propertyAssets.aptB],
    },
    {
      title: 'Casa amplia para familia en Cedritos',
      summary: 'Casa de tres niveles con patio interior, estudio independiente y almacenamiento amplio.',
      description:
        'Casa pensada para familias que buscan estabilidad, espacio interior y cercania a colegios, parques y servicios de barrio con buena movilidad.',
      propertyType: PropertyType.HOUSE,
      city: 'Bogota',
      neighborhood: 'Cedritos',
      addressLine: 'Calle 147 #10-22',
      monthlyRent: 6800000,
      maintenanceFee: 0,
      securityDeposit: 6800000,
      areaM2: 210,
      bedrooms: 4,
      bathrooms: 3,
      parkingSpots: 2,
      maxOccupants: 6,
      furnished: false,
      petsAllowed: true,
      availableFrom: new Date('2026-05-15'),
      minLeaseMonths: 12,
      amenities: ['Patio', 'Chimenea', 'Estudio', 'Deposito', 'Parqueadero doble'],
      coverImage: propertyAssets.houseA,
      images: [propertyAssets.houseA, propertyAssets.aptB],
    },
    {
      title: 'Loft minimalista en Chapinero Alto',
      summary: 'Loft con ventanales piso a techo, cocina integrada y acabados sobrios.',
      description:
        'Loft de lineas limpias con excelente luz natural. Es una opcion practica para profesionales que valoran diseno, ubicacion central y espacios flexibles.',
      propertyType: PropertyType.LOFT,
      city: 'Bogota',
      neighborhood: 'Chapinero Alto',
      addressLine: 'Calle 63 #4-11',
      monthlyRent: 3200000,
      maintenanceFee: 410000,
      securityDeposit: 3200000,
      areaM2: 62,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 1,
      maxOccupants: 2,
      furnished: true,
      petsAllowed: false,
      availableFrom: new Date('2026-04-25'),
      minLeaseMonths: 6,
      amenities: ['Coworking', 'Gimnasio', 'Lavanderia', 'Bicicletero'],
      coverImage: propertyAssets.loftA,
      images: [propertyAssets.loftA, propertyAssets.studioA],
    },
    {
      title: 'Studio funcional para una persona en Laureles',
      summary: 'Studio compacto con iluminacion natural y acceso rapido a comercio local.',
      description:
        'Studio eficiente para quien prioriza ubicacion y practicidad. Tiene distribucion clara, buena luz natural y conexion rapida con el comercio del sector.',
      propertyType: PropertyType.STUDIO,
      city: 'Medellin',
      neighborhood: 'Laureles',
      addressLine: 'Circular 3 #70-16',
      monthlyRent: 2500000,
      maintenanceFee: 280000,
      securityDeposit: 2500000,
      areaM2: 38,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      maxOccupants: 1,
      furnished: true,
      petsAllowed: false,
      availableFrom: new Date('2026-05-03'),
      minLeaseMonths: 6,
      amenities: ['Internet', 'Amoblado', 'Porteria', 'Zona de ropas'],
      coverImage: propertyAssets.studioA,
      images: [propertyAssets.studioA, propertyAssets.roomA],
    },
    {
      title: 'Habitacion premium con bano privado en Envigado',
      summary: 'Habitacion dentro de apartamento compartido con acceso independiente y closet amplio.',
      description:
        'Habitacion dentro de apartamento compartido con reglas claras de convivencia, acceso independiente y una ubicacion bien conectada para estancias estables.',
      propertyType: PropertyType.ROOM,
      city: 'Envigado',
      neighborhood: 'Alcala',
      addressLine: 'Carrera 42B #35 Sur-44',
      monthlyRent: 1450000,
      maintenanceFee: 120000,
      securityDeposit: 1450000,
      areaM2: 18,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      maxOccupants: 1,
      furnished: true,
      petsAllowed: false,
      availableFrom: new Date('2026-04-30'),
      minLeaseMonths: 6,
      amenities: ['Bano privado', 'Servicios incluidos', 'Acceso a cocina', 'Aseo semanal'],
      coverImage: propertyAssets.roomA,
      images: [propertyAssets.roomA, propertyAssets.aptA],
    },
    {
      title: 'Apartamento familiar con balcon en Pance',
      summary: 'Apartamento moderno con balcon amplio, cocina cerrada y zonas comunes tranquilas.',
      description:
        'Apartamento pensado para familias que valoran espacio, verde y acceso a vias principales. Ofrece un ambiente tranquilo y una distribucion muy funcional.',
      propertyType: PropertyType.APARTMENT,
      city: 'Cali',
      neighborhood: 'Pance',
      addressLine: 'Calle 18 #121-29',
      monthlyRent: 3900000,
      maintenanceFee: 520000,
      securityDeposit: 3900000,
      areaM2: 97,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpots: 2,
      maxOccupants: 5,
      furnished: false,
      petsAllowed: true,
      availableFrom: new Date('2026-06-01'),
      minLeaseMonths: 12,
      amenities: ['Balcon', 'Piscina', 'Porteria', 'Zona infantil', 'Parqueadero doble'],
      coverImage: propertyAssets.aptB,
      images: [propertyAssets.aptB, propertyAssets.houseA],
    },
  ];

  const properties = [];

  for (const item of rawProperties) {
    const property = await prisma.property.create({
      data: {
        slug: slugWithSuffix(`${item.title}-${item.city}`),
        ownerId: landlord.id,
        title: item.title,
        summary: item.summary,
        description: item.description,
        propertyType: item.propertyType,
        status: PropertyStatus.PUBLISHED,
        city: item.city,
        neighborhood: item.neighborhood,
        addressLine: item.addressLine,
        monthlyRent: item.monthlyRent,
        maintenanceFee: item.maintenanceFee,
        securityDeposit: item.securityDeposit,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        areaM2: item.areaM2,
        parkingSpots: item.parkingSpots,
        maxOccupants: item.maxOccupants,
        furnished: item.furnished,
        petsAllowed: item.petsAllowed,
        availableFrom: item.availableFrom,
        minLeaseMonths: item.minLeaseMonths,
        amenities: item.amenities,
        coverImage: item.coverImage,
        images: {
          create: item.images.map((url, index) => ({
            url,
            position: index,
            alt: item.title,
          })),
        },
      },
    });

    properties.push(property);
  }

  await prisma.favorite.createMany({
    data: [
      { userId: tenant.id, propertyId: properties[0].id },
      { userId: tenant.id, propertyId: properties[2].id },
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
  console.log('Admin demo: admin@nido.local / Nido1234*');
  console.log('Landlord demo: landlord@nido.local / Nido1234*');
  console.log('Tenant demo: tenant@nido.local / Nido1234*');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
