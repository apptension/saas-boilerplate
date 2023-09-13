import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

const tracer = trace.getTracer('emails');
export default class EmailsTest extends Command {
  static description = 'Runs all emails tests';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('test', async (span) => {
      await initConfig(this, {});

      await runCommand('pnpm', ['nx', 'run', 'webapp-emails:test']);
      span.end();
    });
  }
}
