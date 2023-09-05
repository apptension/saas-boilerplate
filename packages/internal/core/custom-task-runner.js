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

  const scriptPath = path.join(__dirname, './scripts/get-version.js');
  try {
    const { stdout: version } = await exec(`node ${scriptPath}`);
    process.env.VERSION = version.trim();
  } catch {}
}

async function loadStageEnv(shouldValidate = true) {
  if (!process.env.ENV_STAGE || process.env.ENV_STAGE === 'local') {
    return;
  }

  const { stdout: chamberOutput } = await exec(
    `chamber export ${process.env.ENV_STAGE} --format dotenv`
  );

  const parsed = dotenv.parse(Buffer.from(chamberOutput));
  dotenv.populate(process.env, parsed);

  if (shouldValidate) {
    await validateStageEnv();
  }
}

const noValidateTasks = ['tools:bootstrap-infra', 'infra-shared:bootstrap'];

module.exports = async (...args) => {
  const taskId = args[0]?.[0]?.id;
  const shouldValidateEnv = !noValidateTasks.includes(taskId);
  await loadStageEnv(shouldValidateEnv);

  await loadVersionEnv();
  return defaultTaskRunner(...args);
};
