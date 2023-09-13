import { Command, Flags } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';

const tracer = trace.getTracer('global');
export default class Deploy extends Command {
  static description = 'Deploy all previously built artifacts to AWS';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {
    diff: Flags.boolean({
      default: false,
      description:
        'Perform a dry run and list all changes that would be applied in AWS account',
      required: false,
    }),
  };

  async run(): Promise<void> {
    return tracer.startActiveSpan('deploy', async (span) => {
      const { flags } = await this.parse(Deploy);
      await initConfig(this, { requireAws: true });

      const verb = flags.diff ? 'diff' : 'deploy';
      await runCommand('pnpm', [
        'nx',
        'run-many',
        '--output-style=stream',
        `--target=${verb}`,
        '--projects=backend,workers,webapp',
      ]);
      span.end();
    });
  }
}
