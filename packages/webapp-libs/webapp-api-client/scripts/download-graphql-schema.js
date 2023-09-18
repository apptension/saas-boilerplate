const { spawn } = require('child_process');
const fs = require('fs-extra');
const dotenv = require('dotenv');

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, args, { stdio: 'inherit' });

    cmd.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`"${command} ${args.join(' ')}" failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

(async () => {
  try {
    dotenv.config({ path: '../../webapp/.env' });

    const apiUrl = 'http://localhost:5001/api/graphql/';

    await fs.remove('./src/graphql/__generated/types.ts');
    await fs.remove('./src/graphql/__generated/hooks.ts');

    await runCommand('pnpm', ['rover', 'graph', 'introspect', apiUrl, '--output', 'graphql/schema/api.graphql']);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
