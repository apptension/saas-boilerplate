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

    const { VITE_CONTENTFUL_SPACE, VITE_CONTENTFUL_ENV, VITE_CONTENTFUL_TOKEN } = process.env;

    if (!VITE_CONTENTFUL_SPACE || VITE_CONTENTFUL_SPACE === '<CHANGE_ME>') {
      console.log('VITE_CONTENTFUL_SPACE has not been set. Skipping...');
      return;
    }

    if (!VITE_CONTENTFUL_ENV || VITE_CONTENTFUL_ENV === '<CHANGE_ME>') {
      console.log('VITE_CONTENTFUL_ENV has not been set. Skipping...');
      return;
    }

    if (!VITE_CONTENTFUL_TOKEN || VITE_CONTENTFUL_TOKEN === '<CHANGE_ME>') {
      console.log('VITE_CONTENTFUL_TOKEN has not been set. Skipping...');
      return;
    }

    const CONTENTFUL_URL = `https://graphql.contentful.com/content/v1/spaces/${VITE_CONTENTFUL_SPACE}/environments/${VITE_CONTENTFUL_ENV}?access_token=${VITE_CONTENTFUL_TOKEN}`;

    await fs.remove('./src/contentful/__generated/types.ts');
    await fs.remove('./src/contentful/__generated/hooks.ts');

    await runCommand('pnpm', [
      'rover',
      'graph',
      'introspect',
      CONTENTFUL_URL,
      '--output',
      'graphql/schema/contentful.graphql',
    ]);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
