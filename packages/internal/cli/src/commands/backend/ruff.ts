import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';
import { BaseCommand } from '../../baseCommand';

export default class BackendRuff extends BaseCommand<typeof BackendRuff> {
  static description = 'Run ruff inside backend docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { rootPath } = await initConfig(this, {});
    await assertDockerIsRunning();
    await dockerHubLogin();

    await runCommand(
      'docker',
      [
        'compose',
        'run',
        '--rm',
        '-T',
        '--no-deps',
        'backend',
        'ruff',
        'check',
        '.',
      ],
      {
        cwd: rootPath,
      }
    );
  }
}
