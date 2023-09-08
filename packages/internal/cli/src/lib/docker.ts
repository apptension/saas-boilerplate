import { CLIError } from '@oclif/errors';
import * as childProcess from 'child_process';
import { promisify } from 'util';

const exec = promisify(childProcess.exec);

export const assertDockerIsRunning = async () => {
  try {
    await exec('docker info');
    return true;
  } catch (err) {
    throw new CLIError(`It seems that docker daemon is not running. Here's a result from \`docker info\` command:

${err}
    `);
  }
};

export const dockerHubLogin = async () => {
  const username = process.env.DOCKER_USERNAME;
  const password = process.env.DOCKER_PASSWORD;
  if (username && password) {
    await exec(`docker login -u "${username}" -p "${password}"`);
  }
};
