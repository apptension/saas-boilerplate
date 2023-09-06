import { Command } from '@oclif/core';
import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

export default class BackendBuild extends Command {
  static description = 'Starts all backend services';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, {});

    await runCommand('pnpm', ['nx', 'run', 'backend:test']);
  }
}
