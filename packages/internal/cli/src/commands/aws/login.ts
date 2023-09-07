import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertAwsVaultInstalled } from '../../lib/awsVault';

export default class AwsLogin extends Command {
  static description = 'Get currently selected ENV stage';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    await initConfig(this, { requireAws: true });
    await assertAwsVaultInstalled();

    await runCommand('aws-vault', ['login']);
  }
}
