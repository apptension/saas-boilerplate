import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning } from '../../lib/docker';

export default class BackendUp extends Command {
  static description = 'Stops all backend services';

  static examples = [`$ saas backend down`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();

    await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:down']);
  }
}
