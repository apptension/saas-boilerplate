import { Command } from '@oclif/core';
import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';

export default class BackendBuild extends Command {
  static description = 'Starts all backend services';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { envStage, version, awsRegion, awsAccountId } = await initConfig(
      this,
      { requireAws: true }
    );

    this.log(`Building backend:
  envStage: ${color.green(envStage)}
  version: ${color.green(version)}
  AWS account: ${color.green(awsAccountId)}
  AWS region: ${color.green(awsRegion)}
`);

    await runCommand('pnpm', ['nx', 'run', 'backend:build']);
  }
}
