import { Command, ux } from '@oclif/core';
import * as util from 'node:util';
import { exec as _exec } from 'node:child_process';

import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../lib/docker';
import { BaseCommand } from '../baseCommand';

const exec = util.promisify(_exec);

type Publisher = {
  URL: string;
  PublishedPort: number;
};

type DockerComposePsResult = Array<{
  Project: string;
  Service: string;
  Publishers: Array<Publisher> | null;
}>;

async function getBackendEndpoint(context: Command) {
  const expectedBackendPort = 5001;
  const { stdout: psResultStr } = await exec('docker compose ps --format=json');
  let psResult: DockerComposePsResult;
  try {
    psResult = JSON.parse(psResultStr) as DockerComposePsResult;
  } catch (e) {
    // new docker returns JSONL instead of JSON so need to filter empty lines and parse every line separately
    psResult = psResultStr
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '')
      .map((v) => JSON.parse(v)) as DockerComposePsResult;
  }

  const backendContainerExists = psResult.some(
    ({ Service: service }) => service === 'backend',
  );

  if (!backendContainerExists) {
    context.error('running backend container not found');
  }

  const hasExpectedPort = ({ PublishedPort }: Publisher) =>
    PublishedPort === expectedBackendPort;
  const backendContainer = psResult.find(
    ({ Service: service, Publishers: publishers }) =>
      service === 'backend' && publishers?.some(hasExpectedPort),
  );

  if (!backendContainer) {
    context.error(
      `backend container does not expose expected port ${expectedBackendPort}. Web app will not be able to send requests
to API. Make sure that backend service in docker-compose.yml exposes ${expectedBackendPort}. Read more on
docker compose networking in official documentation: https://docs.docker.com/compose/networking/`,
    );
  }

  const publisher = backendContainer.Publishers?.find(hasExpectedPort);
  return `http://${publisher?.URL}:${publisher?.PublishedPort}`;
}

type WaitForBackendOptions = {
  url: string;
  retryCount: number;
  stepTime?: number;
};

async function waitForBackend(
  context: Command,
  { url, stepTime = 500, retryCount }: WaitForBackendOptions,
) {
  ux.action.start(
    'Backend server is not ready yet.\n You can run `docker compose logs backend -f` ' +
      'to see logs from backend container.\n Waiting',
  );

  for (let i = 0; i < retryCount; i += 1) {
    try {
      await fetch(url, { method: 'GET' });
      ux.action.stop();
      return;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, stepTime));
    }
  }

  context.error(
    'Timeout: Backend dev server failed to start. Run `docker compose logs backend -f` to understand why it' +
      'happened',
  );
}

export default class Up extends BaseCommand<typeof Up> {
  static description = 'Starts both backend and frontend';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();
    await dockerHubLogin();

    await runCommand('pnpm', ['saas', 'emails', 'build']);
    await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:up']);
    const backendEndpoint = await getBackendEndpoint(this);
    await waitForBackend(this, { url: backendEndpoint, retryCount: 200 });
    await runCommand('pnpm', ['nx', 'run', 'webapp:start']);
  }
}
