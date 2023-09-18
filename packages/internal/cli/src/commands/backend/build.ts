import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { dockerHubLogin } from '../../lib/docker';
import { BaseCommand } from '../../baseCommand';

export default class BackendBuild extends BaseCommand<typeof BackendBuild> {
  static description = 'Build backend docker image and upload it to AWS ECR';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { envStage, version, awsRegion, awsAccountId } = await initConfig(
      this,
      { requireAws: true }
    );
    await dockerHubLogin();

    this.log(`Building backend:
  envStage: ${color.green(envStage)}
  version: ${color.green(version)}
  AWS account: ${color.green(awsAccountId)}
  AWS region: ${color.green(awsRegion)}
`);

    await runCommand('pnpm', ['nx', 'run', 'backend:build']);
  }
}
