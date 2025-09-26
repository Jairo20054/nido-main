/**
 * Script para poblar las colecciones de MongoDB con datos de ejemplo
 * Este script inserta datos de prueba en todas las colecciones
 */

const mongoose = require('mongoose');

// URI de conexión proporcionada por el usuario
const MONGODB_URI = 'mongodb+srv://Castillojairo:Andres172001@nido.ydcbciq.mongodb.net/';

// Importar todos los modelos
const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Message = require('../models/Message');
const Payment = require('../models/Payment');

// Datos de ejemplo
const sampleUsers = [
  {
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    password: 'password123',
    role: 'user',
    phone: '+57 300 123 4567',
    bio: 'Viajero frecuente que ama explorar nuevas ciudades',
    isVerified: true
  },
  {
    name: 'María García',
    email: 'maria.garcia@email.com',
    password: 'password123',
    role: 'user',
    phone: '+57 301 234 5678',
    bio: 'Profesional de marketing que viaja por trabajo',
    isVerified: true
  },
  {
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    password: 'password123',
    role: 'host',
    phone: '+57 302 345 6789',
    bio: 'Anfitrión experimentado con propiedades en Bogotá y Medellín',
    isVerified: true
  },
  {
    name: 'Ana López',
    email: 'ana.lopez@email.com',
    password: 'password123',
    role: 'host',
    phone: '+57 303 456 7890',
    bio: 'Propietaria de apartamentos turísticos en Cartagena',
    isVerified: true
  }
];

