import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';
import { runSecretsEditor } from '../../lib/secretsEditor';
import { BaseCommand } from '../../baseCommand';

export default class WebappSecrets extends BaseCommand<typeof WebappSecrets> {
  static description =
    'Runs an ssm-editor helper tool in docker container to set runtime environmental variables of webapp service. ' +
    'Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { envStage, awsAccountId, awsRegion, rootPath } = await initConfig(
      this,
      {
        requireAws: true,
      }
    );
    await assertDockerIsRunning();
    await dockerHubLogin();

    this.log(`Settings secrets in AWS SSM Parameter store for:
  service: ${color.green('webapp')}
  envStage: ${color.green(envStage)}
  AWS account: ${color.green(awsAccountId)}
  AWS region: ${color.green(awsRegion)}
`);

    await runSecretsEditor({ serviceName: 'webapp', rootPath });
  }
}
