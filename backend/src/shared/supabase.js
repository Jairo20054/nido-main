// ============================================================================
// CONFIGURACIÓN DEL CLIENTE SUPABASE
// ============================================================================
// Este archivo configura y exporta la instancia del cliente de Supabase
// que se utilizará en toda la aplicación para acceder a la base de datos
// y a los servicios de autenticación de Supabase.
//
// Supabase proporciona:
// - PostgreSQL como base de datos
// - Autenticación integrada (email/password, OAuth, etc.)
// - API REST automática
// - Realtime listeners
// - Funciones SQL (Stored Procedures)

const { createClient } = require('@supabase/supabase-js');
const { env } = require('./env');

// ============================================================================
// VALIDACIÓN DE CREDENCIALES DE SUPABASE
// ============================================================================
// Antes de crear el cliente, verificar que las credenciales necesarias
// están configuradas. Esto evita errores confusos más adelante.
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.error(
    '⚠️  ADVERTENCIA: Credenciales de Supabase no configuradas.\n' +
    'Por favor, configura SUPABASE_URL y SUPABASE_ANON_KEY en tu archivo .env\n' +
    'Obtén estas valores en https://app.supabase.com > Project Settings > API'
  );
}

// ============================================================================
// CREACIÓN DEL CLIENTE SUPABASE (ANÓNIMO - Para el servidor)
// ============================================================================
// Este cliente se utiliza para operaciones que no requieren privilegios especiales
// o para casos donde queremos que Supabase RLS (Row Level Security) maneje los permisos
const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  {
    // Configuración del cliente
    auth: {
      // Manejo automático de sesiones
      autoRefreshToken: true,
      persistSession: false, // No persistir en el servidor
      detectSessionInUrl: false,
    },
    // Configuración global
    global: {
      // Headers personalizados para todas las peticiones
      headers: {
        // Identificador de cliente para debugging
        'X-Client-Info': 'nido-backend',
      },
    },
  }
);

const normalizeProfileRow = (profile) => {
  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName ?? profile.first_name ?? '',
    lastName: profile.lastName ?? profile.last_name ?? '',
    phone: profile.phone ?? null,
    bio: profile.bio ?? null,
    avatarUrl: profile.avatarUrl ?? profile.avatar_url ?? null,
    locale: profile.locale ?? 'es-CO',
    countryCode: profile.countryCode ?? profile.country_code ?? 'CO',
    timezone: profile.timezone ?? 'America/Bogota',
    role: profile.role ?? profile.primary_role ?? 'tenant',
    status: profile.status ?? 'active',
    onboardingCompletedAt:
      profile.onboardingCompletedAt ?? profile.onboarding_completed_at ?? null,
    createdAt: profile.createdAt ?? profile.created_at ?? null,
    updatedAt: profile.updatedAt ?? profile.updated_at ?? null,
  };
};

// ============================================================================
// CREACIÓN DEL CLIENTE SUPABASE ADMIN (Con permisos de servidor)
// ============================================================================
// Este cliente utiliza la SUPABASE_SERVICE_KEY que tiene permisos completos
// Se utiliza para operaciones administrativas que NUNCA deben ser accesibles
// desde el cliente, solo desde el servidor backend
const supabaseAdmin = env.SUPABASE_SERVICE_KEY
  ? createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
        global: {
          headers: {
            'X-Client-Info': 'nido-backend-admin',
          },
        },
      }
    )
  : null;

// ============================================================================
// UTILIDADES DE SUPABASE
// ============================================================================

/**
 * Obtener el usuario actual desde el token de sesión
 * 
 * @param {string} token - Token JWT de Supabase
 * @returns {Promise<Object|null>} - Datos del usuario o null
 */
const getUserFromToken = async (token) => {
  if (!token) return null;
  
  try {
    // Usar el cliente anónimo para verificar el token
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
};

/**
 * Obtener los datos extendidos del usuario desde la tabla users
 * 
 * @param {string} userId - ID del usuario (UUID de Supabase Auth)
 * @returns {Promise<Object|null>} - Datos extendidos del usuario o null
 */
const getUserData = async (userId) => {
  if (!userId) return null;

  try {
    // Usar el cliente admin para obtener datos de la tabla users
    // sin restricciones de RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return normalizeProfileRow(data);
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Crear un nuevo usuario en la tabla users (después de que se registre en Auth)
 * 
 * @param {Object} userData - Datos del usuario a crear
 * @returns {Promise<Object|null>} - Usuario creado o null
 */
const createUserProfile = async (userData) => {
  try {
    const requestedRole =
      (userData.role || userData.primary_role || 'tenant').toString().toLowerCase() === 'landlord'
        ? 'landlord'
        : 'tenant';

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .upsert([
        {
          id: userData.id,
          auth_id: userData.id,
          email: userData.email,
          first_name: userData.firstName || userData.first_name || '',
          last_name: userData.lastName || userData.last_name || '',
          phone: userData.phone || null,
          bio: userData.bio || null,
          avatar_url: userData.avatarUrl || userData.avatar_url || null,
          role: requestedRole,
        },
      ], { onConflict: 'id' })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    const roleTable = requestedRole === 'landlord' ? 'landlords' : 'tenants';
    const rolePayload = {
      profile_id: userData.id,
    };

    await supabaseAdmin.from(roleTable).upsert([rolePayload], { onConflict: 'profile_id' });

    return normalizeProfileRow(data);
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
};

// ============================================================================
// EXPORTACIÓN
// ============================================================================
module.exports = {
  supabase,           // Cliente con permisos públicos/limitados
  supabaseAdmin,      // Cliente admin con permisos completos
  getUserFromToken,   // Función para obtener usuario desde token
  getUserData,        // Función para obtener datos extendidos del usuario
  createUserProfile,  // Función para crear perfil de usuario
  normalizeProfileRow,
};
