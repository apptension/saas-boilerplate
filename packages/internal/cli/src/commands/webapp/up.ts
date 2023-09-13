import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

const tracer = trace.getTracer('webapp');
export default class WebappUp extends Command {
  static description = 'Starts frontend service';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('up', async (span) => {
      await initConfig(this, { requireLocalEnvStage: true });

      await runCommand('pnpm', ['nx', 'run', 'webapp:start']);
      span.end();
    });
  }
}
