import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';
import { BaseCommand } from '../../baseCommand';

export default class WorkersTest extends BaseCommand<typeof WorkersTest> {
  static description = 'Run all tests inside workers docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireAws: 'allow-local' });
    await assertDockerIsRunning();
    await dockerHubLogin();

    await runCommand('pnpm', ['nx', 'run', 'workers:test']);
  }
}
