const path = require('node:path');

const { runCommand } = require('./lib/runCommand');

(async () => {
  try {
    await runCommand('pnpm', ['run', `build`], {
      cwd: path.resolve(__dirname, '..'),
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
