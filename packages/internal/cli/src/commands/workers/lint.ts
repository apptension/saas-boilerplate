import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';
import { BaseCommand } from '../../baseCommand';

export default class WorkersLint extends BaseCommand<typeof WorkersLint> {
  static description = 'Run all linters inside workers docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireAws: 'allow-local' });
    await assertDockerIsRunning();
    await dockerHubLogin();

    await runCommand('pnpm', ['nx', 'run', 'workers:lint']);
  }
}
