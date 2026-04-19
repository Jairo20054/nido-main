const { app } = require('./app');
const { env } = require('./shared/env');
const { startServerOnAvailablePort } = require('./shared/port');

const start = async () => {
  const preferredPort = env.PORT;
  const { port } = await startServerOnAvailablePort(app, preferredPort);

  if (port !== preferredPort) {
    console.warn(`El puerto ${preferredPort} ya estaba en uso. NIDO se inicio en el puerto ${port}.`);
  }

  env.PORT = port;
  process.env.PORT = String(port);

  console.log(`NIDO API corriendo en http://localhost:${port}`);
};

start().catch((error) => {
  console.error('No se pudo iniciar NIDO:', error);
  process.exit(1);
});
