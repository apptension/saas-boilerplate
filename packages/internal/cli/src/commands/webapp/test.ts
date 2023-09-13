import { Command, Flags, Args } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

const tracer = trace.getTracer('webapp');
export default class WebappTest extends Command {
  static description = 'Runs all webapp tests';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {
    watchAll: Flags.string({
      default: 'true',
    }),
  };

  async run(): Promise<void> {
    return tracer.startActiveSpan('test', async (span) => {
      const { flags } = await this.parse(WebappTest);
      await initConfig(this, {});

      await runCommand('pnpm', [
        'nx',
        'run',
        'webapp:test',
        `--watchAll=${flags.watchAll}`,
      ]);
      span.end();
    });
  }
}
