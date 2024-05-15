import { Errors } from '@oclif/core';
import * as childProcess from 'child_process';
import { promisify } from 'util';
import { trace } from '@opentelemetry/api';

const { CLIError } = Errors;

const tracer = trace.getTracer('docker');
const exec = promisify(childProcess.exec);

export const assertDockerIsRunning = async () => {
  return tracer.startActiveSpan('assertDockerIsRunning', async (span) => {
    try {
      await exec('docker info');
      span.end();
      return true;
    } catch (err) {
      throw new CLIError(`It seems that docker daemon is not running. Here's a result from \`docker info\` command:

${err}
    `);
    }
  });
};

export const dockerHubLogin = async () => {
  const username = process.env.DOCKER_USERNAME;
  const password = process.env.DOCKER_PASSWORD;
  if (username && password) {
    return tracer.startActiveSpan('dockerHubLogin', async (span) => {
      await exec(`docker login -u "${username}" -p "${password}"`);
      span.end();
    });
  }
};
