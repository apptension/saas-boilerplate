import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import {assertDockerIsRunning, dockerHubLogin} from '../../lib/docker';

export default class BackendBlack extends Command {
  static description = 'Run black inside backend docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();
    await dockerHubLogin();

    await runCommand('docker', [
      'compose',
      'run',
      '--rm',
      '-T',
      '--no-deps',
      'backend',
      'black',
      '--config=pyproject.toml',
      '.',
    ]);
  }
}
