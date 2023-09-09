import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';

export default class WorkersShell extends Command {
  static description = 'Runs shell inside workers docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { rootPath } = await initConfig(this, {});
    await assertDockerIsRunning();
    await dockerHubLogin();

    await runCommand(
      'docker',
      ['compose', 'run', '--rm', '-T', 'workers', 'bash'],
      {
        cwd: rootPath,
      }
    );
  }
}
