import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('backend');

export default class BackendShell extends Command {
  static description =
    'Runs interactive bash shell inside backend docker container';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('shell', async (span) => {
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
      span.end();
    });
  }
}
