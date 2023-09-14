import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';
import { BaseCommand } from '../baseCommand';

export default class Lint extends BaseCommand<typeof Lint> {
  static description = 'Lint all projects';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, {});

    await runCommand('pnpm', [
      'nx',
      'run-many',
      '--output-style=stream',
      '--target=lint',
    ]);
  }
}
