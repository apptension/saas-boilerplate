import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';

const tracer = trace.getTracer('backend');

export default class BackendMakemigrations extends Command {
  static description =
    'Shorthand to generate django backend migrations. If you need more control use ' +
    '`saas backend shell` and run `./manage.py makemigrations` manually';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('makemigrations', async (span) => {
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
          'bash',
          '-c',
          `python ./manage.py makemigrations`,
        ],
        {
          cwd: rootPath,
        }
      );
      span.end();
    });
  }
}
