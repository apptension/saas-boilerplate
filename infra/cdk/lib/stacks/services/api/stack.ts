import { App, Fn, Stack, StackProps } from "aws-cdk-lib";
import {
  ContainerImage,
  Protocol,
  Secret as EcsSecret,
} from "aws-cdk-lib/aws-ecs";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Secret } from "aws-cdk-lib/aws-secretsmanager";
import { ApplicationListener } from "aws-cdk-lib/aws-elasticloadbalancingv2";

import { EnvConstructProps } from "../../../types";
import { ApplicationMultipleTargetGroupsFargateService } from "../../../patterns/applicationMultipleTargetGroupsFargateService";
import { MainKmsKey } from "../../env/main/mainKmsKey";
import { MainDatabase } from "../../env/db/mainDatabase";
import { FargateServiceResources } from "../../../patterns/fargateServiceResources";
import { MigrationsStackProps } from "../migrations/stack";
import { EnvironmentSettings } from "../../../settings";
import { MainECSCluster } from "../../env/main/mainEcsCluster";
import { EnvComponentsStack } from "../../env/components";
import { getHostedZone } from "../../../helpers/domains";
import { Monitoring } from "./monitoring";

export interface ApiStackProps extends StackProps, EnvConstructProps {}

export class ApiStack extends Stack {
  fargateService: ApplicationMultipleTargetGroupsFargateService;
  monitoring: Monitoring;

  constructor(scope: App, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const resources = new FargateServiceResources(this, "ApiResources", props);

    this.fargateService = this.createFargateService(resources, props);
    const scaling = this.fargateService.service.autoScaleTaskCount({
      maxCapacity: 5,
    });

    scaling.scaleOnCpuUtilization("CpuScaling", {
      targetUtilizationPercent: 50,
    });

    this.monitoring = new Monitoring(this, "ApiMonitoring", {
      envSettings: props.envSettings,
      logGroup: this.fargateService.logGroups[0],
    });
  }

