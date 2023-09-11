import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { dockerHubLogin } from '../../lib/docker';

const tracer = trace.getTracer('backend');

export default class BackendBuild extends Command {
  static description = 'Build backend docs and put results into docs package';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('build-docs', async (span) => {
      await initConfig(this, {});
      await dockerHubLogin();

      await runCommand('pnpm', ['nx', 'run', 'backend:build-docs']);
      span.end();
    });
  }
}
