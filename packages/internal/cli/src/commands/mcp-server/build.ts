import { color } from '@oclif/color';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class McpServerBuild extends BaseCommand<typeof McpServerBuild> {
  static description = 'Builds MCP server Docker image and pushes it to AWS ECR';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> # Build and push MCP server image',
  ];

  async run(): Promise<void> {
    const { envStage, version, awsRegion, awsAccountId, projectName } = await initConfig(
      this,
      { requireAws: true }
    );

    this.log(`\n${color.blue('🤖 Building MCP Server')}\n`);
    this.log(`  Project: ${color.green(projectName)}`);
    this.log(`  Stage: ${color.green(envStage)}`);
    this.log(`  Version: ${color.green(version)}`);
    this.log(`  AWS Account: ${color.green(awsAccountId)}`);
    this.log(`  AWS Region: ${color.green(awsRegion)}\n`);

    await runCommand('pnpm', ['nx', 'run', 'mcp-server:build']);

    this.log(color.green('\n✓ MCP Server image built and pushed successfully!\n'));
  }
}
