import { Command, Flags } from '@oclif/core';
import { trace } from '@opentelemetry/api';

import { initConfig } from '../../../config/init';
import { runCommand } from '../../../lib/runCommand';
import { assertDockerIsRunning, dockerHubLogin } from '../../../lib/docker';

const tracer = trace.getTracer('workers');

export default class WorkersInvokeLocal extends Command {
  static description = 'Invoke an async worker task';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {
    function: Flags.boolean({
      char: 'f',
      default: false,
      description:
        'The name of the function in your service that you want to invoke locally',
      required: true,
    }),
    data: Flags.boolean({
      char: 'd',
      default: false,
      description:
        'String containing data to be passed as an event to your function.',
      required: false,
    }),
  };

  async run(): Promise<void> {
    return tracer.startActiveSpan('invoke:local', async (span) => {
      const { flags } = await this.parse(WorkersInvokeLocal);
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
          'workers',
          `pnpm sls invoke local -f=${flags.function} ${
            flags.data ? `d=${flags.data}` : ''
          }`,
        ],
        {
          cwd: rootPath,
        }
      );
      span.end();
    });
  }
}
