const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

const rootDir = path.resolve(__dirname, '..');
const viteCliPath = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

let backendProcess = null;
let clientProcess = null;
let clientStarted = false;
let shuttingDown = false;

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

const startClient = (port) => {
  if (clientStarted) {
    return;
  }

  clientStarted = true;

  clientProcess = spawn(process.execPath, [viteCliPath], {
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

backendProcess = spawn(process.execPath, ['backend/src/server.js'], {
  cwd: rootDir,
  env: process.env,
  stdio: ['ignore', 'pipe', 'pipe'],
});

const stdoutReader = readline.createInterface({
  input: backendProcess.stdout,
});

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

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
