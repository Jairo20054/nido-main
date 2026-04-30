const { app } = require('./app');
const { env } = require('./shared/env');
const { startServerOnAvailablePort } = require('./shared/port');

// Captura fallos no controlados para evitar que el proceso quede en estado inconsistente.
process.on('uncaughtException', (error) => {
  console.error('[fatal] Excepcion no manejada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[fatal] Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Arranca la API buscando un puerto libre a partir del configurado en entorno.
const start = async () => {
  try {
    const preferredPort = env.PORT;
    const { port, server } = await startServerOnAvailablePort(app, preferredPort);

    if (port !== preferredPort) {
      console.warn(`El puerto ${preferredPort} ya estaba en uso. NIDO se inicio en el puerto ${port}.`);
    }

    env.PORT = port;
    process.env.PORT = String(port);

    console.log(`[ok] NIDO API corriendo en http://localhost:${port}`);
    console.log(`[ok] Health check: http://localhost:${port}/health`);

    // Cierra conexiones de forma ordenada cuando el proceso recibe una senal del sistema.
    const gracefulShutdown = () => {
      console.log('Cerrando servidor...');
      server.close(() => {
        console.log('Servidor cerrado');
        process.exit(0);
      });

      // Evita que el proceso quede colgado indefinidamente durante el cierre.
      setTimeout(() => {
        console.error('Timeout de shutdown, forzando salida');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    // Log de errores asociados al servidor HTTP ya inicializado.
    server.on('error', (error) => {
      console.error('[error] Error del servidor:', error);
    });
  } catch (error) {
    const errorMessage = error?.message || JSON.stringify(error);
    console.error('[fatal] No se pudo iniciar NIDO:', errorMessage);
    if (error?.stack) {
      console.error('Stack:', error.stack);
    }
    throw error;
  }
};

start().catch((error) => {
  console.error('[fatal] Error fatal:', error);
  process.exit(1);
});
