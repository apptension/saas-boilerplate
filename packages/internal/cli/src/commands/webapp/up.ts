import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class WebappUp extends BaseCommand<typeof WebappUp> {
  static description = 'Starts frontend service';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });

    await runCommand('pnpm', ['nx', 'run', 'webapp:start']);
  }
}
