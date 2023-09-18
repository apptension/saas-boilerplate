import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class WebappLint extends BaseCommand<typeof WebappLint> {
  static description = 'Runs all webapp linters';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { flags } = await this.parse(WebappLint);
    await initConfig(this, {});

    await runCommand('pnpm', ['nx', 'run', 'webapp:lint']);
  }
}
