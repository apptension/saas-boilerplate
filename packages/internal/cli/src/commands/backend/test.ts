import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

const tracer = trace.getTracer('backend');
export default class BackendTest extends Command {
  static description = 'Runs all backend tests in docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('test', async (span) => {
      await initConfig(this, {});

      await runCommand('pnpm', ['nx', 'run', 'backend:test']);
      span.end();
    });
  }
}
