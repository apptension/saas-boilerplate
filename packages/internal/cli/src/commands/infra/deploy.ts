import { Command, Flags } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

export default class InfraDeploy extends Command {
  static description =
    'Deploy infrastructure of a currently selected environment stage to AWS account';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {
    diff: Flags.boolean({
      default: false,
      description:
        'Perform a dry run and list all changes that would be applied',
      required: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(InfraDeploy);
    await initConfig(this, { requireAws: true });

    const verb = flags.diff ? 'diff' : 'deploy';
    await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:global`]);
    await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:main`]);
    await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:db`]);
    await runCommand('pnpm', ['nx', 'run', `infra-functions:${verb}`]);
    await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:ci`]);
    await runCommand('pnpm', ['nx', 'run', `infra-shared:${verb}:components`]);
  }
}
