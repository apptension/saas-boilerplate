import { Args } from '@oclif/core';

import { initConfig } from '../../config/init';
import { BaseCommand } from '../../baseCommand';
import { assertChamberInstalled } from '../../lib/chamber';
import { runCommand } from '../../lib/runCommand';

export default class SetVar extends BaseCommand<typeof SetVar> {
  static description =
    'Set a variable inside an env stage. It will be set as environmental variable for every ' +
    'command you run when a non-local env stage is selected. \n' +
    'Requires `chamber` executable installed on your machine';

  static examples = [
    `$ <%= config.bin %> <%= command.id %> SB_HOSTED_ZONE_ID XYZ`,
    `$ <%= config.bin %> <%= command.id %> SB_HOSTED_ZONE_NAME example.com`,
    `$ <%= config.bin %> <%= command.id %> SB_DOMAIN_ADMIN_PANEL admin.qa.example.com`,
    `$ <%= config.bin %> <%= command.id %> SB_DOMAIN_API api.qa.example.com`,
    `$ <%= config.bin %> <%= command.id %> SB_DOMAIN_CDN cdn.qa.example.com`,
    `$ <%= config.bin %> <%= command.id %> SB_DOMAIN_DOCS docs.qa.example.com`,
    `$ <%= config.bin %> <%= command.id %> SB_DOMAIN_WEB_APP app.qa.example.com`,
  ];

  static args = {
    name: Args.string({
      description: 'Env variable name',
      required: true,
    }),
    value: Args.string({
      description: 'Env variable value',
      required: true,
    }),
  };

  async run(): Promise<void> {
    const { args } = await this.parse(SetVar);
    const { envStage } = await initConfig(this, {
      requireAws: true,
    });

    await assertChamberInstalled();

    await runCommand('chamber', ['write', envStage, args.name, args.value]);
  }
}
