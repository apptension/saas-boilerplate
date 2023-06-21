const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { default: defaultTaskRunner } = require('nx/tasks-runners/default');
const dotenv = require('dotenv');
const { validateStageEnv } = require('./stage-env-validator');

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

  const { stdout: chamberOutput } = await exec(
    `chamber export ${process.env.ENV_STAGE} --format dotenv`
  );

  const parsed = dotenv.parse(Buffer.from(chamberOutput));
  dotenv.populate(process.env, parsed);

  await validateStageEnv();
}

module.exports = async (...args) => {
  await loadStageEnv();

  await loadVersionEnv();
  return defaultTaskRunner(...args);
};
