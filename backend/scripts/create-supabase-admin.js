const { bootstrapAdmin } = require('../../scripts/admin-bootstrap-core');

const [email, password, firstName = 'Admin', lastName = 'Nido'] = process.argv.slice(2);

bootstrapAdmin({
  email,
  password,
  firstName,
  lastName,
})
  .then((result) => {
    console.log('Admin Supabase creado/verificado correctamente.');
    console.log(`Alias principal: ${result.alias}`);
    console.log(`Aliases validos: ${result.aliases.join(', ')}`);
    console.log(`Email: ${result.email}`);
    console.log(`User ID: ${result.userId}`);
    console.log(`Columna de rol: profiles.${result.schema.profileRoleColumn}`);
    console.log(`platform_admins: ${result.platformAdminGranted ? 'OK' : 'no aplica'}`);
    if (result.platformAdminError) {
      console.log(`platform_admins aviso: ${result.platformAdminError}`);
    }
    console.log(`roles: ${result.roleGranted ? 'OK' : 'no aplica'}`);
    console.log(`Verificacion login: ${result.verification.skipped ? `omitida (${result.verification.reason})` : 'OK'}`);
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
