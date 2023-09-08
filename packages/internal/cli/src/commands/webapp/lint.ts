import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

export default class WebappTest extends Command {
  static description = 'Runs all webapp linters';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { flags } = await this.parse(WebappTest);
    await initConfig(this, {});

    await runCommand('pnpm', ['nx', 'run', 'webapp:lint']);
  }
}
