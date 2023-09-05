const { spawn } = require('node:child_process');

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, args, { stdio: 'inherit' });

    cmd.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(`"${command} ${args.join(' ')}" failed with code ${code}`)
        );
      } else {
        resolve();
      }
    });
  });
}

module.exports = { runCommand };
