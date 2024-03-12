import { App, Duration, Fn, Stack, StackProps } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elb2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
  ApplicationMultipleTargetGroupsFargateService,
  EnvConstructProps,
  getHostedZone,
} from '@sb/infra-core';
import { FargateServiceResources, MainECSCluster } from '@sb/infra-shared';

import { Monitoring } from './monitoring';
import { getApiServiceName } from './names';
import { createBackendTaskRole } from '../lib/backendTaskRole';
import { getBackendEnvironment } from '../lib/environment';
import { getBackendSecrets } from '../lib/secrets';

export interface ApiStackProps extends StackProps, EnvConstructProps {}

export class ApiStack extends Stack {
  fargateService: ApplicationMultipleTargetGroupsFargateService;
  monitoring: Monitoring;

  constructor(scope: App, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const resources = new FargateServiceResources(this, 'ApiResources', props);

    this.fargateService = this.createFargateService(resources, props);
    const scaling = this.fargateService.service.autoScaleTaskCount({
      maxCapacity: 5,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 50,
    });

    this.monitoring = new Monitoring(this, 'ApiMonitoring', {
      envSettings: props.envSettings,
      logGroup: this.fargateService.logGroups[0],
    });
  }

  private createFargateService(
    resources: FargateServiceResources,
    props: ApiStackProps,
  ) {
    const { envSettings } = props;
    const taskRole = createBackendTaskRole(this, 'ApiTaskRole', {
      envSettings,
    });

    const domainZone = getHostedZone(this, envSettings);

    const allowedHosts = [
      envSettings.domains.api,
      envSettings.domains.adminPanel,
      envSettings.domains.webApp,
      envSettings.domains.www,
    ].join(',');

    const csrfTrustedOrigins = [
      `https://${envSettings.domains.adminPanel}`,
    ].join(',');

    const httpsListener =
      elb2.ApplicationListener.fromApplicationListenerAttributes(
        this,
        'HttpsListener',
        {
          listenerArn: Fn.importValue(
            MainECSCluster.getLoadBalancerHttpsListenerArnOutputExportName(
              props.envSettings,
            ),
          ),
          securityGroup: resources.publicLoadBalancerSecurityGroup,
        },
      );

      const healthCheckPath = '/lbcheck';
      return new ApplicationMultipleTargetGroupsFargateService(
      this,
      'ApiService',
      {
        securityGroup: resources.fargateContainerSecurityGroup,
        serviceName: getApiServiceName(props.envSettings),
        healthCheckGracePeriod: Duration.minutes(2),
        cluster: resources.mainCluster,
        cpu: 512,
        memoryLimitMiB: 1024,
        desiredCount: 1,
        taskRole,
        taskImageOptions: [
          {
            containerName: 'backend',
            command: [
              'sh',
              '-c',
              '/bin/chamber exec $CHAMBER_SERVICE_NAME -- ./scripts/runtime/run.sh',
            ],
            image: ecs.ContainerImage.fromEcrRepository(
              resources.backendRepository,
              envSettings.version,
            ),
            environment: getBackendEnvironment(this, {
              envSettings,
              allowedHosts,
              csrfTrustedOrigins,
            }),
            secrets: getBackendSecrets(this, { envSettings }),
          },
          {
            containerName: 'xray-daemon',
            image: ecs.ContainerImage.fromRegistry('amazon/aws-xray-daemon'),
            containerPorts: [2000],
            enableLogging: false,
          },
        ],
        loadBalancers: [
          {
            domainZone,
            domainName: envSettings.domains.api,
            loadBalancer: resources.publicLoadBalancer,
            listeners: [httpsListener],
          },
          {
            domainZone,
            domainName: envSettings.domains.adminPanel,
            loadBalancer: resources.publicLoadBalancer,
            listeners: [httpsListener],
          },
        ],
        targetGroups: [
          {
            protocol: ecs.Protocol.TCP,
            containerPort: 80,
            priority: 2,
            hostHeader: envSettings.domains.api,
            healthCheckPath,
          },
          ...(envSettings.domains.webApp
            ? [
                {
                  protocol: ecs.Protocol.TCP,
                  containerPort: 80,
                  priority: 3,
                  hostHeader: envSettings.domains.webApp,
                  healthCheckPath,
                },
              ]
            : []),
          ...(envSettings.domains.www
            ? [
                {
                  protocol: ecs.Protocol.TCP,
                  containerPort: 80,
                  priority: 4,
                  hostHeader: envSettings.domains.www,
                  healthCheckPath,
                },
              ]
            : []),
          ...(envSettings.domains.adminPanel
            ? [
                {
                  protocol: ecs.Protocol.TCP,
                  containerPort: 80,
                  priority: 5,
                  hostHeader: envSettings.domains.adminPanel,
                  healthCheckPath,
                },
              ]
            : []),
        ],
      },
    );
  }
}
