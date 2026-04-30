// Espera a que el servidor HTTP confirme escucha o falle antes de continuar el arranque.
const waitForListening = (server) =>
  new Promise((resolve, reject) => {
    const onListening = () => {
      cleanup();
      resolve(server);
    };

    const onError = (error) => {
      cleanup();
      reject(error);
    };

    const cleanup = () => {
      server.removeListener('listening', onListening);
      server.removeListener('error', onError);
    };

    server.once('listening', onListening);
    server.once('error', onError);
  });

const listenOnPort = async (app, port) => {
  const server = app.listen(port);
  return waitForListening(server);
};

// Intenta arrancar el servidor en puertos consecutivos hasta encontrar uno libre.
const startServerOnAvailablePort = async (app, preferredPort, maxAttempts = 25) => {
  let lastError = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const port = preferredPort + attempt;

    try {
      const server = await listenOnPort(app, port);
      return { port, server };
    } catch (error) {
      if (error.code !== 'EADDRINUSE') {
        throw error;
      }

      lastError = error;
    }
  }

  throw lastError || new Error(`No se encontro un puerto disponible a partir de ${preferredPort}`);
};

module.exports = { startServerOnAvailablePort };
