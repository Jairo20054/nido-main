// ============================================================================
// QUICK START: IMPLEMENTACIÓN DE SUPABASE
// ============================================================================
// Este archivo contiene snippets rápidos para implementar Supabase
// en controladores existentes

// ============================================================================
// 1. INICIALIZAR SUPABASE EN TU CONTROLADOR
// ============================================================================

// ❌ Antes (Prisma)
// const { prisma } = require('../../shared/prisma');
// const users = await prisma.user.findMany();

// ✅ Después (Supabase)
const { supabaseAdmin } = require('../../shared/supabase');
const { data: users, error } = await supabaseAdmin
  .from('users')
  .select('*');

if (error) throw new Error(error.message);

// ============================================================================
// 2. OBTENER UN REGISTRO (findUnique)
// ============================================================================

// ❌ Prisma
// const user = await prisma.user.findUnique({ where: { id: userId } });

// ✅ Supabase
const { data: user, error } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', userId)
  .single(); // Retorna un objeto, no array

if (error || !user) {
  throw notFound('Usuario no encontrado');
}

// ============================================================================
// 3. OBTENER MÚLTIPLES REGISTROS (findMany)
// ============================================================================

// ❌ Prisma
// const users = await prisma.user.findMany({ where: { role: 'ADMIN' } });

// ✅ Supabase
const { data: users, error } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('role', 'ADMIN');

if (error) throw new Error(error.message);

// ============================================================================
// 4. CONTAR REGISTROS (count)
// ============================================================================

// ❌ Prisma
// const count = await prisma.user.count({ where: { role: 'ADMIN' } });

// ✅ Supabase (Opción 1: Con count exacto)
const { count, error } = await supabaseAdmin
  .from('users')
  .select('*', { count: 'exact' })
  .eq('role', 'ADMIN');

// ✅ Supabase (Opción 2: Simplemente contar length)
const { data: users } = await supabaseAdmin
  .from('users')
  .select('id')
  .eq('role', 'ADMIN');
const count = users?.length || 0;

// ============================================================================
// 5. CREAR UN REGISTRO (create)
// ============================================================================

// ❌ Prisma
// const user = await prisma.user.create({
//   data: { email, firstName, role: 'TENANT' }
// });

// ✅ Supabase
const { data: user, error } = await supabaseAdmin
  .from('users')
  .insert([{
    email,
    firstName,
    role: 'TENANT',
    created_at: new Date().toISOString(),
  }])
  .select()
  .single(); // Retornar el registro creado

if (error) throw new Error(error.message);

// ============================================================================
// 6. ACTUALIZAR UN REGISTRO (update)
// ============================================================================

// ❌ Prisma
// const user = await prisma.user.update({
//   where: { id: userId },
//   data: { firstName: 'Juan' }
// });

// ✅ Supabase
const { data: user, error } = await supabaseAdmin
  .from('users')
  .update({ firstName: 'Juan', updated_at: new Date().toISOString() })
  .eq('id', userId)
  .select()
  .single();

if (error) throw new Error(error.message);

// ============================================================================
// 7. ELIMINAR UN REGISTRO (delete)
// ============================================================================

// ❌ Prisma
// await prisma.user.delete({ where: { id: userId } });

// ✅ Supabase
const { error } = await supabaseAdmin
  .from('users')
  .delete()
  .eq('id', userId);

if (error) throw new Error(error.message);

// ============================================================================
// 8. FILTROS COMPLEJOS (where con AND/OR)
// ============================================================================

// ❌ Prisma
// const properties = await prisma.property.findMany({
//   where: {
//     AND: [
//       { city: 'Madrid' },
//       { status: 'PUBLISHED' },
//       { OR: [
//         { monthlyRent: { gte: 500 } },
//         { monthlyRent: { lte: 2000 } }
//       ]}
//     ]
//   }
// });

// ✅ Supabase
let query = supabaseAdmin
  .from('properties')
  .select('*')
  .eq('city', 'Madrid')
  .eq('status', 'PUBLISHED')
  .gte('monthlyRent', 500)
  .lte('monthlyRent', 2000);

const { data: properties, error } = await query;

// ============================================================================
// 9. BÚSQUEDA DE TEXTO (contains, ilike)
// ============================================================================

// ❌ Prisma
// const results = await prisma.property.findMany({
//   where: {
//     title: { contains: 'apartamento', mode: 'insensitive' }
//   }
// });

// ✅ Supabase
const { data: results, error } = await supabaseAdmin
  .from('properties')
  .select('*')
  .ilike('title', '%apartamento%'); // i = case insensitive

