const { spawn } = require('node:child_process');

function runCommand(command, args, options) {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, args, options);

    process.stdin.pipe(cmd.stdin);

    cmd.stdout.on('data', (data) => {
      process.stdout.write(data);
    });

    cmd.stderr.on('data', (data) => {
      process.stdout.write(data);
    });

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
