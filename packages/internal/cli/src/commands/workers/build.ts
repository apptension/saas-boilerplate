import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { dockerHubLogin } from '../../lib/docker';
import { BaseCommand } from '../../baseCommand';

export default class WorkersBuild extends BaseCommand<typeof WorkersBuild> {
  static description = 'Build workers artifact ready to be deployed to AWS';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { envStage, version, awsAccountId, awsRegion } = await initConfig(
      this,
      { requireAws: true }
    );
    await dockerHubLogin();

    this.log(`Building workers:
  envStage: ${color.green(envStage)}
  version: ${color.green(version)}
  AWS account: ${color.green(awsAccountId)}
  AWS region: ${color.green(awsRegion)}
`);

    await runCommand('pnpm', ['nx', 'run', `workers:build`]);
  }
}
