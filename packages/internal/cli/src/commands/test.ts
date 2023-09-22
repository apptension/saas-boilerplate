import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';
import { BaseCommand } from '../baseCommand';

export default class Test extends BaseCommand<typeof Test> {
  static description = 'Test all projects';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, {});

    await runCommand('pnpm', [
      'nx',
      'run-many',
      '--output-style=stream',
      '--target=test',
    ]);
  }
}
