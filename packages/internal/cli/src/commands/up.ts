import { Command } from '@oclif/core';

import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';
import { assertDockerIsRunning } from '../lib/docker';

export default class Up extends Command {
  static description = 'Starts both backend and frontend';

  static examples = [`$ saas up`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();

    await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:up']);
    await runCommand('pnpm', ['nx', 'run', 'webapp:start']);
  }
}
