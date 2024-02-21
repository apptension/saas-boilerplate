import { App, Duration, Fn, Stack, StackProps } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as sfTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as sf from 'aws-cdk-lib/aws-stepfunctions';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';

import { EnvConstructProps, EnvironmentSettings } from '@sb/infra-core';
import {
  FargateServiceResources,
  MainDatabase,
  MainKmsKey,
  MainRedisCluster,
} from '@sb/infra-shared';

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
    const dbSecretArn = Fn.importValue(
      MainDatabase.getDatabaseSecretArnOutputExportName(envSettings),
    );
    const taskRole = this.createTaskRole(props);

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
      environment: {
        CHAMBER_SERVICE_NAME: this.getChamberServiceName(envSettings),
        CHAMBER_KMS_KEY_ALIAS: MainKmsKey.getKeyAlias(envSettings),
        DB_PROXY_ENDPOINT: Fn.importValue(
          MainDatabase.getDatabaseProxyEndpointOutputExportName(
            props.envSettings,
          ),
        ),
        REDIS_CONNECTION: Fn.join('', [
          'redis://',
          Fn.importValue(
            MainRedisCluster.getMainRedisClusterAddressExportName(
              props.envSettings,
            ),
          ),
          ':6379',
        ]),
      },
      secrets: {
        DB_CONNECTION: ecs.Secret.fromSecretsManager(
          sm.Secret.fromSecretCompleteArn(this, 'DbSecret', dbSecretArn),
        ),
      },
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

  protected createTaskRole(props: MigrationsStackProps): iam.Role {
    const stack = Stack.of(this);
    const chamberServiceName = this.getChamberServiceName(props.envSettings);

    const taskRole = new iam.Role(this, 'MigrationsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks'),
    });

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['kms:Get*', 'kms:Describe*', 'kms:List*', 'kms:Decrypt'],
        resources: [
          Fn.importValue(
            MainKmsKey.getMainKmsOutputExportName(props.envSettings),
          ),
        ],
      }),
    );

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:DescribeParameters'],
        resources: ['*'],
      }),
    );

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['ssm:GetParameters*'],
        resources: [
          `arn:aws:ssm:${stack.region}:${stack.account}:parameter/${chamberServiceName}/*`,
        ],
      }),
    );

    return taskRole;
  }

  protected getChamberServiceName(envSettings: EnvironmentSettings) {
    return `env-${envSettings.projectEnvName}-backend`;
  }
}
