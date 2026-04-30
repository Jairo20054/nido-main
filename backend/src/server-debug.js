// Script auxiliar para diagnosticar problemas de arranque paso a paso.
console.log('[DEBUG] 1. Iniciando proceso...');

try {
  console.log('[DEBUG] 2. Require app...');
  const { app } = require('./app');
  console.log('[DEBUG] 3. App cargada correctamente');

  console.log('[DEBUG] 4. Require env...');
  const { env } = require('./shared/env');
  console.log('[DEBUG] 5. Env cargado:', { PORT: env.PORT, NODE_ENV: env.NODE_ENV });

  console.log('[DEBUG] 6. Require startServerOnAvailablePort...');
  const { startServerOnAvailablePort } = require('./shared/port');
  console.log('[DEBUG] 7. startServerOnAvailablePort cargado');

  const start = async () => {
    try {
      console.log('[DEBUG] 8. Ejecutando start()...');
      const preferredPort = env.PORT;
      console.log('[DEBUG] 9. Puerto preferido:', preferredPort);

      console.log('[DEBUG] 10. Llamando startServerOnAvailablePort...');
      const result = await startServerOnAvailablePort(app, preferredPort);
      console.log('[DEBUG] 11. startServerOnAvailablePort completado, resultado:', { port: result.port, hasServer: !!result.server });

      const { port, server } = result;
      console.log('[DEBUG] 12. Puerto obtenido:', port);

      if (port !== preferredPort) {
        console.warn(`El puerto ${preferredPort} ya estaba en uso. NIDO se inicio en el puerto ${port}.`);
      }

      env.PORT = port;
      process.env.PORT = String(port);

      console.log(`✓ NIDO API corriendo en http://localhost:${port}`);
      console.log(`✓ Health check: http://localhost:${port}/health`);
      console.log('[DEBUG] 13. Server debería estar escuchando ahora');

      process.on('SIGTERM', () => {
        console.log('SIGTERM recibido, cerrando servidor...');
        server.close(() => {
          console.log('Servidor cerrado');
          process.exit(0);
        });
      });

      process.on('SIGINT', () => {
        console.log('SIGINT recibido, cerrando servidor...');
        server.close(() => {
          console.log('Servidor cerrado');
          process.exit(0);
        });
      });

      console.log('[DEBUG] 14. Handlers registrados, proceso mantenido vivo');
    } catch (error) {
      console.log('[DEBUG] ERROR en start():', error);
      const errorMessage = error?.message || JSON.stringify(error);
      console.error('✗ No se pudo iniciar NIDO:', errorMessage);
      if (error?.stack) {
        console.error('Stack:', error.stack);
      }
      throw error;
    }
  };

  console.log('[DEBUG] 15. Llamando start()...');
  start().catch((error) => {
    console.log('[DEBUG] CATCH final - Error fatal:', error);
    console.error('✗ Error fatal:', error);
    process.exit(1);
  });

  console.log('[DEBUG] 16. Fin de script principal (await en start)');
} catch (error) {
  console.log('[DEBUG] ERROR global:', error);
  console.error('✗ Error durante carga de módulos:', error);
  process.exit(1);
}
