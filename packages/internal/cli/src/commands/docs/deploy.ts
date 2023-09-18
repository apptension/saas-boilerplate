import { Flags } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class DocsDeploy extends BaseCommand<typeof DocsDeploy> {
  static description = 'Deploys docs to AWS using previously built artifact';

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
    const { flags } = await this.parse(DocsDeploy);
    await initConfig(this, { requireAws: true });

    const verb = flags.diff ? 'diff' : 'deploy';
    await runCommand('pnpm', ['nx', 'run', `docs:${verb}`]);
  }
}
