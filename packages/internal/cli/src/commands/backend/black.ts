import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';
import { BaseCommand } from '../../baseCommand';

export default class BackendBlack extends BaseCommand<typeof BackendBlack> {
  static description = 'Run black inside backend docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { rootPath } = await initConfig(this, {
      requireLocalEnvStage: true,
    });
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
        'black',
        '--config=pyproject.toml',
        '.',
      ],
      {
        cwd: rootPath,
      }
    );
  }
}
