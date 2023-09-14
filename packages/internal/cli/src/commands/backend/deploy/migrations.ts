import { Flags } from '@oclif/core';
import { color } from '@oclif/color';

import { initConfig } from '../../../config/init';
import { runCommand } from '../../../lib/runCommand';
import { BaseCommand } from '../../../baseCommand';

export default class BackendDeployMigrations extends BaseCommand<
  typeof BackendDeployMigrations
> {
  static description =
    'Deploys database migrations to AWS using previously built artifact and immediately performs them';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {
    diff: Flags.boolean({
      default: false,
      description:
        'Perform a dry run and list all changes that would be applied in AWS account',
      required: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(BackendDeployMigrations);
    const { envStage, version, awsRegion, awsAccountId } = await initConfig(
      this,
      { requireAws: true }
    );

    this.log(`Deploying migrations:
  envStage: ${color.green(envStage)}
  version: ${color.green(version)}
  AWS account: ${color.green(awsAccountId)}
  AWS region: ${color.green(awsRegion)}
`);

    const verb = flags.diff ? 'diff' : 'deploy';
    await runCommand('pnpm', ['nx', 'run', `backend:${verb}:migrations`]);
  }
}
