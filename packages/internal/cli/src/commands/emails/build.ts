import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class EmailsBuild extends BaseCommand<typeof EmailsBuild> {
  static description = 'Build emails artifact and place it in workers package';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { envStage, version, awsRegion, awsAccountId } = await initConfig(
      this,
      { requireAws: 'allow-local' },
    );

    this.log(`Building emails:
  envStage: ${color.green(envStage)}
  version: ${color.green(version)}
  AWS account: ${awsAccountId ? color.green(awsAccountId) : 'none'}
  AWS region: ${awsRegion ? color.green(awsRegion) : 'none'}
`);

    await runCommand('pnpm', ['nx', 'run', 'webapp-emails:build']);
  }
}
