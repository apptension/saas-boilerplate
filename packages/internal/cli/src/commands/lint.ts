import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';

const tracer = trace.getTracer('global');

export default class Lint extends Command {
  static description = 'Lint all projects';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('lint', async (span) => {
      await initConfig(this, {});

      await runCommand('pnpm', [
        'nx',
        'run-many',
        '--output-style=stream',
        '--target=lint',
      ]);
      span.end();
    });
  }
}
