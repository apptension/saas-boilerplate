import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning } from '../../lib/docker';

export default class BackendRuff extends Command {
  static description = 'Run ruff inside backend docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();

    await runCommand('docker', [
      'compose',
      'run',
      '--rm',
      '-T',
      '--no-deps',
      'backend',
      'ruff',
      'check',
      '.',
    ]);
  }
}
