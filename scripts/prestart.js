const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const cleanupScript = path.join(rootDir, 'scripts', 'cleanup-nido-processes.js');
const envPath = path.join(rootDir, '.env');
const exampleEnvPath = path.join(rootDir, '.env.example');
const prismaBin = path.join(rootDir, 'node_modules', '.bin', 'prisma');
const prismaSchemaPath = 'backend/prisma/schema.prisma';

const loadEnvFile = (targetPath, override = false) => {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: targetPath, override });
    return;
  } catch (error) {
    if (error?.code !== 'MODULE_NOT_FOUND') {
      throw error;
    }
  }

  const content = fs.readFileSync(targetPath, 'utf8');

  for (const rawLine of content.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || (!override && process.env[key] !== undefined)) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
};

// Carga primero el entorno real y usa el ejemplo solo como fallback para desarrollo local.
const loadEnvironment = () => {
  if (fs.existsSync(envPath)) {
    loadEnvFile(envPath, false);
  }

  if (process.env.NODE_ENV !== 'production' && !process.env.DATABASE_URL && fs.existsSync(exampleEnvPath)) {
    loadEnvFile(exampleEnvPath, false);
  }
};

// Wrapper sincrono para ejecutar utilidades previas al arranque con manejo uniforme de errores.
const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
    shell: options.shell || false,
    env: {
      ...process.env,
      ...options.env,
    },
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
    const error = new Error(details || `${command} ${args.join(' ')} failed`);
    error.code = result.status;
    throw error;
  }

  return result;
};

// Intenta alinear el esquema Prisma antes de levantar el backend sin bloquear el flujo local.
const syncPrismaSchema = () => {
  loadEnvironment();

  if (process.env.NODE_ENV === 'production') {
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL no esta configurada en .env ni .env.example; se omite prisma db push.');
    return;
  }

  try {
    const prismaCommand = process.platform === 'win32' ? 'cmd.exe' : prismaBin;
    const prismaArgs =
      process.platform === 'win32'
        ? ['/d', '/c', `npm exec -- prisma db push --schema ${prismaSchemaPath} --skip-generate`]
        : ['db', 'push', '--schema', prismaSchemaPath, '--skip-generate'];

    run(prismaCommand, prismaArgs, {
      env: {
        DATABASE_URL: process.env.DATABASE_URL,
      },
    });
  } catch (error) {
    const details = error && error.message ? error.message : 'No se pudo ejecutar prisma db push';
    console.warn(`Aviso: ${details}`);
    console.warn('El backend continuara arrancando; revisa la conexion a PostgreSQL si necesitas persistencia real.');
  }
};

// El prestart limpia procesos colgados y luego sincroniza la base para reducir friccion local.
const main = () => {
  run(process.execPath, [cleanupScript], { stdio: 'inherit' });
  syncPrismaSchema();
};

main();
