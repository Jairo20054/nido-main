const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const schemaPath = path.join(rootDir, 'backend', 'prisma', 'schema.prisma');
const prismaClientDir = path.join(rootDir, 'node_modules', '.prisma', 'client');
const prismaEngineModuleName = 'query_engine-windows.dll.node';
const prismaTempPattern = /^query_engine-windows\.dll\.node\.tmp\d+$/u;
const envPaths = [path.join(rootDir, '.env'), path.join(rootDir, 'backend', '.env')];

const cliArgs = new Set(process.argv.slice(2));
const shouldCheckOnly = cliArgs.has('--check');

const log = (message) => console.log(`[prisma-safe] ${message}`);
const warn = (message) => console.warn(`[prisma-safe] ${message}`);
const error = (message) => console.error(`[prisma-safe] ${message}`);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isOneDrivePath = (targetPath) => /(^|[\\/])OneDrive([\\/]|$)/iu.test(targetPath);

const loadEnvFiles = () => {
  try {
    const dotenv = require('dotenv');
    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath, override: process.env.NODE_ENV !== 'production' });
      }
    }
  } catch (_error) {
    // dotenv may not be available during partial installs; Prisma will report the real issue later.
  }
};

const runPowerShellJson = (command) => {
  const output = execFileSync(
    'powershell',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command],
    {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  ).trim();

  if (!output) {
    return [];
  }

  return JSON.parse(output);
};

const escapeForRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

const getNodeProcesses = () => {
  if (process.platform !== 'win32') {
    return [];
  }

  const command = `
    $currentPid = ${process.pid}
    $processes = Get-CimInstance Win32_Process |
      Where-Object {
        $_.Name -match '^(node|npm)\\.exe$' -and
        $_.ProcessId -ne $currentPid -and
        $_.CommandLine
      } |
      Select-Object ProcessId, Name, CommandLine

    @($processes) | ConvertTo-Json -Compress
  `;

  const result = runPowerShellJson(command);
  return Array.isArray(result) ? result : [result];
};

const isProjectRelatedProcess = (processInfo) => {
  const commandLine = String(processInfo.CommandLine || '');
  const normalized = commandLine.replace(/\\/gu, '/');
  const normalizedRootDir = rootDir.replace(/\\/gu, '/');

  return (
    normalized.includes(normalizedRootDir) ||
    /backend\/src\/server\.js/iu.test(normalized) ||
    /nodemon.*backend\/src\/server\.js/iu.test(normalized) ||
    /scripts\/dev\.js/iu.test(normalized) ||
    /npm-cli\.js".*run dev/iu.test(normalized)
  );
};

const getProjectNodeProcesses = () => getNodeProcesses().filter(isProjectRelatedProcess);

const getLockingEngineProcesses = () => {
  if (process.platform !== 'win32') {
    return [];
  }

  const output = spawnSync(
    'cmd.exe',
    ['/d', '/s', '/c', `tasklist /m ${prismaEngineModuleName} /fo csv /nh`],
    {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  const stdout = output.stdout ? output.stdout.trim() : '';
  if (!stdout || /No tasks are running/i.test(stdout) || /INFO:/i.test(stdout)) {
    return [];
  }

  return stdout
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.replace(/^"|"$/gu, '').split('","');
      return {
        imageName: parts[0],
        processId: Number(parts[1]),
        modules: parts[2] || '',
      };
    })
    .filter((item) => Number.isInteger(item.processId));
};

const getProcessesToStop = () => {
  if (process.platform !== 'win32') {
    return [];
  }

  const projectProcesses = getNodeProcesses();
  const lockingProcessIds = new Set(getLockingEngineProcesses().map((item) => item.processId));

  return projectProcesses.filter((processInfo) => {
    return (
      isProjectRelatedProcess(processInfo) &&
      (
      lockingProcessIds.has(processInfo.ProcessId) ||
      /backend\/src\/server\.js/iu.test(String(processInfo.CommandLine || '').replace(/\\/gu, '/')) ||
      /nodemon.*backend\/src\/server\.js/iu.test(String(processInfo.CommandLine || '').replace(/\\/gu, '/')) ||
      /scripts\/dev\.js/iu.test(String(processInfo.CommandLine || '').replace(/\\/gu, '/')) ||
      /npm-cli\.js".*run dev/iu.test(String(processInfo.CommandLine || '').replace(/\\/gu, '/'))
      )
    );
  });
};

