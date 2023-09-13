import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

const tracer = trace.getTracer('webapp');
export default class WebappTest extends Command {
  static description = 'Runs all webapp linters';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('lint', async (span) => {
      const { flags } = await this.parse(WebappTest);
      await initConfig(this, {});

      await runCommand('pnpm', ['nx', 'run', 'webapp:lint']);
      span.end();
    });
  }
}
