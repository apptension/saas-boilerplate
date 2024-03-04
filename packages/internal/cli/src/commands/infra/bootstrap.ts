import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class InfraBootstrap extends BaseCommand<typeof InfraBootstrap> {
  static description =
    'Bootstrap infrastructure in AWS account by creating resources necessary to start working with SaaS ' +
    'Boilerplate';

  static examples = [`<%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { awsAccountId, awsRegion } = await initConfig(this, {
      requireAws: true,
      validateEnvStageVariables: false,
    });

    await runCommand('pnpm', [
      'cdk',
      'bootstrap',
      `aws://${awsAccountId}/${awsRegion}`,
    ]);
    await runCommand('pnpm', [
      'cdk',
      'bootstrap',
      `aws://${awsAccountId}/us-east-1`,
    ]);
    await runCommand('pnpm', ['nx', 'run', 'infra-shared:bootstrap']);
  }
}