const stopWindowsProcessIds = (processIds) => {
  if (process.platform !== 'win32' || processIds.length === 0) {
    return;
  }

  const pidList = processIds.join(',');
  execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-Command',
      `
        $processIds = @(${pidList})
        foreach ($processId in $processIds) {
          try {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
          } catch {}
        }
      `,
    ],
    {
      cwd: rootDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
};

const waitForProcessExit = async (processIds, timeoutMs = 15000) => {
  if (process.platform !== 'win32' || processIds.length === 0) {
    return true;
  }

  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const stillRunning = new Set(getProjectNodeProcesses().map((item) => item.ProcessId));
    const openEngineProcesses = new Set(getLockingEngineProcesses().map((item) => item.processId));
    const pending = processIds.filter((processId) => stillRunning.has(processId) || openEngineProcesses.has(processId));

    if (pending.length === 0) {
      return true;
    }

    await sleep(500);
  }

  return false;
};

const removeStalePrismaTemps = () => {
  if (!fs.existsSync(prismaClientDir)) {
    return [];
  }

  const removed = [];

  for (const fileName of fs.readdirSync(prismaClientDir)) {
    if (!prismaTempPattern.test(fileName)) {
      continue;
    }

    const filePath = path.join(prismaClientDir, fileName);

    try {
      fs.rmSync(filePath, { force: true });
      removed.push(fileName);
    } catch (removeError) {
      warn(`No se pudo borrar temporal de Prisma: ${fileName} (${removeError.message})`);
    }
  }

  return removed;
};

const runPrismaGenerate = () => {
  const prismaCliPath = require.resolve('prisma/build/index.js');
  const result = spawnSync(process.execPath, [prismaCliPath, 'generate', '--schema', schemaPath], {
    cwd: rootDir,
    env: process.env,
    stdio: 'inherit',
  });

  if (typeof result.status === 'number') {
    process.exit(result.status);
  }

  process.exit(1);
};

const printDiagnostics = () => {
  const locking = getLockingEngineProcesses();
  const projectProcesses = getProjectNodeProcesses();
  const tempFiles = fs.existsSync(prismaClientDir)
    ? fs.readdirSync(prismaClientDir).filter((fileName) => prismaTempPattern.test(fileName))
    : [];

  log(`workspace=${rootDir}`);
  log(`onedrive=${isOneDrivePath(rootDir) ? 'yes' : 'no'}`);
  log(`project_node_processes=${projectProcesses.length}`);
  log(`engine_locking_processes=${locking.length}`);
  log(`stale_prisma_temp_files=${tempFiles.length}`);

  for (const processInfo of projectProcesses) {
    log(`pid=${processInfo.ProcessId} cmd=${processInfo.CommandLine}`);
  }

  for (const processInfo of locking) {
    log(`engine-lock pid=${processInfo.processId} image=${processInfo.imageName}`);
  }
};

const main = async () => {
  loadEnvFiles();

  if (process.platform === 'win32' && isOneDrivePath(rootDir)) {
    warn(
      'Este proyecto esta dentro de OneDrive. Para desarrollo continuo con Prisma en Windows, la ubicacion recomendada es una ruta local no sincronizada, por ejemplo C:\\NIDO.'
    );
  }

  if (shouldCheckOnly) {
    printDiagnostics();
    process.exit(0);
  }

  if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
    warn('DATABASE_URL/DIRECT_URL no estan configuradas; se omite prisma generate en postinstall.');
    warn('Despues de crear .env desde .env.example ejecuta: npm run prisma:generate');
    process.exit(0);
  }

  if (process.platform === 'win32') {
    const processesToStop = getProcessesToStop();

    if (processesToStop.length > 0) {
      log('Se detectaron procesos Node del proyecto que pueden bloquear Prisma:');
      for (const processInfo of processesToStop) {
        log(`pid=${processInfo.ProcessId} cmd=${processInfo.CommandLine}`);
      }

      stopWindowsProcessIds(processesToStop.map((processInfo) => processInfo.ProcessId));

      const released = await waitForProcessExit(
        processesToStop.map((processInfo) => processInfo.ProcessId)
      );

      if (!released) {
        error('No se pudieron liberar todos los procesos que bloqueaban Prisma. Cierra las terminales activas del proyecto y reintenta.');
        process.exit(1);
      }
    }

    const removedTemps = removeStalePrismaTemps();
    if (removedTemps.length > 0) {
      log(`Se limpiaron ${removedTemps.length} temporales de Prisma.`);
    }
  }

  runPrismaGenerate();
};

main().catch((runError) => {
  error(runError && runError.message ? runError.message : String(runError));
  process.exit(1);
});
