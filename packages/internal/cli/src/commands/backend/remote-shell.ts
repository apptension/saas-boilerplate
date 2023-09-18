import { color } from '@oclif/color';
import { ECSClient, ListTasksCommand } from '@aws-sdk/client-ecs';

import { initConfig } from '../../config/init';
import { runCommand } from '../../lib/runCommand';
import { BaseCommand } from '../../baseCommand';

export default class RemoteShell extends BaseCommand<typeof RemoteShell> {
  static description =
    'Use aws execute-command to start a /bin/bash session inside a running backend task in ' +
    'ECS cluster';

  static examples = [`<%= config.bin %> <%= command.id %>`];

  static flags = {};

  static args = {};

  async run(): Promise<void> {
    const { projectName, envStage, awsRegion } = await initConfig(this, {
      requireAws: true,
    });

    if (!awsRegion) {
      this.error('AWS Region is missing');
    }

    const projectEnvName = `${projectName}-${envStage}`;
    const clusterName = `${projectEnvName}-main`;
    const serviceName = `${projectEnvName}-api`;

    const ecsClient = new ECSClient();

    const taskList = await ecsClient.send(
      new ListTasksCommand({
        cluster: clusterName,
        serviceName: serviceName,
      })
    );

    const taskArn = taskList.taskArns?.[0];
    if (!taskArn) {
      this.error(
        `No tasks found in ${clusterName} cluster for ${serviceName} service`
      );
    }

    this.log(`Calling ecs execute-command for
  cluster: ${color.green(clusterName)}
  service: ${color.green(serviceName)}
  region: ${color.green(awsRegion)}
  taskArn: ${color.green(taskArn)}
  container: ${color.green('backend')}
    `);

    await runCommand('aws', [
      'ecs',
      'execute-command',
      '--cluster',
      clusterName,
      '--region',
      awsRegion,
      '--task',
      taskArn,
      '--container',
      'backend',
      '--command',
      '/bin/bash',
      '--interactive',
    ]);
  }
}