const sampleProperties = [
  {
    title: 'Hermoso apartamento en el centro de Bogotá',
    description: 'Amplio apartamento de 2 habitaciones en el corazón de Bogotá, cerca de todos los puntos turísticos. Equipado con todas las comodidades modernas.',
    location: 'Bogotá, Colombia',
    address: {
      street: 'Carrera 7 # 24-45',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipCode: '110111',
      country: 'Colombia'
    },
    coordinates: {
      latitude: 4.7110,
      longitude: -74.0721
    },
    price: 150000,
    pricePerNight: 75000,
    propertyType: 'apartment',
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    amenities: ['wifi', 'kitchen', 'tv', 'air_conditioning', 'laundry'],
    images: [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', alt: 'Sala de estar', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', alt: 'Cocina moderna' }
    ],
    rules: {
      smoking: false,
      pets: false,
      parties: false,
      checkIn: '15:00',
      checkOut: '11:00'
    },
    rating: {
      average: 4.5,
      count: 12
    },
    isActive: true
  },
  {
    title: 'Casa colonial en el centro histórico de Cartagena',
    description: 'Encantadora casa colonial restaurada en el centro histórico de Cartagena. Patio interior, arquitectura típica y todas las comodidades modernas.',
    location: 'Cartagena, Colombia',
    address: {
      street: 'Calle del Cuartel # 36-12',
      city: 'Cartagena',
      state: 'Bolívar',
      zipCode: '130001',
      country: 'Colombia'
    },
    coordinates: {
      latitude: 10.3997,
      longitude: -75.5144
    },
    price: 200000,
    pricePerNight: 100000,
    propertyType: 'house',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    amenities: ['wifi', 'kitchen', 'tv', 'air_conditioning', 'pool', 'parking', 'balcony'],
    images: [
      { url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', alt: 'Fachada colonial', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', alt: 'Patio interior' }
    ],
    rules: {
      smoking: false,
      pets: true,
      parties: false,
      checkIn: '14:00',
      checkOut: '12:00'
    },
    rating: {
      average: 4.8,
      count: 8
    },
    isActive: true
  },
  {
    title: 'Loft moderno en zona rosa de Medellín',
    description: 'Loft contemporáneo en el corazón de la zona rosa de Medellín. Diseño moderno, techos altos y vista panorámica de la ciudad.',
    location: 'Medellín, Colombia',
    address: {
      street: 'Carrera 35 # 8-20',
      city: 'Medellín',
      state: 'Antioquia',
      zipCode: '050021',
      country: 'Colombia'
    },
    coordinates: {
      latitude: 6.2442,
      longitude: -75.5812
    },
    price: 180000,
    pricePerNight: 90000,
    propertyType: 'loft',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: ['wifi', 'kitchen', 'tv', 'air_conditioning', 'gym', 'parking'],
    images: [
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', alt: 'Loft moderno', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', alt: 'Cocina abierta' }
    ],
    rules: {
      smoking: false,
      pets: false,
      parties: false,
      checkIn: '16:00',
      checkOut: '10:00'
    },
    rating: {
      average: 4.2,
      count: 15
    },
    isActive: true
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Conectando a MongoDB para poblar datos...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    console.log('🧹 Limpiando datos existentes...');

    // Limpiar datos existentes (opcional - descomenta si quieres limpiar)
    // await User.deleteMany({});
    // await Property.deleteMany({});
    // await Booking.deleteMany({});
    // await Message.deleteMany({});
    // await Payment.deleteMany({});

    console.log('👥 Creando usuarios...');
    const createdUsers = await User.insertMany(sampleUsers);
    console.log(`✅ ${createdUsers.length} usuarios creados`);

    // Obtener IDs de hosts para asignar propiedades
    const hostUsers = createdUsers.filter(user => user.role === 'host');
    const regularUsers = createdUsers.filter(user => user.role === 'user');

    console.log('🏠 Creando propiedades...');
    // Asignar propiedades a hosts
    const propertiesWithHosts = sampleProperties.map((property, index) => ({
      ...property,
      host: hostUsers[index % hostUsers.length]._id
    }));

    const createdProperties = await Property.insertMany(propertiesWithHosts);
    console.log(`✅ ${createdProperties.length} propiedades creadas`);

    console.log('📅 Creando reservas...');
    const sampleBookings = [
      {
        user: regularUsers[0]._id,
        property: createdProperties[0]._id,
        checkIn: new Date('2024-02-15'),
        checkOut: new Date('2024-02-18'),
        guests: { adults: 2, children: 0, infants: 0 },
        totalPrice: 225000, // 3 noches * 75000
        nights: 3,
        status: 'confirmed',
        paymentStatus: 'paid',
        specialRequests: 'Vista a la ciudad por favor'
      },
      {
        user: regularUsers[1]._id,
        property: createdProperties[1]._id,
        checkIn: new Date('2024-03-01'),
        checkOut: new Date('2024-03-05'),
        guests: { adults: 4, children: 2, infants: 0 },
        totalPrice: 400000, // 4 noches * 100000
        nights: 4,
        status: 'pending',
        paymentStatus: 'pending'
      }
    ];

    const createdBookings = await Booking.insertMany(sampleBookings);
    console.log(`✅ ${createdBookings.length} reservas creadas`);

    console.log('💬 Creando mensajes...');
    const sampleMessages = [
      {
        sender: regularUsers[0]._id,
        recipient: hostUsers[0]._id,
        property: createdProperties[0]._id,
        content: 'Hola, ¿está disponible el apartamento para el fin de semana?',
        isRead: true
      },
      {
        sender: hostUsers[0]._id,
        recipient: regularUsers[0]._id,
        property: createdProperties[0]._id,
        content: '¡Hola! Sí, está disponible. ¿Cuántas personas van a hospedarse?',
        isRead: true
      },
      {
        sender: regularUsers[1]._id,
        recipient: hostUsers[1]._id,
        property: createdProperties[1]._id,
        content: 'Buenas tardes, me gustaría reservar la casa colonial para marzo',
        isRead: false
      }
    ];

    const createdMessages = await Message.insertMany(sampleMessages);
    console.log(`✅ ${createdMessages.length} mensajes creados`);

    console.log('💳 Creando pagos...');
    const samplePayments = [
      {
        booking: createdBookings[0]._id,
        user: regularUsers[0]._id,
        amount: 225000,
        currency: 'COP',
        paymentMethod: 'credit_card',
        paymentIntentId: 'pi_test_123456789',
        status: 'completed',
        transactionId: 'txn_abc123def456',
        cardDetails: {
          last4: '4242',
          brand: 'visa',
          expMonth: 12,
          expYear: 2025
        },
        billingAddress: {
          firstName: 'Juan',
          lastName: 'Pérez',
          email: 'juan.perez@email.com',
          phone: '+57 300 123 4567',
          address: 'Carrera 7 # 24-45',
          city: 'Bogotá',
          state: 'Cundinamarca',
          zipCode: '110111',
          country: 'Colombia'
        }
      }
    ];

    const createdPayments = await Payment.insertMany(samplePayments);
    console.log(`✅ ${createdPayments.length} pagos creados`);

    console.log('\n🎉 ¡Base de datos poblada exitosamente!');
    console.log('\n📊 Resumen de datos insertados:');
    console.log(`   👥 Usuarios: ${createdUsers.length}`);
    console.log(`   🏠 Propiedades: ${createdProperties.length}`);
    console.log(`   📅 Reservas: ${createdBookings.length}`);
    console.log(`   💬 Mensajes: ${createdMessages.length}`);
    console.log(`   💳 Pagos: ${createdPayments.length}`);

  } catch (error) {
    console.error('❌ Error poblando la base de datos:', error.message);
    process.exit(1);
  } finally {
    console.log('\n🔌 Desconectando de MongoDB...');
    await mongoose.disconnect();
    console.log('✅ Desconexión completada.');
  }
}

// Ejecutar el script
seedDatabase().then(() => {
  console.log('🎯 Script de poblamiento completado exitosamente.');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error en el script de poblamiento:', error);
  process.exit(1);
});
