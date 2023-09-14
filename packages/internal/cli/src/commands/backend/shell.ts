import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';
import { BaseCommand } from '../../baseCommand';

export default class BackendShell extends BaseCommand<typeof BackendShell> {
  static description =
    'Runs interactive bash shell inside backend docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { rootPath } = await initConfig(this, {
      requireLocalEnvStage: true,
    });
    await assertDockerIsRunning();
    await dockerHubLogin();

    await runCommand(
      'docker',
      ['compose', 'run', '--rm', 'backend', '/bin/bash'],
      {
        cwd: rootPath,
      }
    );
  }
}