// ============================================================================
// 10. ORDENAMIENTO (orderBy)
// ============================================================================

// ❌ Prisma
// const properties = await prisma.property.findMany({
//   orderBy: [
//     { created_at: 'desc' },
//     { monthlyRent: 'asc' }
//   ]
// });

// ✅ Supabase
const { data: properties, error } = await supabaseAdmin
  .from('properties')
  .select('*')
  .order('created_at', { ascending: false })
  .order('monthlyRent', { ascending: true });

// ============================================================================
// 11. PAGINACIÓN (skip/take)
// ============================================================================

// ❌ Prisma
// const properties = await prisma.property.findMany({
//   skip: 10,
//   take: 5
// });

// ✅ Supabase
const page = 2;
const pageSize = 5;
const skip = (page - 1) * pageSize;

const { data: properties, error } = await supabaseAdmin
  .from('properties')
  .select('*')
  .range(skip, skip + pageSize - 1); // range(from, to) inclusive en ambos lados

// ============================================================================
// 12. RELACIONES (include/select)
// ============================================================================

// ❌ Prisma
// const property = await prisma.property.findUnique({
//   where: { id },
//   include: {
//     owner: true,
//     images: true,
//     rentalRequests: {
//       where: { status: 'PENDING' }
//     }
//   }
// });

// ✅ Supabase (seleccionar todo y relaciones)
const { data: property, error } = await supabaseAdmin
  .from('properties')
  .select(`
    *,
    owner:ownerId(*),
    images(*),
    rentalRequests(status.eq.PENDING)
  `)
  .eq('id', propertyId)
  .single();

// ============================================================================
// 13. TRANSACCIONES (en paralelo con Promise.all)
// ============================================================================

// ❌ Prisma (con $transaction)
// await prisma.$transaction([
//   prisma.user.create({ data: { email } }),
//   prisma.property.create({ data: { title } })
// ]);

// ✅ Supabase (con Promise.all)
const [userResult, propertyResult] = await Promise.all([
  supabaseAdmin.from('users').insert([{ email }]).select().single(),
  supabaseAdmin.from('properties').insert([{ title }]).select().single()
]);

if (userResult.error || propertyResult.error) {
  throw new Error('Error en transacción');
}

// ============================================================================
// 14. OPERACIONES EN BATCH (insertMany)
// ============================================================================

// ❌ Prisma
// await prisma.user.createMany({
//   data: [
//     { email: 'user1@example.com' },
//     { email: 'user2@example.com' }
//   ]
// });

// ✅ Supabase
const { data: users, error } = await supabaseAdmin
  .from('users')
  .insert([
    { email: 'user1@example.com' },
    { email: 'user2@example.com' }
  ])
  .select();

// ============================================================================
// 15. ERRORES Y VALIDACIÓN
// ============================================================================

// ✅ Patrón correcto de manejo de errores
const { data, error } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

// Verificar error
if (error) {
  console.error('Database error:', error);
  
  // Mensajes específicos según el error
  if (error.code === 'PGRST116') {
    throw notFound('Registro no encontrado');
  }
  
  if (error.code === '23505') {
    throw badRequest('El email ya existe');
  }
  
  throw badRequest(error.message);
}

// Verificar que existe el dato
if (!data) {
  throw notFound('Usuario no encontrado');
}

// ============================================================================
// CONSEJOS Y BUENAS PRÁCTICAS
// ============================================================================

/*
1. SIEMPRE usar supabaseAdmin (con SERVICE_KEY) en el servidor
   - Nunca usar supabase (con ANON_KEY) desde el backend
   - supabase es solo para operaciones públicas en el cliente

2. AGREGAR TIMESTAMPS automáticos
   .insert([{ ...data, created_at: new Date().toISOString() }])

3. USAR .select() para obtener el registro después de insert/update
   .insert([data]).select().single()

4. VALIDAR SIEMPRE que error es null
   if (error) throw new Error(error.message);

5. USAR .single() cuando esperes UN resultado
   .select().single() retorna objeto, no array

6. USAR RLS (Row Level Security) en producción
   Agregar políticas en Supabase para seguridad a nivel de datos

7. CREAR ÍNDICES en campos que filtres frecuentemente
   CREATE INDEX properties_city_idx ON properties(city);

8. USAR ilike para búsquedas case-insensitive
   .ilike('title', '%apartamento%')

9. LIMITAR resultados en consultas públicas
   .limit(100) // evitar traer demasiados datos

10. CACHEAR queries costosas si es posible
    Usar Redis o localStorage en el cliente
*/
