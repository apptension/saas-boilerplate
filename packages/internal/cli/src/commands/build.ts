import { Command, Flags } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';
import { dockerHubLogin } from '../lib/docker';

const tracer = trace.getTracer('global');

export default class Build extends Command {
  static description = 'Build all deployable artifacts';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('build', async (span) => {
      await initConfig(this, { requireAws: true });
      await dockerHubLogin();

      await runCommand('pnpm', ['nx', 'run', 'backend:build']);
      await runCommand('pnpm', ['nx', 'run', 'webapp:build']);
      await runCommand('pnpm', ['nx', 'run', 'workers:build']);
      span.end();
    });
  }
}
