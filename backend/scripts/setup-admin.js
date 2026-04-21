const bcrypt = require('bcryptjs');
const { prisma } = require('../src/shared/prisma');

async function setupAdmin() {
  const EMAIL = 'admin@gmail.com';
  const PASSWORD = '00000';

  try {
    // Hash de la contraseña
    const passwordHash = await bcrypt.hash(PASSWORD, 10);

    // Intenta actualizar si existe, sino crea
    const user = await prisma.user.upsert({
      where: { email: EMAIL },
      update: {
        role: 'ADMIN',
        passwordHash: passwordHash,
      },
      create: {
        email: EMAIL,
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: passwordHash,
        role: 'ADMIN',
      },
    });

    console.log('✅ Usuario ADMIN configurado exitosamente:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Contraseña: 00000`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    console.log('\n📝 Puedes iniciar sesión en la app con estos datos');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
