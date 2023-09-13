import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../lib/docker';

const tracer = trace.getTracer('global');
export default class Up extends Command {
  static description = 'Starts both backend and frontend';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('up', async (span) => {
      await initConfig(this, { requireLocalEnvStage: true });
      await assertDockerIsRunning();
      await dockerHubLogin();

      await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:up']);
      await runCommand('pnpm', ['nx', 'run', 'webapp:start']);
      span.end();
    });
  }
}
