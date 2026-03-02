import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  EnvConstructProps,
  PnpmWorkspaceFilters,
  ServiceCiConfig,
} from '@sb/infra-core';
import { GlobalECR } from '../global/resources/globalECR';
import { BootstrapStack } from '../bootstrap';
import { EnvMainStack } from '../main';

interface McpServerCiConfigProps extends EnvConstructProps {
  inputArtifact: codepipeline.Artifact;
  buildStage: codepipeline.IStage;
  deployStage: codepipeline.IStage;
  mcpServerRepository: ecr.IRepository;
}

/**
 * CI/CD configuration for the MCP Server.
 *
 * This creates CodeBuild projects for:
 * 1. Building the MCP server Docker image
 * 2. Deploying the MCP server to ECS Fargate
 */
export class McpServerCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: McpServerCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const buildProject = this.createBuildProject(props);
    props.buildStage.addAction(
      this.createBuildAction(
        'mcp-server',
        {
          project: buildProject,
        },
        props,
      ),
    );

    const deployProject = this.createDeployProject(props);
    props.deployStage.addAction(
      this.createDeployAction(
        'mcp-server',
        {
          project: deployProject,
          runOrder: this.getRunOrder(props.deployStage, 2),
        },
        props,
      ),
    );
  }

  private createBuildAction(
    name: string,
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: McpServerCiConfigProps,
  ) {
    return new codepipelineActions.CodeBuildAction(<
      codepipelineActions.CodeBuildActionProps
    >{
      actionName: `${props.envSettings.projectEnvName}-build-${name}`,
      project: actionProps.project,
      input: props.inputArtifact,
      runOrder: this.getRunOrder(props.buildStage),
    });
  }

  private createBuildProject(props: McpServerCiConfigProps) {
    const preBuildCommands = [
      ...this.getWorkspaceSetupCommands(PnpmWorkspaceFilters.INFRA_SHARED),
    ];

    const project = new codebuild.Project(this, 'McpServerBuildProject', {
      projectName: `${props.envSettings.projectEnvName}-build-mcp-server`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: preBuildCommands,
          },
          build: {
            commands: ['pnpm nx run mcp-server:build'],
          },
        },
      }),
      environment: {
        privileged: true,
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        ...{
          DOCKER_USERNAME: {
            type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: 'GlobalBuildSecrets:DOCKER_USERNAME',
          },
          DOCKER_PASSWORD: {
            type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: 'GlobalBuildSecrets:DOCKER_PASSWORD',
          },
        },
      },
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.DOCKER_LAYER),
    });

    BootstrapStack.getIamPolicyStatementsForEnvParameters(
      props.envSettings,
    ).forEach((statement) => project.addToRolePolicy(statement));

    EnvMainStack.getIamPolicyStatementsForEnvParameters(
      props.envSettings,
    ).forEach((statement) => project.addToRolePolicy(statement));

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:*'],
        resources: ['*'],
      }),
    );

    GlobalECR.getPublicECRIamPolicyStatements().forEach((statement) =>
      project.addToRolePolicy(statement),
    );
    props.mcpServerRepository.grantPullPush(project);

    return project;
  }

  private createDeployAction(
    name: string,
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: McpServerCiConfigProps,
  ) {
    return new codepipelineActions.CodeBuildAction(<
      codepipelineActions.CodeBuildActionProps
    >{
      ...actionProps,
      project: actionProps.project,
      actionName: `${props.envSettings.projectEnvName}-deploy-${name}`,
      input: props.inputArtifact,
    });
  }

  private createDeployProject(props: McpServerCiConfigProps) {
    const stack = Stack.of(this);
    const project = new codebuild.Project(this, 'McpServerDeployProject', {
      projectName: `${props.envSettings.projectEnvName}-deploy-mcp-server`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: this.getWorkspaceSetupCommands(
              PnpmWorkspaceFilters.INFRA_SHARED,
            ),
          },
          build: { commands: ['pnpm nx run mcp-server:deploy'] },
        },
        cache: {
          paths: [...this.defaultCachePaths],
        },
      }),
      environment: { buildImage: codebuild.LinuxBuildImage.STANDARD_7_0 },
      environmentVariables: { ...this.defaultEnvVariables },
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM),
    });

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cloudformation:*'],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-McpServerStack/*`,
        ],
      }),
    );

    GlobalECR.getPublicECRIamPolicyStatements().forEach((statement) =>
      project.addToRolePolicy(statement),
    );

    BootstrapStack.getIamPolicyStatementsForEnvParameters(
      props.envSettings,
    ).forEach((statement) => project.addToRolePolicy(statement));

    EnvMainStack.getIamPolicyStatementsForEnvParameters(
      props.envSettings,
    ).forEach((statement) => project.addToRolePolicy(statement));

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'iam:*',
          'sts:*',
          'ec2:*',
          'ecs:*',
          'application-autoscaling:*',
          'logs:*',
          'elasticloadbalancing:*',
          'route53:*',
          's3:*',
        ],
        resources: ['*'],
      }),
    );

    return project;
  }
}
