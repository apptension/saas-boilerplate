import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class BackendTest extends BaseCommand<typeof BackendTest> {
  static description = 'Runs all backend tests in docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, {});

    await runCommand('pnpm', ['nx', 'run', 'backend:test']);
  }
}
