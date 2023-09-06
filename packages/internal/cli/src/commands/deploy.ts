import { Command, Flags } from '@oclif/core';

import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';

export default class Deploy extends Command {
  static description = 'Starts both backend and frontend';

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
  }
}
