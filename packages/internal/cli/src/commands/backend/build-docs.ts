import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

export default class BackendBuild extends Command {
  static description = 'Build backend docs and put results into docs package';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, {});

    await runCommand('pnpm', ['nx', 'run', 'backend:build-docs']);
  }
}
