const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const cleanupScript = path.join(rootDir, 'scripts', 'cleanup-nido-processes.js');
const prismaBin =
  process.platform === 'win32'
    ? path.join(rootDir, 'node_modules', '.bin', 'prisma.cmd')
    : path.join(rootDir, 'node_modules', '.bin', 'prisma');

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
    env: {
      ...process.env,
      ...options.env,
    },
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    const error = new Error(details || `${command} ${args.join(' ')} failed`);
    error.code = result.status;
    throw error;
  }

  return result;
};

const syncPrismaSchema = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL no esta configurada; se omite prisma db push.');
    return;
  }

  try {
    run(prismaBin, ['db', 'push', '--skip-generate'], {
      env: {
        DATABASE_URL: process.env.DATABASE_URL,
      },
      stdio: 'inherit',
    });
  } catch (error) {
    const details = error && error.message ? error.message : 'No se pudo ejecutar prisma db push';
    console.warn(`Aviso: ${details}`);
    console.warn('El backend continuara arrancando; revisa DATABASE_URL si necesitas persistencia real.');
  }
};

const main = () => {
  run(process.execPath, [cleanupScript], { stdio: 'inherit' });
  syncPrismaSchema();
};

main();
