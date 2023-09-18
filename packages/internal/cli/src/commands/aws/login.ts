import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertAwsVaultInstalled } from '../../lib/awsVault';
import { BaseCommand } from '../../baseCommand';

export default class AwsLogin extends BaseCommand<typeof AwsLogin> {
  static description = 'Use aws-vault to log into AWS Web Console';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireAws: true });
    await assertAwsVaultInstalled();

    await runCommand('aws-vault', ['login']);
  }
}
