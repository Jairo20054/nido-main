const { prisma } = require('../src/shared/prisma');

async function makeAdmin() {
  // REEMPLAZA 'tu-email@example.com' con tu email real
  const EMAIL = process.argv[2] || 'tu-email@example.com';

  try {
    const user = await prisma.user.update({
      where: { email: EMAIL },
      data: { role: 'ADMIN' },
    });

    console.log('✅ Usuario actualizado a ADMIN:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   ID: ${user.id}`);
  } catch (error) {
    if (error.code === 'P2025') {
      console.error('❌ Usuario no encontrado:', EMAIL);
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

makeAdmin();
