import { initConfig } from '../config/init';
import { runCommand } from '../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../lib/docker';
import { BaseCommand } from '../baseCommand';

export default class Up extends BaseCommand<typeof Up> {
  static description = 'Starts both backend and frontend';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();
    await dockerHubLogin();

    await runCommand('pnpm', ['nx', 'run', 'core:docker-compose:up']);
    await runCommand('pnpm', ['nx', 'run', 'webapp:start']);
  }
}
