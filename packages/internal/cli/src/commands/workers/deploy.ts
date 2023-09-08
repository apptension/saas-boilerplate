import { Command, Flags } from '@oclif/core';
import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { dockerHubLogin } from '../../lib/docker';

export default class WorkersDeploy extends Command {
  static description = 'Deploys workers to AWS using previously built artifact';

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
    const { flags } = await this.parse(WorkersDeploy);
    const { envStage, version, awsAccountId, awsRegion } = await initConfig(
      this,
      { requireAws: true }
    );
    await dockerHubLogin();

    this.log(`Deploying backend:
  envStage: ${color.green(envStage)}
  version: ${color.green(version)}
  AWS account: ${color.green(awsAccountId)}
  AWS region: ${color.green(awsRegion)}
`);

    const verb = flags.diff ? 'diff' : 'deploy';
    await runCommand('pnpm', ['nx', 'run', `workers:${verb}`]);
  }
}
