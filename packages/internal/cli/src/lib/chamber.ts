import { CLIError } from '@oclif/errors';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { lookpath } from 'lookpath';

const exec = promisify(childProcess.exec);

export const isChamberInstalled = async () => {
  return await lookpath('chamber');
};

export const assertChamberInstalled = async () => {
  const isInstalled = await isChamberInstalled();
  if (!isInstalled) {
    throw new CLIError(`chamber executable not found. Make sure it is installed in the system and re-run the
    command. Go to https://github.com/segmentio/chamber and learn how to install and configure it.`);
  }
};
