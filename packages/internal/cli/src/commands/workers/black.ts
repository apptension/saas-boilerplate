import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';

const tracer = trace.getTracer('workers');
export default class WorkersBlack extends Command {
  static description = 'Runs black inside workers docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('black', async (span) => {
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
          'workers',
          'black',
          '--config=pyproject.toml',
          '.',
        ],
        {
          cwd: rootPath,
        }
      );
      span.end();
    });
  }
}
