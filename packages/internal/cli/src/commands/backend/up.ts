import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import {assertDockerIsRunning, dockerHubLogin} from '../../lib/docker';

export default class BackendUp extends Command {
  static description = 'Starts all backend services';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();
    await dockerHubLogin();

    await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:up']);
  }
}
