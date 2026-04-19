const { execFileSync } = require('child_process');

const killMatchingProcesses = (command) => {
  try {
    execFileSync('powershell', ['-NoProfile', '-Command', command], {
      stdio: 'ignore',
    });
  } catch (error) {
    if (error && error.code !== 1) {
      throw error;
    }
  }
};

if (process.platform === 'win32') {
  killMatchingProcesses(`
    $processes = Get-CimInstance Win32_Process | Where-Object {
      $cmd = $_.CommandLine
      $cmd -and (
        $cmd -match 'backend/src/server\\.js' -or
        $cmd -match 'nodemon.*backend/src/server\\.js'
      )
    }

    foreach ($process in $processes) {
      try {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
      } catch {}
    }
  `);
} else {
  try {
    execFileSync('pkill', ['-f', 'backend/src/server.js'], { stdio: 'ignore' });
  } catch (error) {
    if (error && error.code !== 1) {
      throw error;
    }
  }
}
