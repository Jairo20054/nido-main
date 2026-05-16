const { bootstrapAdmin } = require('./admin-bootstrap-core');

bootstrapAdmin()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
