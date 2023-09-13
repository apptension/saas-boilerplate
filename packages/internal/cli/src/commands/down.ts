import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../lib/docker';

const tracer = trace.getTracer('global');
export default class Down extends Command {
  static description = 'Starts both backend and frontend';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('down', async (span) => {
      await initConfig(this, { requireLocalEnvStage: true });
      await assertDockerIsRunning();

      await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:down']);
      span.end();
    });
  }
}
