import { Flags } from '@oclif/core';
import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class McpServerDeploy extends BaseCommand<typeof McpServerDeploy> {
  static description =
    'Deploys MCP server to AWS using previously built artifact';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --diff # Preview changes without deploying',
  ];

  static flags = {
    diff: Flags.boolean({
      default: false,
      description:
        'Perform a dry run and list all changes that would be applied in AWS account',
      required: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(McpServerDeploy);
    const { envStage, version, awsRegion, awsAccountId, projectName } = await initConfig(
      this,
      { requireAws: true }
    );

    const action = flags.diff ? 'Previewing' : 'Deploying';
    this.log(`\n${color.blue(`🤖 ${action} MCP Server`)}\n`);
    this.log(`  Project: ${color.green(projectName)}`);
    this.log(`  Stage: ${color.green(envStage)}`);
    this.log(`  Version: ${color.green(version)}`);
    this.log(`  AWS Account: ${color.green(awsAccountId)}`);
    this.log(`  AWS Region: ${color.green(awsRegion)}\n`);

    const verb = flags.diff ? 'diff' : 'deploy';
    await runCommand('pnpm', ['nx', 'run', `mcp-server:${verb}`]);

    if (!flags.diff) {
      this.log(color.green('\n✓ MCP Server deployed successfully!\n'));
    }
  }
}
