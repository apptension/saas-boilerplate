import { Command, Flags } from '@oclif/core';

import { initConfig } from '../../../config/init';
import { runCommand } from '../../../lib/runCommand';
import { assertDockerIsRunning } from '../../../lib/docker';

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
    const { flags } = await this.parse(WorkersInvokeLocal);
    await initConfig(this, { requireLocalEnvStage: true });
    await assertDockerIsRunning();

    await runCommand('docker', [
      'compose',
      'run',
      '--rm',
      '-T',
      'workers',
      `pnpm sls invoke local -f=${flags.function} ${
        flags.data ? `d=${flags.data}` : ''
      }`,
    ]);
  }
}
