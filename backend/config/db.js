// config/db.js
const mongoose = require('mongoose');
const config = require('./index');
const logger = require('../utils/logger');

// Configuración de opciones de conexión mejoradas
const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: config.database.mongodb.connectionTimeout || 30000,
  socketTimeoutMS: config.database.mongodb.socketTimeout || 45000,
  maxPoolSize: config.database.mongodb.poolSize || 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
  compressors: 'zlib',
  zlibCompressionLevel: 7
};

// Contador de intentos de reconexión
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 5000; // 5 segundos

// Variable para controlar el estado de la conexión
let isConnected = false;
let connectionRetryTimer = null;

/**
 * Establece conexión con la base de datos MongoDB
 * @returns {Promise<void>}
 */
const connect = async () => {
  const uri = config.database.mongodb.uri;
  
  // Validar que la URI esté presente
  if (!uri) {
    const error = new Error('MongoDB connection string is not defined');
    logger.error('MongoDB connection error', { 
      message: error.message,
      stack: error.stack
    });
    throw error;
  }

  try {
    // Conectar a la base de datos
    await mongoose.connect(uri, connectionOptions);
    
    isConnected = true;
    reconnectAttempts = 0;
    
    // Obtener información de la conexión
    const connection = mongoose.connection;
    const dbName = connection.db?.databaseName || 'unknown';
    const host = connection.host || 'unknown';
    
    logger.info('Successfully connected to MongoDB', { 
      dbName,
      host,
      port: connection.port,
      readyState: connection.readyState
    });
    
    // Habilitar debug en entorno de desarrollo
    if (process.env.NODE_ENV !== 'production') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        logger.debug('MongoDB Query', {
          collection: collectionName,
          method,
          query,
          doc
        });
      });
    }
  } catch (err) {
    isConnected = false;
    logger.error('MongoDB connection failed', { 
      message: err.message,
      stack: err.stack,
      attempt: reconnectAttempts + 1
    });
    
    // Intentar reconexión automática si no hemos excedido el máximo de intentos
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      logger.warn(`Attempting to reconnect to MongoDB (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`, {
        nextAttemptIn: `${RECONNECT_INTERVAL / 1000} seconds`
      });
      
      // Programar próximo intento de reconexión
      if (connectionRetryTimer) clearTimeout(connectionRetryTimer);
      connectionRetryTimer = setTimeout(connect, RECONNECT_INTERVAL);
    } else {
      logger.error('Max reconnection attempts reached. MongoDB connection failed permanently.');
      throw err;
    }
  }
};

/**
 * Cierra la conexión con la base de datos
 * @returns {Promise<void>}
 */
const disconnect = async () => {
  try {
    // Limpiar timer de reconexión si existe
    if (connectionRetryTimer) {
      clearTimeout(connectionRetryTimer);
      connectionRetryTimer = null;
    }
    
    // Solo desconectar si estamos conectados
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      logger.info('MongoDB connection closed gracefully');
    }
  } catch (err) {
    logger.error('Error disconnecting from MongoDB', { 
      message: err.message,
      stack: err.stack
    });
    throw err;
  }
};

/**
 * Verifica el estado de la conexión
 * @returns {Object} Estado de la conexión
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  
  return {
    isConnected,
    readyState: mongoose.connection.readyState,
    state: states[mongoose.connection.readyState] || 'unknown',
    dbName: mongoose.connection.db?.databaseName,
    host: mongoose.connection.host,
    port: mongoose.connection.port
  };
};

// Manejadores de eventos de conexión
mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB disconnected', {
    readyState: mongoose.connection.readyState
  });
});

mongoose.connection.on('reconnected', () => {
  isConnected = true;
  reconnectAttempts = 0;
  logger.info('MongoDB reconnected successfully', {
    dbName: mongoose.connection.db?.databaseName,
    host: mongoose.connection.host
  });
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error', { 
    message: err.message,
    stack: err.stack
  });
});

// Manejar cierre graceful de la aplicación
process.on('SIGINT', async () => {
  logger.info('Application termination signal received. Closing MongoDB connection...');
  await disconnect();
  process.exit(0);
});

module.exports = { 
  connect, 
  disconnect, 
  getConnectionStatus,
  connection: mongoose.connection
};