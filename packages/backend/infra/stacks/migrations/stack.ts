import { App, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sfTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as sf from 'aws-cdk-lib/aws-stepfunctions';
import * as logs from 'aws-cdk-lib/aws-logs';

import { EnvConstructProps, EnvironmentSettings } from '@sb/infra-core';
import { FargateServiceResources } from '@sb/infra-shared';
import { getBackendSecrets } from '../lib/secrets';
import { getBackendEnvironment } from '../lib/environment';
import { createBackendTaskRole } from '../lib/backendTaskRole';

export interface MigrationsStackProps extends StackProps, EnvConstructProps {}

export class MigrationsStack extends Stack {
  constructor(scope: App, id: string, props: MigrationsStackProps) {
    super(scope, id, props);

    const { envSettings } = props;
    const resources = new FargateServiceResources(
      this,
      'MigrationsResources',
      props,
    );

    const containerName = 'migrations';
    const taskRole = createBackendTaskRole(this, 'MigrationsTaskRole', {
      envSettings,
    });

    const migrationsTaskDefinition = new ecs.FargateTaskDefinition(
      this,
      'MigrationsTaskDefinition',
      {
        taskRole,
        cpu: 256,
        memoryLimitMiB: 512,
      },
    );

    const containerDef = migrationsTaskDefinition.addContainer(containerName, {
      image: ecs.ContainerImage.fromEcrRepository(
        resources.backendRepository,
        envSettings.version,
      ),
      logging: this.createAWSLogDriver(this.node.id, props.envSettings),
      environment: getBackendEnvironment(this, {
        envSettings,
      }),
      secrets: getBackendSecrets(this, { envSettings }),
    });

    new sf.StateMachine(this, 'MigrationsStateMachine', {
      stateMachineName: `${envSettings.projectEnvName}-migrations`,
      definition: new sfTasks.EcsRunTask(this, 'MigrationsFargateTask', {
        cluster: resources.mainCluster,
        launchTarget: new sfTasks.EcsFargateLaunchTarget(),
        taskDefinition: migrationsTaskDefinition,
        assignPublicIp: false,
        securityGroups: [resources.fargateContainerSecurityGroup],
        containerOverrides: [
          {
            containerDefinition: containerDef,
            command: ['./scripts/runtime/run_migrations.sh'],
          },
        ],
        integrationPattern: sf.IntegrationPattern.RUN_JOB,
      }),
      timeout: Duration.minutes(5),
    });
  }

  protected createAWSLogDriver(
    prefix: string,
    envSettings: EnvironmentSettings,
  ): ecs.AwsLogDriver {
    const logGroup = new logs.LogGroup(this, 'TaskLogGroup', {
      logGroupName: `${envSettings.projectEnvName}-migrations-log-group`,
      retention: logs.RetentionDays.INFINITE,
    });
    return new ecs.AwsLogDriver({ streamPrefix: prefix, logGroup });
  }
}
