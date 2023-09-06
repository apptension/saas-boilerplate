import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning } from '../../lib/docker';

export default class BackendMakemigrations extends Command {
  static description =
    'Shorthand to generate django backend migrations. If you need more control use ' +
    '`saas backend shell` and run `./manage.py makemigrations` manually';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();

    await runCommand('docker', [
      'compose',
      'run',
      '--rm',
      '-T',
      'backend',
      'bash',
      '-c',
      `python ./manage.py makemigrations`,
    ]);
  }
}
