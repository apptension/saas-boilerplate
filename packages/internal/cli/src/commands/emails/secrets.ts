import { BaseCommand } from '../../baseCommand';

export default class EmailsSecrets extends BaseCommand<typeof EmailsSecrets> {
  static description =
    'Runs an ssm-editor helper tool in docker container to set runtime environmental variables of webapp service. ' +
    'Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    this.error(
      'Emails package do not have their own separate secrets service. Use `saas workers secrets` instead.'
    );
  }
}
