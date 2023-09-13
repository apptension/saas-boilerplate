import { Command, Flags } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

const tracer = trace.getTracer('webapp');
export default class WebappDeploy extends Command {
  static description = 'Deploys webapp to AWS using previously built artifact';

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
      const { flags } = await this.parse(WebappDeploy);
      await initConfig(this, { requireAws: true });

      const verb = flags.diff ? 'diff' : 'deploy';
      await runCommand('pnpm', ['nx', 'run', `webapp:${verb}`]);
      span.end();
    });
  }
}
