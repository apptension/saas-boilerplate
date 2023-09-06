import { Command } from '@oclif/core';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { assertAwsVaultInstalled } from '../../lib/awsVault';

export default class GetEnv extends Command {
  static description = 'Get currently selected ENV stage';

  static examples = [`$ saas aws login`];

  async run(): Promise<void> {
    await initConfig(this, { requireAws: true });
    await assertAwsVaultInstalled();

    await runCommand('aws-vault', ['login']);
  }
}
