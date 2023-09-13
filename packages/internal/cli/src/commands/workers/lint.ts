import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';

const tracer = trace.getTracer('workers');

export default class WorkersLint extends Command {
  static description = 'Run all linters inside workers docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('lint', async (span) => {
      await initConfig(this, {});
      await assertDockerIsRunning();
      await dockerHubLogin();

      await runCommand('pnpm', ['nx', 'run', 'workers:lint']);
      span.end();
    });
  }
}
