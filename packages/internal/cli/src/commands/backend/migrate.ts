import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';

const tracer = trace.getTracer('backend');

export default class BackendMigrate extends Command {
  static description =
    'Shorthand to run backend migrations using local database. If you need more control use' +
    '`saas backend shell` and run `./manage.py migrate` manually';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('migrate', async (span) => {
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
          'backend',
          'sh',
          '-c',
          'python ./manage.py migrate',
        ],
        {
          cwd: rootPath,
        }
      );
      span.end();
    });
  }
}
