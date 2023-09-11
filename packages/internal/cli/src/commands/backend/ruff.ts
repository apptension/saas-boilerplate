import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';

const tracer = trace.getTracer('backend');

export default class BackendRuff extends Command {
  static description = 'Run ruff inside backend docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('ruff', async (span) => {
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
      span.end();
    });
  }
}
