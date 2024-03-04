import { App, Duration, Fn, Stack, StackProps } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import * as elb2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import {
  EnvConstructProps,
  getHostedZone,
  ApplicationMultipleTargetGroupsFargateService,
  EnvironmentSettings,
} from '@sb/infra-core';
import {
  MainKmsKey,
  MainDatabase,
  MainECSCluster,
  MainRedisCluster,
  EnvComponentsStack,
  FargateServiceResources,
} from '@sb/infra-shared';

import { Monitoring } from './monitoring';
import { getApiServiceName } from './names';

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
    const taskRole = this.createTaskRole(props);

    const dbSecretArn = Fn.importValue(
      MainDatabase.getDatabaseSecretArnOutputExportName(envSettings),
    );
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
    const stack = Stack.of(this);
    const webSocketApiId = Fn.importValue(
      EnvComponentsStack.getWebSocketApiIdOutputExportName(props.envSettings),
    );
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
            environment: {
              PROJECT_NAME: envSettings.projectName,
              ENVIRONMENT_NAME: envSettings.envStage,
              CHAMBER_SERVICE_NAME: this.getChamberServiceName(envSettings),
              CHAMBER_KMS_KEY_ALIAS: MainKmsKey.getKeyAlias(envSettings),
              DJANGO_ALLOWED_HOSTS: allowedHosts,
              CSRF_TRUSTED_ORIGINS: csrfTrustedOrigins,
              OTP_AUTH_ISSUER_NAME: envSettings.domains.webApp,
              WORKERS_EVENT_BUS_NAME: EnvComponentsStack.getWorkersEventBusName(
                props.envSettings,
              ),
              WEB_SOCKET_API_ENDPOINT_URL: `https://${webSocketApiId}.execute-api.${stack.region}.amazonaws.com/${props.envSettings.envStage}`,
              AWS_STORAGE_BUCKET_NAME:
                EnvComponentsStack.getFileUploadsBucketName(props.envSettings),
              AWS_S3_CUSTOM_DOMAIN: props.envSettings.domains.cdn,
              DB_PROXY_ENDPOINT: Fn.importValue(
                MainDatabase.getDatabaseProxyEndpointOutputExportName(
                  props.envSettings,
                ),
              ),
              AWS_CLOUDFRONT_KEY_ID: Fn.importValue(
                EnvComponentsStack.getCdnSigningPublicKeyIdExportName(
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
              AWS_CLOUDFRONT_KEY: ecs.Secret.fromSecretsManager(
                sm.Secret.fromSecretNameV2(
                  this,
                  'CloudfrontPrivateKey',
                  `${EnvComponentsStack.getCDNSigningKeyName(
                    props.envSettings,
                  )}/private`,
                ),
              ),
            },
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
          },
          ...(envSettings.domains.webApp
            ? [
                {
                  protocol: ecs.Protocol.TCP,
                  containerPort: 80,
                  priority: 3,
                  hostHeader: envSettings.domains.webApp,
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
                },
              ]
            : []),
        ],
      },
    );
  }

  protected createTaskRole({
    envSettings,
  }: {
    envSettings: EnvironmentSettings;
  }): iam.Role {
    const stack = Stack.of(this);
    const chamberServiceName = this.getChamberServiceName(envSettings);

    const taskRole = new iam.Role(this, 'ApiTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks'),
    });

    const fileUploadsBucket = s3.Bucket.fromBucketName(
      this,
      'FileUploadsBucket',
      EnvComponentsStack.getFileUploadsBucketName(envSettings),
    );
    fileUploadsBucket.grantReadWrite(taskRole);
    fileUploadsBucket.grantPutAcl(taskRole);

    const eventBus = events.EventBus.fromEventBusName(
      this,
      'WorkersEventBus',
      EnvComponentsStack.getWorkersEventBusName(envSettings),
    );
    eventBus.grantPutEventsTo(taskRole);

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'cloudformation:DescribeStacks',
          'apigateway:*',
          'execute-api:*',
          'xray:*',
        ],
        resources: ['*'],
      }),
    );

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ['kms:Get*', 'kms:Describe*', 'kms:List*', 'kms:Decrypt'],
        resources: [
          Fn.importValue(MainKmsKey.getMainKmsOutputExportName(envSettings)),
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

    taskRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          'ssmmessages:CreateControlChannel',
          'ssmmessages:CreateDataChannel',
          'ssmmessages:OpenControlChannel',
          'ssmmessages:OpenDataChannel',
        ],
        resources: ['*'],
      }),
    );

    return taskRole;
  }

  protected getChamberServiceName(envSettings: EnvironmentSettings) {
    return `env-${envSettings.projectEnvName}-backend`;
  }
}
