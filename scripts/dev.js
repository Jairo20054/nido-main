const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = path.resolve(__dirname, '..');
const viteCliPath = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');
const envPath = path.join(rootDir, '.env');
const envLocalPath = path.join(rootDir, '.env.local');
const frontendEnvPath = path.join(rootDir, 'frontend', '.env');
const frontendEnvLocalPath = path.join(rootDir, 'frontend', '.env.local');
const decodeJwtRole = (value) => {
  if (typeof value !== 'string' || !value.startsWith('eyJ')) {
    return '';
  }

  try {
    const [, payload] = value.trim().split('.');
    if (!payload) {
      return '';
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );
    return JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf8'))?.role || '';
  } catch (_error) {
    return '';
  }
};
const isPublicSupabaseKey = (value) =>
  typeof value === 'string' &&
  (/^sb_publishable_/i.test(value.trim()) || decodeJwtRole(value) === 'anon');

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

if (fs.existsSync(envPath)) {
  loadEnvFile(envPath, process.env.NODE_ENV !== 'production');
}
if (fs.existsSync(envLocalPath)) {
  loadEnvFile(envLocalPath, process.env.NODE_ENV !== 'production');
}
if (fs.existsSync(frontendEnvPath)) {
  loadEnvFile(frontendEnvPath, process.env.NODE_ENV !== 'production');
}
if (fs.existsSync(frontendEnvLocalPath)) {
  loadEnvFile(frontendEnvLocalPath, process.env.NODE_ENV !== 'production');
}

// Map server-side Supabase env vars to Vite-prefixed vars so the client can access them.
// This allows using SUPABASE_URL / SUPABASE_ANON_KEY in .env while still exposing VITE_* to the frontend.
if (!process.env.VITE_SUPABASE_URL && process.env.SUPABASE_URL) {
  process.env.VITE_SUPABASE_URL = process.env.SUPABASE_URL;
}
if (!process.env.VITE_SUPABASE_ANON_KEY && isPublicSupabaseKey(process.env.SUPABASE_ANON_KEY)) {
  process.env.VITE_SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
}
if (!process.env.VITE_SUPABASE_PUBLISHABLE_KEY && isPublicSupabaseKey(process.env.SUPABASE_PUBLISHABLE_KEY)) {
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
}
if (!process.env.VITE_API_URL && process.env.VITE_API_BASE_URL) {
  process.env.VITE_API_URL = process.env.VITE_API_BASE_URL;
}

let backendProcess = null;
let clientProcess = null;
let clientStarted = false;
let shuttingDown = false;

// Garantiza cierre simetrico del backend y del cliente para no dejar procesos colgados.
const shutdown = (code = 0) => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  if (clientProcess && !clientProcess.killed) {
    clientProcess.kill();
  }

  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }

  process.exit(code);
};

// El frontend arranca solo despues de conocer el puerto real del backend.
const startClient = (port) => {
  if (clientStarted) {
    return;
  }

  clientStarted = true;

  clientProcess = spawn(process.execPath, [viteCliPath, '--config', 'frontend/vite.config.js'], {
    cwd: rootDir,
    env: {
      ...process.env,
      NIDO_API_PORT: String(port),
    },
    stdio: 'inherit',
  });

  clientProcess.on('exit', (code, signal) => {
    shutdown(typeof code === 'number' ? code : signal ? 1 : 0);
  });
};

// El backend se lanza primero porque puede reasignar puerto si el preferido esta ocupado.
backendProcess = spawn(process.execPath, ['backend/src/server.js'], {
  cwd: rootDir,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

const stdoutReader = readline.createInterface({
  input: backendProcess.stdout,
});

// Reenvia la salida del backend y detecta el momento exacto en que ya esta listo para Vite.
stdoutReader.on('line', (line) => {
  console.log(line);

  const match = line.match(/NIDO API corriendo en http:\/\/localhost:(\d+)/i);
  if (match) {
    startClient(Number(match[1]));
  }
});

backendProcess.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
});

backendProcess.on('exit', (code, signal) => {
  shutdown(typeof code === 'number' ? code : signal ? 1 : 0);
});

// Permite detener ambos procesos con Ctrl+C o senales del sistema.
process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
