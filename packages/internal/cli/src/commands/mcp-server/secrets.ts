import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { assertDockerIsRunning, dockerHubLogin } from '../../lib/docker';
import { runSecretsEditor } from '../../lib/secretsEditor';
import { BaseCommand } from '../../baseCommand';

export default class McpServerSecrets extends BaseCommand<typeof McpServerSecrets> {
  static description =
    'Runs an ssm-editor helper tool to set runtime environment variables of the MCP server container. ' +
    'Uses Chamber to fetch and set variables in AWS SSM Parameter Store (e.g. OPENAI_API_KEY).';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    const { envStage, awsAccountId, awsRegion, rootPath } = await initConfig(
      this,
      { requireAws: true },
    );
    await assertDockerIsRunning();
    await dockerHubLogin();

    this.log(`Setting secrets in AWS SSM Parameter Store for:
  service: ${color.green('mcp-server')}
  envStage: ${color.green(envStage)}
  AWS account: ${color.green(awsAccountId)}
  AWS region: ${color.green(awsRegion)}
`);

    await runSecretsEditor({ serviceName: 'mcp-server', rootPath });
  }
}
