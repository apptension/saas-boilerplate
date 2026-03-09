import { App, Duration, Fn, Stack, StackProps } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elb2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  ApplicationMultipleTargetGroupsFargateService,
  EnvConstructProps,
  getHostedZone,
} from '@sb/infra-core';
import { FargateServiceResources, MainECSCluster, MainKmsKey } from '@sb/infra-shared';

import { getMcpServerChamberServiceName } from '../lib/names';
import { getMcpServerServiceName } from './names';

export interface McpServerStackProps extends StackProps, EnvConstructProps {}

/**
 * MCP Server Stack - Deploys the Apollo MCP Server for AI Assistant integration
 *
 * The MCP (Model Context Protocol) Server exposes GraphQL operations as AI tools,
 * allowing AI models to query and mutate business data through a secure interface.
 *
 * Prerequisites:
 * - Set SB_AI_ENABLED=true in environment configuration
 * - Build and push the MCP server Docker image
 *
 * Architecture:
 * - Runs as a separate Fargate service from the backend
 * - Forwards requests to the backend GraphQL endpoint
 * - Internal-only service (not exposed to public internet by default)
 */
export class McpServerStack extends Stack {
  fargateService: ApplicationMultipleTargetGroupsFargateService;

  constructor(scope: App, id: string, props: McpServerStackProps) {
    super(scope, id, props);

    const resources = new FargateServiceResources(this, 'McpServerResources', props);
    this.fargateService = this.createFargateService(resources, props);

    const scaling = this.fargateService.service.autoScaleTaskCount({
      maxCapacity: 3,
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: 70,
    });
  }

  private createFargateService(
    resources: FargateServiceResources,
    props: McpServerStackProps,
  ) {
    const { envSettings } = props;
    const stack = Stack.of(this);

    const taskRole = new iam.Role(this, 'McpServerTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    const chamberServiceName = getMcpServerChamberServiceName(envSettings);
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

    const graphqlEndpoint = `https://${envSettings.domains.api}/api/graphql/`;

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

    const domainZone = getHostedZone(this, envSettings);

    const mcpDomain = envSettings.domains.mcp;

    return new ApplicationMultipleTargetGroupsFargateService(
      this,
      'McpServerService',
      {
        securityGroup: resources.fargateContainerSecurityGroup,
        serviceName: getMcpServerServiceName(props.envSettings),
        healthCheckGracePeriod: Duration.minutes(2),
        cluster: resources.mainCluster,
        cpu: 256,
        memoryLimitMiB: 512,
        desiredCount: 1,
        taskRole,
        taskImageOptions: [
          {
            containerName: 'mcp-server',
            image: ecs.ContainerImage.fromEcrRepository(
              resources.mcpServerRepository,
              envSettings.version,
            ),
            environment: {
              GRAPHQL_ENDPOINT: graphqlEndpoint,
              MCP_LOG_LEVEL: 'info',
              MUTATION_MODE: 'explicit',
              CHAMBER_SERVICE_NAME: chamberServiceName,
              CHAMBER_KMS_KEY_ALIAS: MainKmsKey.getKeyAlias(envSettings),
            },
          },
        ],
        loadBalancers: [
          {
            domainZone,
            domainName: mcpDomain,
            loadBalancer: resources.publicLoadBalancer,
            listeners: [httpsListener],
          },
        ],
        targetGroups: [
          {
            protocol: ecs.Protocol.TCP,
            containerPort: 4000,
            targetProtocol: elb2.ApplicationProtocol.HTTP,
            priority: 10,
            hostHeader: mcpDomain,
            healthCheckPath: '/health',
          },
        ],
      },
    );
  }
}
