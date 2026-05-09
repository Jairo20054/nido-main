require('dotenv').config();
const { prisma } = require('../src/shared/prisma');

async function setupAdmin() {
  const email = process.argv[2] || process.env.ADMIN_EMAIL;

  if (!email) {
    console.error('Uso: node backend/scripts/setup-admin.js <email>');
    console.error('Tambien puedes definir ADMIN_EMAIL en el entorno.');
    process.exitCode = 1;
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log('Usuario ADMIN configurado exitosamente:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Rol: ${user.role}`);
    console.log(`   ID: ${user.id}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setupAdmin();
