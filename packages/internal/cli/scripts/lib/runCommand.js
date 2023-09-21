const { spawn } = require('node:child_process');

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, args, {
      stdio: 'inherit',
      ...options,
    });

    cmd.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(`"${command} ${args.join(' ')}" failed with code ${code}`),
        );
      } else {
        resolve();
      }
    });
  });
}

module.exports = { runCommand };
