// ============================================================================
// IMPORTACIÓN DEL CLIENTE DE PRISMA ORM
// ============================================================================
// PrismaClient es el generado ORM que proporciona una interfaz tipada para
// interactuar con la base de datos PostgreSQL.
const { PrismaClient } = require('@prisma/client');

// ============================================================================
// PATRÓN SINGLETON PARA PRISMA
// ============================================================================
// Este patrón asegura que solo exista una instancia de PrismaClient en toda
// la aplicación, evitando múltiples conexiones a la base de datos y problemas
// de rendimiento. Es especialmente importante en entornos serverless y hot reloads.
const globalForPrisma = global;

// ============================================================================
// CREACIÓN O REUTILIZACIÓN DE LA INSTANCIA DE PRISMA
// ============================================================================
// Si ya existe una instancia de Prisma en el contexto global, se reutiliza.
// Si no existe, se crea una nueva con la configuración especificada.
const prisma =
  globalForPrisma.__nidoPrisma ||
  new PrismaClient({
    // Configurar los logs según el entorno
    // En desarrollo: mostrar errores y advertencias
    // En producción: solo mostrar errores críticos
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// ============================================================================
// ALMACENAMIENTO DE LA INSTANCIA EN CONTEXTO GLOBAL
// ============================================================================
// Guardar la instancia de Prisma en el contexto global solo en desarrollo
// y en ambientes que no sean producción, para permitir hot reloads sin
// crear múltiples conexiones.
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__nidoPrisma = prisma;
}

module.exports = { prisma };
