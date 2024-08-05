const fs = require('fs-extra');
const path = require('path');

const { runCommand } = require('./lib/runCommand');

const GENERATED_BACKEND_DOCS_PATH = path.resolve(
  __dirname,
  '../docs/generated',
);
const GENERATED_BACKEND_DOCS_INTERNAL_PATH = path.resolve(
  __dirname,
  '../../internal/docs/docs/api-reference/backend/generated',
);

(async () => {
  try {
    // Removing docs directory
    await fs.remove(GENERATED_BACKEND_DOCS_PATH);

    await runCommand(
      'docker',
      [
        'compose',
        'run',
        '--rm',
        '-T',
        '--no-deps',
        'backend',
        'sh',
        '-c',
        'pydoc-markdown',
      ],
      {
        cwd: path.resolve(__dirname, '../../../'),
      },
    );

    // Removing internal docs directory
    await fs.remove(`${GENERATED_BACKEND_DOCS_INTERNAL_PATH}`);

    // Copying docs
    await fs.copy(
      GENERATED_BACKEND_DOCS_PATH,
      GENERATED_BACKEND_DOCS_INTERNAL_PATH,
    );
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
