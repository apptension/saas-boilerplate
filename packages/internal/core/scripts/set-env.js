#!/usr/bin/env node

const os = require('os');
const { lookpath } = require('lookpath');

const { runCommand } = require('./lib/runCommand');

const ENV_STAGE = process.argv[2];
const AWS_VAULT_PROFILE = process.env.AWS_VAULT_PROFILE;

function getCmd() {
  if (os.platform() === 'win32') {
    return 'cmd.exe';
  }
  return process.env.SHELL;
}

(async () => {
  try {
    if (!ENV_STAGE || ENV_STAGE === 'undefined' || ENV_STAGE === 'local') {
      console.error('Please set --env argument');
      process.exit(1);
    }

    process.env.ENV_STAGE = ENV_STAGE;

    const cmd = getCmd();
    if (await lookpath('aws-vault')) {
      await runCommand('aws-vault', ['exec', AWS_VAULT_PROFILE, '--', cmd]);
    } else {
      await runCommand(cmd, []);
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
