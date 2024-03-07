import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { EnvConstructProps } from '@sb/infra-core';
import { FargateServiceResources } from '@sb/infra-shared';

import {
  getCeleryBeatServiceName,
  getCeleryWorkersFamily,
  getCeleryWorkersServiceName,
} from './names';
import { getBackendSecrets } from '../lib/secrets';
import { getBackendEnvironment } from '../lib/environment';
import { SubnetType } from 'aws-cdk-lib/aws-ec2';
import { createBackendTaskRole } from '../lib/backendTaskRole';
import { AwsLogDriver } from 'aws-cdk-lib/aws-ecs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';

export interface CeleryStackProps extends StackProps, EnvConstructProps {}

export class CeleryStack extends Stack {
  taskRole: iam.Role;
  workersService: ecs.FargateService;
  beatService: ecs.FargateService;
  backendSecrets: Record<string, ecs.Secret>;

  constructor(scope: App, id: string, props: CeleryStackProps) {
    super(scope, id, props);

    const resources = new FargateServiceResources(this, 'ApiResources', props);

    this.taskRole = createBackendTaskRole(this, 'CeleryWorkerTaskRole', {
      envSettings: props.envSettings,
    });
    this.backendSecrets = getBackendSecrets(this, {
      envSettings: props.envSettings,
    });
    this.workersService = this.createDefaultWorkerFargateService(
      resources,
      props,
    );

    this.beatService = this.createBeatFargateService(resources, props);
  }

  private createDefaultWorkerFargateService(
    resources: FargateServiceResources,
    props: CeleryStackProps,
  ) {
    const { envSettings } = props;
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      'CeleryWorkersTaskDefinition',
      {
        cpu: 256,
        memoryLimitMiB: 512,
        family: getCeleryWorkersFamily(props.envSettings),
        taskRole: this.taskRole,
      },
    );

    taskDefinition.addContainer('WorkerContainer', {
      image: ecs.ContainerImage.fromEcrRepository(
        resources.backendRepository,
        envSettings.version,
      ),
      containerName: 'worker',
      command: [
        'sh',
        '-c',
        '/bin/chamber exec $CHAMBER_SERVICE_NAME -- ./scripts/runtime/run_celery_worker_default.sh',
      ],
      environment: getBackendEnvironment(this, {
        envSettings,
      }),
      secrets: this.backendSecrets,
      logging: this.createAWSLogDriver(
        `${envSettings.projectEnvName}-celery-worker-default`,
      ),
    });

    return new ecs.FargateService(this, 'DefaultWorkersService', {
      serviceName: getCeleryWorkersServiceName(props.envSettings),
      cluster: resources.mainCluster,
      securityGroups: [resources.fargateContainerSecurityGroup],
      vpcSubnets: resources.mainCluster.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
      desiredCount: 1,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 1,
        },
      ],
      taskDefinition: taskDefinition,
      enableExecuteCommand: true,
    });
  }

  private createBeatFargateService(
    resources: FargateServiceResources,
    props: CeleryStackProps,
  ) {
    const { envSettings } = props;
    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      'CeleryBeatTaskDefinition',
      {
        cpu: 256,
        memoryLimitMiB: 512,
        family: getCeleryWorkersFamily(props.envSettings),
        taskRole: this.taskRole,
      },
    );

    taskDefinition.addContainer('BeatContainer', {
      image: ecs.ContainerImage.fromEcrRepository(
        resources.backendRepository,
        envSettings.version,
      ),
      containerName: 'beat',
      command: [
        'sh',
        '-c',
        '/bin/chamber exec $CHAMBER_SERVICE_NAME -- ./scripts/runtime/run_celery_beat.sh',
      ],
      environment: getBackendEnvironment(this, {
        envSettings,
      }),
      secrets: this.backendSecrets,
      logging: this.createAWSLogDriver(
        `${envSettings.projectEnvName}-celery-beat-default`,
      ),
    });

    return new ecs.FargateService(this, 'BeatService', {
      serviceName: getCeleryBeatServiceName(props.envSettings),
      cluster: resources.mainCluster,
      securityGroups: [resources.fargateContainerSecurityGroup],
      vpcSubnets: resources.mainCluster.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }),
      desiredCount: 1,
      capacityProviderStrategies: [
        {
          capacityProvider: 'FARGATE_SPOT',
          weight: 1,
        },
      ],
      taskDefinition: taskDefinition,
      enableExecuteCommand: true,
    });
  }

  protected createAWSLogDriver(prefix: string): AwsLogDriver {
    const logGroup = new LogGroup(this, `${prefix}-LogGroup`);
    return new AwsLogDriver({
      streamPrefix: prefix,
      logGroup: logGroup,
    });
  }
}
