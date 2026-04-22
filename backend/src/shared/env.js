// ============================================================================
// CARGA DE VARIABLES DE ENTORNO
// ============================================================================
// Importar y cargar las variables de entorno desde el archivo .env ubicado en
// la raíz del proyecto. Esto debe hacerse antes de inicializar cualquier módulo
// que dependa de estas variables (como Supabase).
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// ============================================================================
// OBJETO DE CONFIGURACIÓN DEL ENTORNO
// ============================================================================
// Este objeto centraliza todas las variables de entorno y proporciona valores
// por defecto en caso de que las variables no estén definidas. Es el punto de
// referencia único para la configuración en toda la aplicación.
const env = {
  // Entorno de ejecución (desarrollo, producción, testing)
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Puerto en el que escucha el servidor
  PORT: Number(process.env.PORT || 5000),
  
  // URL del cliente frontend (usada para configurar CORS)
  CLIENT_URL: process.env.CLIENT_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  
  // Clave secreta para firmar tokens JWT
  JWT_SECRET: process.env.JWT_SECRET || 'nido-local-secret-change-me',
  
  // Duración de validez de los tokens JWT
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // ========================================================================
  // CONFIGURACIÓN DE SUPABASE
  // ========================================================================
  
  // URL del proyecto Supabase
  // Esta es la URL base para todas las operaciones con Supabase
  // Se obtiene de https://app.supabase.com en la sección "Project Settings"
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://your-project.supabase.co',
  
  // Clave anónima de Supabase
  // Se utiliza en operaciones públicas de autenticación y base de datos
  // Tiene permisos limitados definidos por las políticas de seguridad (RLS)
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'your-anon-key',
  
  // Clave de servicio de Supabase
  // Se utiliza en el servidor backend para operaciones con permisos completos
  // NUNCA debe exponerse al cliente
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || 'your-service-key',
  
  // URL de la base de datos PostgreSQL (opcional)
  // Úsala si necesitas conexión directa a PostgreSQL
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nido',
};

module.exports = { env };
