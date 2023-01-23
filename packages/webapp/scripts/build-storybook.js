const { spawn } = require('child_process');

const TIMEOUT_THRESHOLD = 2 * 60_000; // 2 minutes

const childProcess = spawn('build-storybook', { stdio: 'inherit' });

childProcess.on('exit', (code) => process.exit(code));

// storybook stucks on build if it fails to import any module,
// so it is required to handle the timeout manually
setTimeout(() => {
  childProcess.kill();
  process.exit(1);
}, TIMEOUT_THRESHOLD);
