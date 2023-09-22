import { Flags } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class WebappTypeCheck extends BaseCommand<
  typeof WebappTypeCheck
> {
  static description = 'Runs all webapp linters';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {
    includeLibs: Flags.boolean({
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(WebappTypeCheck);
    await initConfig(this, {});

    if (flags.includeLibs) {
      await runCommand('pnpm', [
        'nx',
        'run-many',
        '--target=type-check',
        '--projects=webapp*',
      ]);
    } else {
      await runCommand('pnpm', ['nx', 'run', 'webapp:type-check']);
    }
  }
}
