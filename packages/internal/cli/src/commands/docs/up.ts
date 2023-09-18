import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class DocsUp extends BaseCommand<typeof DocsUp> {
  static description = 'Starts local docusaurus server';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });

    await runCommand('pnpm', ['nx', 'run', 'docs:start']);
  }
}
