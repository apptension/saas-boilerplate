import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning } from '../../lib/docker';

export default class WorkersLint extends Command {
  static description = 'Run all tests inside workers docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, {});
    await assertDockerIsRunning();

    await runCommand('pnpm', ['nx', 'run', 'workers:test']);
  }
}
