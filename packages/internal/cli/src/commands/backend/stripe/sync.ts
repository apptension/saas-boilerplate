import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../../config/init';
import { runCommand } from '../../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../../lib/docker';

const tracer = trace.getTracer('backend');
export default class BackendStripeSync extends Command {
  static description =
    'Run stripe synchronisation command inside backend docker container. Requires environmental variables with ' +
    'stripe credentials to be set.';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('stripe-sync', async (span) => {
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
          'python ./manage.py djstripe_sync_models',
        ],
        {
          cwd: rootPath,
        }
      );
      span.end();
    });
  }
}
