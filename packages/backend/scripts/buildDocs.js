const fs = require('fs-extra');

const { runCommand } = require('./lib/runCommand');

const GENERATED_BACKEND_DOCS_PATH = 'docs/generated';
const GENERATED_BACKEND_DOCS_INTERNAL_PATH =
  '../internal/docs/docs/api-reference/backend';

(async () => {
  try {
    // Removing docs directory
    await fs.remove(GENERATED_BACKEND_DOCS_PATH);

    if (process.env.CI === 'true') {
      process.env.COMPOSE_FILE =
        '../../docker-compose.yml:../../docker-compose.ci.yml';
    } else {
      process.env.COMPOSE_FILE =
        '../../docker-compose.yml:../../docker-compose.local.yml';
    }

    await runCommand('docker-compose', [
      'run',
      '--rm',
      '-T',
      '--no-deps',
      'backend',
      'sh',
      '-c',
      'pydoc-markdown',
    ]);

    // Removing internal docs directory
    await fs.remove(`${GENERATED_BACKEND_DOCS_INTERNAL_PATH}/generated`);

    // Copying docs
    await fs.copy(
      GENERATED_BACKEND_DOCS_PATH,
      GENERATED_BACKEND_DOCS_INTERNAL_PATH
    );
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
