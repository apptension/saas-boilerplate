import { CLIError } from '@oclif/errors';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { lookpath } from 'lookpath';

const exec = promisify(childProcess.exec);

export const isAwsVaultInstalled = async () => {
  return await lookpath('aws-vault');
};

export const assertAwsVaultInstalled = async () => {
  const isInstalled = await isAwsVaultInstalled();
  if (!isInstalled) {
    throw new CLIError(`aws-vault executable not found. Make sure it is installed in the system and re-run the
    command. Go to https://github.com/99designs/aws-vault and learn how to install and configure it.`);
  }
};
