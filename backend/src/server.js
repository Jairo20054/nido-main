const { app } = require('./app');
const { env } = require('./shared/env');

app.listen(env.PORT, () => {
  console.log(`NIDO API corriendo en http://localhost:${env.PORT}`);
});
