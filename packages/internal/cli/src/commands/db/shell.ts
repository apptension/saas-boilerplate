import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';
import { BaseCommand } from '../../baseCommand';

export default class DbShell extends BaseCommand<typeof DbShell> {
  static description =
    'Start a psql client shell in local `db` container. It allows you to run some raw queries when needed.';

  static examples = [`<%= config.bin %> <%= command.id %>`];

  static flags = {};

  static args = {};

  async run(): Promise<void> {
    const { rootPath } = await initConfig(this, {
      requireLocalEnvStage: true,
    });

    await assertDockerIsRunning();
    await dockerHubLogin();

    await runCommand('docker', ['compose', 'exec', 'db', 'psql'], {
      env: {
        ...process.env,
        PGUSER: 'backend',
        PGPASSWORD: 'backend',
        PGDATABASE: 'backend',
      },
      cwd: rootPath,
    });
  }
}
