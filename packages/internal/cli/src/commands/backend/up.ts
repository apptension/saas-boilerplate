import { Command } from '@oclif/core';
import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

export default class BackendUp extends Command {
  static description = 'Starts all backend services';

  static examples = [`$ saas backend up`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });

    await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:up']);
  }
}
