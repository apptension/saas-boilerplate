const path = require('path');
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const { default: defaultTaskRunner } = require('nx/tasks-runners/default');
const dotenv = require('dotenv');

async function loadVersionEnv() {
  if (process.env.VERSION) {
    return;
  }

  const scriptPath = path.join(__dirname, './scripts/get-version.sh');
  try {
    const { stdout: version } = await exec(`bash ${scriptPath}`);
    process.env.VERSION = version.trim();
  } catch {}
}

async function loadStageEnv() {
  if (!process.env.ENV_STAGE || process.env.ENV_STAGE === 'local') {
    return;
  }

  const dotEnvPath = path.join(
    __dirname,
    `../../../.env.${process.env.ENV_STAGE}`
  );
  console.log(`Loading env from ${dotEnvPath}`);
  dotenv.config({ path: dotEnvPath });
}

module.exports = async (...args) => {
  await loadStageEnv();
  await loadVersionEnv();
  return defaultTaskRunner(...args);
};