  private createFargateService(
    resources: FargateServiceResources,
    props: ApiStackProps
  ) {
    const { envSettings } = props;
    const taskRole = this.createTaskRole(props);

    const dbSecretArn = Fn.importValue(
      MainDatabase.getDatabaseSecretArnOutputExportName(envSettings)
    );
    const domainZone = getHostedZone(this, envSettings);

    const allowedHosts = [
      envSettings.domains.api,
      envSettings.domains.adminPanel,
      envSettings.domains.webApp,
      envSettings.domains.www,
    ].join(",");

    const httpsListener = ApplicationListener.fromApplicationListenerAttributes(
      this,
      "HttpsListener",
      {
        listenerArn: Fn.importValue(
          MainECSCluster.getLoadBalancerHttpsListenerArnOutputExportName(
            props.envSettings
          )
        ),
        securityGroup: resources.publicLoadBalancerSecurityGroup,
      }
    );
    const stack = Stack.of(this);
    const webSocketApiId = Fn.importValue(
      EnvComponentsStack.getWebSocketApiIdOutputExportName(props.envSettings)
    );
    return new ApplicationMultipleTargetGroupsFargateService(
      this,
      "ApiService",
      {
        securityGroup: resources.fargateContainerSecurityGroup,
        serviceName: ApiStack.getServiceName(props.envSettings),
        cluster: resources.mainCluster,
        cpu: 512,
        memoryLimitMiB: 1024,
        desiredCount: 1,
        taskRole,
        taskImageOptions: [
          {
            containerName: "backend",
            image: ContainerImage.fromEcrRepository(
              resources.backendRepository,
              envSettings.version
            ),
            environment: {
              PROJECT_NAME: envSettings.projectName,
              ENVIRONMENT_NAME: envSettings.envStage,
              CHAMBER_SERVICE_NAME: this.getChamberServiceName(envSettings),
              CHAMBER_KMS_KEY_ALIAS: MainKmsKey.getKeyAlias(envSettings),
              DJANGO_ALLOWED_HOSTS: allowedHosts,
              WORKERS_EVENT_BUS_NAME: EnvComponentsStack.getWorkersEventBusName(
                props.envSettings
              ),
              WEB_SOCKET_API_ENDPOINT_URL: `https://${webSocketApiId}.execute-api.${stack.region}.amazonaws.com/${props.envSettings.envStage}`,
              AWS_STORAGE_BUCKET_NAME:
                EnvComponentsStack.getFileUploadsBucketName(props.envSettings),
              AWS_S3_CUSTOM_DOMAIN: props.envSettings.domains.cdn,
              DB_PROXY_ENDPOINT: Fn.importValue(
                MainDatabase.getDatabaseProxyEndpointOutputExportName(
                  props.envSettings
                )
              ),
              AWS_CLOUDFRONT_KEY_ID: Fn.importValue(
                EnvComponentsStack.getCdnSigningPublicKeyIdExportName(
                  props.envSettings
                )
              ),
            },
            secrets: {
              DB_CONNECTION: EcsSecret.fromSecretsManager(
                Secret.fromSecretCompleteArn(this, "DbSecret", dbSecretArn)
              ),
              AWS_CLOUDFRONT_KEY: EcsSecret.fromSecretsManager(
                Secret.fromSecretNameV2(
                  this,
                  "CloudfrontPrivateKey",
                  `${EnvComponentsStack.getCDNSigningKeyName(
                    props.envSettings
                  )}/private`
                )
              ),
            },
          },
          {
            containerName: "xray-daemon",
            image: ContainerImage.fromRegistry("amazon/aws-xray-daemon"),
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
            protocol: Protocol.TCP,
            containerPort: 80,
            priority: 2,
            hostHeader: envSettings.domains.api,
          },
          {
            protocol: Protocol.TCP,
            containerPort: 80,
            priority: 3,
            hostHeader: envSettings.domains.webApp,
          },
          {
            protocol: Protocol.TCP,
            containerPort: 80,
            priority: 4,
            hostHeader: envSettings.domains.www,
          },
          {
            protocol: Protocol.TCP,
            containerPort: 80,
            priority: 5,
            hostHeader: envSettings.domains.adminPanel,
          },
        ],
      }
    );
  }

  public static getServiceName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-api`;
  }

  protected createTaskRole(props: MigrationsStackProps): Role {
    const stack = Stack.of(this);
    const chamberServiceName = this.getChamberServiceName(props.envSettings);

    const taskRole = new Role(this, "ApiTaskRole", {
      assumedBy: new ServicePrincipal("ecs-tasks"),
    });

    taskRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "sqs:*",
          "s3:*",
          "cloudformation:DescribeStacks",
          "events:*",
          "apigateway:*",
          "execute-api:*",
          "xray:*",
        ],
        resources: ["*"],
      })
    );

    taskRole.addToPolicy(
      new PolicyStatement({
        actions: ["kms:Get*", "kms:Describe*", "kms:List*", "kms:Decrypt"],
        resources: [
          Fn.importValue(
            MainKmsKey.getMainKmsOutputExportName(props.envSettings)
          ),
        ],
      })
    );

    taskRole.addToPolicy(
      new PolicyStatement({
        actions: ["ssm:DescribeParameters"],
        resources: ["*"],
      })
    );

    taskRole.addToPolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameters*"],
        resources: [
          `arn:aws:ssm:${stack.region}:${stack.account}:parameter/${chamberServiceName}/*`,
        ],
      })
    );

    taskRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "ssmmessages:CreateControlChannel",
          "ssmmessages:CreateDataChannel",
          "ssmmessages:OpenControlChannel",
          "ssmmessages:OpenDataChannel",
        ],
        resources: ["*"],
      })
    );

    return taskRole;
  }

  protected getChamberServiceName(envSettings: EnvironmentSettings) {
    return `env-${envSettings.projectEnvName}-backend`;
  }
}
