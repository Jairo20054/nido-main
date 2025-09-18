/**
 * Script para crear las colecciones de MongoDB basadas en los modelos definidos
 * Este script conecta a la base de datos y crea las colecciones necesarias
 */

const mongoose = require('mongoose');
const { connect, disconnect } = require('../config/db');

// Importar todos los modelos para registrar los esquemas
require('../models/User');
require('../models/Property');
require('../models/Booking');
require('../models/Message');
require('../models/Payment');

const collections = [
  'users',
  'properties',
  'bookings',
  'messages',
  'payments'
];

async function createCollections() {
  try {
    console.log('Conectando a MongoDB...');
    await connect();

    console.log('Creando colecciones...');

    for (const collectionName of collections) {
      try {
        // Verificar si la colección ya existe
        const collectionsList = await mongoose.connection.db.listCollections({ name: collectionName }).toArray();

        if (collectionsList.length === 0) {
          // Crear la colección si no existe
          await mongoose.connection.db.createCollection(collectionName);
          console.log(`✓ Colección '${collectionName}' creada exitosamente`);
        } else {
          console.log(`ℹ Colección '${collectionName}' ya existe`);
        }
      } catch (error) {
        console.error(`✗ Error al crear la colección '${collectionName}':`, error.message);
      }
    }

    console.log('Todas las colecciones han sido procesadas.');

  } catch (error) {
    console.error('Error general:', error.message);
    process.exit(1);
  } finally {
    console.log('Desconectando de MongoDB...');
    await disconnect();
    console.log('Desconexión completada.');
  }
}

// Ejecutar el script
createCollections().then(() => {
  console.log('Script completado exitosamente.');
  process.exit(0);
}).catch((error) => {
  console.error('Error en el script:', error);
  process.exit(1);
});
