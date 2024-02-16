import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  EnvConstructProps,
  PnpmWorkspaceFilters,
  ServiceCiConfig,
} from '@sb/infra-core';
import { GlobalECR } from '../global/resources/globalECR';
import { BootstrapStack } from '../bootstrap';
import { EnvMainStack } from '../main';

interface ServerlessCiConfigProps extends EnvConstructProps {
  inputArtifact: codepipeline.Artifact;
  buildStage: codepipeline.IStage;
  deployStage: codepipeline.IStage;
}

export class ServerlessCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: ServerlessCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const buildArtifact = codepipeline.Artifact.artifact(
      `${props.envSettings.projectEnvName}-workers`,
    );

    const buildProject = this.createBuildProject(props);
    props.buildStage.addAction(
      this.createBuildAction(
        {
          project: buildProject,
          input: props.inputArtifact,
          outputs: [buildArtifact],
        },
        props,
      ),
    );

    const deployProject = this.createDeployProject(props);
    props.deployStage.addAction(
      this.createDeployAction(
        {
          project: deployProject,
          input: buildArtifact,
          runOrder: this.getRunOrder(props.buildStage, 2),
        },
        props,
      ),
    );
  }

  private createBuildAction(
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: ServerlessCiConfigProps,
  ) {
    return new codepipelineActions.CodeBuildAction(<
      codepipelineActions.CodeBuildActionProps
    >{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-build-workers`,
      runOrder: this.getRunOrder(props.deployStage),
    });
  }

  private createBuildProject(props: ServerlessCiConfigProps) {
    const dockerAssumeRole = new iam.Role(this, 'BuildDockerAssume', {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    const installCommands = this.getAssumeRoleCommands();
    const preBuildCommands = [
      ...this.getWorkspaceSetupCommands(PnpmWorkspaceFilters.WORKERS),
    ];

    const project = new codebuild.Project(this, 'BuildProject', {
      projectName: `${props.envSettings.projectEnvName}-build-workers`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: installCommands,
          },
          pre_build: {
            commands: preBuildCommands,
          },
          build: {
            commands: [`pnpm saas workers lint`, `pnpm saas workers test`],
          },
        },
        cache: {
          paths: this.defaultCachePaths,
        },
        artifacts: {
          files: ['**/*'],
          'exclude-paths': ['./**/node_modules', './**/node_modules/**/*'],
        },
      }),
      environment: {
        privileged: true,
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        DOCKER_USERNAME: {
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: 'GlobalBuildSecrets:DOCKER_USERNAME',
        },
        DOCKER_PASSWORD: {
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: 'GlobalBuildSecrets:DOCKER_PASSWORD',
        },
        ASSUME_ROLE_ARN: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: dockerAssumeRole.roleArn,
        },
      },
      cache: codebuild.Cache.local(
        codebuild.LocalCacheMode.CUSTOM,
        codebuild.LocalCacheMode.DOCKER_LAYER,
      ),
    });

    BootstrapStack.getIamPolicyStatementsForEnvParameters(
      props.envSettings,
    ).forEach((statement) => {
      dockerAssumeRole.addToPolicy(statement);
      project.addToRolePolicy(statement);
    });

    EnvMainStack.getIamPolicyStatementsForEnvParameters(
      props.envSettings,
    ).forEach((statement) => {
      dockerAssumeRole.addToPolicy(statement);
      project.addToRolePolicy(statement);
    });

    GlobalECR.getPublicECRIamPolicyStatements().forEach((statement) => {
      project.addToRolePolicy(statement);
      dockerAssumeRole.addToPolicy(statement);
    });

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:*'],
        resources: ['*'],
      }),
    );

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        resources: [dockerAssumeRole.roleArn],
      }),
    );

    return project;
  }

  private createDeployAction(
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: ServerlessCiConfigProps,
  ) {
    return new codepipelineActions.CodeBuildAction(<
      codepipelineActions.CodeBuildActionProps
    >{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-deploy-workers`,
    });
  }

  private createDeployProject(props: ServerlessCiConfigProps) {
    const stack = Stack.of(this);
    const dockerAssumeRole = new iam.Role(this, 'DeployDockerAssume', {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    const installCommands = this.getAssumeRoleCommands();
    const preBuildCommands = [
      ...this.getWorkspaceSetupCommands(PnpmWorkspaceFilters.WORKERS),
    ];

    const project = new codebuild.Project(this, 'DeployProject', {
      projectName: `${props.envSettings.projectEnvName}-deploy-workers`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: installCommands,
          },
          pre_build: {
            commands: preBuildCommands,
          },
          build: { commands: [`pnpm saas workers deploy`] },
        },
        cache: {
          paths: this.defaultCachePaths,
        },
      }),
      environment: {
        privileged: true,
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        DOCKER_USERNAME: {
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: 'GlobalBuildSecrets:DOCKER_USERNAME',
        },
        DOCKER_PASSWORD: {
          type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: 'GlobalBuildSecrets:DOCKER_PASSWORD',
        },
        ASSUME_ROLE_ARN: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: dockerAssumeRole.roleArn,
        },
      },
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.DOCKER_LAYER),
    });

    BootstrapStack.getIamPolicyStatementsForEnvParameters(
      props.envSettings,
    ).forEach((statement) => {
      dockerAssumeRole.addToPolicy(statement);
      project.addToRolePolicy(statement);
    });

    EnvMainStack.getIamPolicyStatementsForEnvParameters(
      props.envSettings,
    ).forEach((statement) => {
      dockerAssumeRole.addToPolicy(statement);
      project.addToRolePolicy(statement);
    });

    GlobalECR.getPublicECRIamPolicyStatements().forEach((statement) => {
      dockerAssumeRole.addToPolicy(statement);
      project.addToRolePolicy(statement);
    });

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:*'],
        resources: ['*'],
      }),
    );

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        resources: [dockerAssumeRole.roleArn],
      }),
    );

    dockerAssumeRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cloudformation:*'],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-workers/*`,
        ],
      }),
    );

    dockerAssumeRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'iam:*',
          'cloudfront:*',
          's3:*',
          'lambda:*',
          'apigateway:*',
          'logs:*',
          'events:*',
          'ec2:DescribeSecurityGroups',
          'ec2:DescribeSubnets',
          'ec2:DescribeVpcs',
          'ec2:DescribeNetworkInterfaces',
          'cloudformation:ValidateTemplate',
          'states:*',
        ],
        resources: ['*'],
      }),
    );

    return project;
  }
}
