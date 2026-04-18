const bcrypt = require('bcryptjs');
const { PrismaClient, UserRole, PropertyType, PropertyStatus, RentalRequestStatus } = require('@prisma/client');

const prisma = new PrismaClient();

const slugify = (value) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const propertyAssets = {
  aptA: '/images/properties/apartment-a.svg',
  aptB: '/images/properties/apartment-b.svg',
  houseA: '/images/properties/house-a.svg',
  loftA: '/images/properties/loft-a.svg',
  studioA: '/images/properties/studio-a.svg',
  roomA: '/images/properties/room-a.svg'
};

async function main() {
  await prisma.favorite.deleteMany();
  await prisma.rentalRequest.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Nido1234*', 10);

  const [admin, host, tenant] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Equipo Nido',
        email: 'admin@nido.local',
        passwordHash,
        role: UserRole.ADMIN,
        city: 'Bogota',
        phone: '+57 300 000 0000',
        bio: 'Administrador del entorno demo.'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Camila Rojas',
        email: 'host@nido.local',
        passwordHash,
        role: UserRole.HOST,
        city: 'Bogota',
        phone: '+57 310 456 1881',
        bio: 'Anfitriona con propiedades enfocadas en arrendamiento urbano de larga estancia.'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Mateo Salazar',
        email: 'tenant@nido.local',
        passwordHash,
        role: UserRole.TENANT,
        city: 'Bogota',
        phone: '+57 320 987 4112',
        bio: 'Usuario demo para solicitudes de arrendamiento y favoritos.'
      }
    })
  ]);

  const rawProperties = [
    {
      title: 'Apartamento sereno cerca al Parque de la 93',
      description: 'Espacio sobrio y muy luminoso con sala integrada, cocina abierta y alcoba principal amplia. Ideal para quien busca vivir cerca de oficinas, restaurantes y zonas caminables sin sacrificar calma.',
      propertyType: PropertyType.APARTMENT,
      city: 'Bogota',
      neighborhood: 'Chico Norte',
      address: 'Carrera 13 #94-18',
      monthlyRent: 4200000,
      adminFee: 580000,
      deposit: 4200000,
      areaM2: 84,
      bedrooms: 2,
      bathrooms: 2,
      parkingSpots: 1,
      furnished: true,
      petFriendly: true,
      utilitiesIncluded: false,
      featured: true,
      availableFrom: new Date('2026-05-01'),
      leaseTermMonths: 12,
      coverImage: propertyAssets.aptA,
      gallery: [propertyAssets.aptA, propertyAssets.aptB],
      amenities: ['Porteria 24/7', 'Lavanderia', 'Balcon', 'Estudio', 'Parqueadero cubierto'],
      status: PropertyStatus.ACTIVE
    },
    {
      title: 'Casa amplia para familia en Cedritos',
      description: 'Casa de tres niveles con patio interior, estudio independiente y gran capacidad de almacenamiento. Pensada para familias que buscan estabilidad y cercania a colegios y parques.',
      propertyType: PropertyType.HOUSE,
      city: 'Bogota',
      neighborhood: 'Cedritos',
      address: 'Calle 147 #10-22',
      monthlyRent: 6800000,
      adminFee: 0,
      deposit: 6800000,
      areaM2: 210,
      bedrooms: 4,
      bathrooms: 3.5,
      parkingSpots: 2,
      furnished: false,
      petFriendly: true,
      utilitiesIncluded: false,
      featured: true,
      availableFrom: new Date('2026-05-15'),
      leaseTermMonths: 12,
      coverImage: propertyAssets.houseA,
      gallery: [propertyAssets.houseA, propertyAssets.aptB],
      amenities: ['Patio', 'Chimenea', 'Estudio', 'Deposito', 'Parqueadero doble'],
      status: PropertyStatus.ACTIVE
    },
    {
      title: 'Loft minimalista en Chapinero Alto',
      description: 'Loft de lineas limpias con ventanales piso a techo, cocina integrada y acabados sobrios. Excelente para profesionales que valoran diseno y ubicacion central.',
      propertyType: PropertyType.LOFT,
      city: 'Bogota',
      neighborhood: 'Chapinero Alto',
      address: 'Calle 63 #4-11',
      monthlyRent: 3200000,
      adminFee: 410000,
      deposit: 3200000,
      areaM2: 62,
      bedrooms: 1,
      bathrooms: 1.5,
      parkingSpots: 1,
      furnished: true,
      petFriendly: false,
      utilitiesIncluded: true,
      featured: false,
      availableFrom: new Date('2026-04-25'),
      leaseTermMonths: 6,
      coverImage: propertyAssets.loftA,
      gallery: [propertyAssets.loftA, propertyAssets.studioA],
      amenities: ['Coworking', 'Gimnasio', 'Lavanderia', 'Bicicletero'],
      status: PropertyStatus.ACTIVE
    },
    {
      title: 'Studio funcional para una persona en Laureles',
      description: 'Studio compacto con excelente distribucion, iluminacion natural y acceso rapido a comercio local. Una opcion eficiente para quien prioriza ubicacion y practicidad.',
      propertyType: PropertyType.STUDIO,
      city: 'Medellin',
      neighborhood: 'Laureles',
      address: 'Circular 3 #70-16',
      monthlyRent: 2500000,
      adminFee: 280000,
      deposit: 2500000,
      areaM2: 38,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      furnished: true,
      petFriendly: false,
      utilitiesIncluded: true,
      featured: false,
      availableFrom: new Date('2026-05-03'),
      leaseTermMonths: 6,
      coverImage: propertyAssets.studioA,
      gallery: [propertyAssets.studioA, propertyAssets.roomA],
      amenities: ['Internet', 'Amoblado', 'Porteria', 'Zona de ropas'],
      status: PropertyStatus.ACTIVE
    },
    {
      title: 'Habitacion premium con bano privado en Envigado',
      description: 'Habitacion dentro de apartamento compartido con acceso independiente, closet amplio y reglas claras de convivencia. Bien conectada y pensada para estancias estables.',
      propertyType: PropertyType.ROOM,
      city: 'Envigado',
      neighborhood: 'Alcala',
      address: 'Carrera 42B #35 Sur-44',
      monthlyRent: 1450000,
      adminFee: 120000,
      deposit: 1450000,
      areaM2: 18,
      bedrooms: 1,
      bathrooms: 1,
      parkingSpots: 0,
      furnished: true,
      petFriendly: false,
      utilitiesIncluded: true,
      featured: false,
      availableFrom: new Date('2026-04-30'),
      leaseTermMonths: 6,
      coverImage: propertyAssets.roomA,
      gallery: [propertyAssets.roomA, propertyAssets.aptA],
      amenities: ['Bano privado', 'Servicios incluidos', 'Acceso a cocina', 'Aseo semanal'],
      status: PropertyStatus.ACTIVE
    },
    {
      title: 'Apartamento familiar con balcon en Pance',
      description: 'Apartamento moderno con balcon amplio, cocina cerrada y zonas comunes tranquilas. Muy adecuado para familias que valoran espacio, verde y acceso a vias principales.',
      propertyType: PropertyType.APARTMENT,
      city: 'Cali',
      neighborhood: 'Pance',
      address: 'Calle 18 #121-29',
      monthlyRent: 3900000,
      adminFee: 520000,
      deposit: 3900000,
      areaM2: 97,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpots: 2,
      furnished: false,
      petFriendly: true,
      utilitiesIncluded: false,
      featured: true,
      availableFrom: new Date('2026-06-01'),
      leaseTermMonths: 12,
      coverImage: propertyAssets.aptB,
      gallery: [propertyAssets.aptB, propertyAssets.houseA],
      amenities: ['Balcon', 'Piscina', 'Porteria', 'Zona infantil', 'Parqueadero doble'],
      status: PropertyStatus.ACTIVE
    }
  ];

  const properties = [];

  for (const item of rawProperties) {
    const property = await prisma.property.create({
      data: {
        ...item,
        slug: slugify(`${item.title}-${item.city}`),
        ownerId: host.id
      }
    });

    properties.push(property);
  }

  await prisma.favorite.createMany({
    data: [
      { userId: tenant.id, propertyId: properties[0].id },
      { userId: tenant.id, propertyId: properties[2].id }
    ]
  });

  await prisma.rentalRequest.create({
    data: {
      propertyId: properties[0].id,
      applicantId: tenant.id,
      applicantName: tenant.name,
      applicantEmail: tenant.email,
      applicantPhone: tenant.phone,
      moveInDate: new Date('2026-05-10'),
      leaseMonths: 12,
      householdSize: 2,
      monthlyIncome: 9800000,
      message: 'Busco mudarme en mayo y me interesa una estancia estable. Tengo capacidad de respuesta y referencias laborales.',
      status: RentalRequestStatus.PENDING
    }
  });

  console.log('Seed completado.');
  console.log('Host demo: host@nido.local / Nido1234*');
  console.log('Tenant demo: tenant@nido.local / Nido1234*');
  console.log('Admin demo: admin@nido.local / Nido1234*');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
