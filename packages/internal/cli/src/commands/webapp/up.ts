import { Command } from '@oclif/core';
import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

export default class WebappUp extends Command {
  static description = 'Starts frontend service';

  static examples = [`$ saas webapp up`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });

    await runCommand('pnpm', ['nx', 'run', 'webapp:start']);
  }
}
