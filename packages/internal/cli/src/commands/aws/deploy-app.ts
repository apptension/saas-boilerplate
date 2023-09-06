import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

export default class DeployApp extends Command {
  static description = 'Get currently selected ENV stage';

  static examples = [`$ saas aws bootstrap`];

  async run(): Promise<void> {
    await initConfig(this, { requireAws: true });

    await runCommand('pnpm', ['nx', 'run', 'backend:deploy']);
    await runCommand('pnpm', ['nx', 'run', 'workers:deploy']);
    await runCommand('pnpm', ['nx', 'run', 'webapp:deploy']);
  }
}
