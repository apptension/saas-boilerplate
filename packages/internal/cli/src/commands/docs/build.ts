import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { ENV_STAGE_LOCAL } from '../../config/env';
import { assertChamberInstalled, loadChamberEnv } from '../../lib/chamber';
import { BaseCommand } from '../../baseCommand';

export default class DocsBuild extends BaseCommand<typeof DocsBuild> {
  static description = 'Build docs artifact';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { envStage, version, awsRegion, awsAccountId, projectEnvName } =
      await initConfig(this, { requireAws: 'allow-local' });

    if (envStage !== ENV_STAGE_LOCAL) {
      await assertChamberInstalled();
      await loadChamberEnv(this, {
        serviceName: `env-${projectEnvName}-docs`,
      });
    }

    this.log(`Building docs:
  envStage: ${color.green(envStage)}
  version: ${color.green(version)}
  AWS account: ${awsAccountId ? color.green(awsAccountId) : 'none'}
  AWS region: ${awsRegion ? color.green(awsRegion) : 'none'}
`);

    await runCommand('pnpm', ['nx', 'run', 'docs:build']);
  }
}
