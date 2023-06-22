import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cc from 'aws-cdk-lib/aws-codecommit';
import {
  EnvConstructProps,
  PnpmWorkspaceFilters,
  ServiceCiConfig,
} from '@sb/infra-core';
import { GlobalECR } from '../global/resources/globalECR';
import { BootstrapStack } from '../bootstrap';
import { EnvMainStack } from '../main';

interface E2ETestsCiConfigProps extends EnvConstructProps {
  inputArtifact: codepipeline.Artifact;
  stage: codepipeline.IStage;
  codeRepository: cc.IRepository;
}

export class E2ETestsCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: E2ETestsCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const project = this.createProject(props);
    props.stage.addAction(
      this.createAction({ project, input: props.inputArtifact }, props)
    );
  }

  private createAction(
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: E2ETestsCiConfigProps
  ) {
    return new codepipelineActions.CodeBuildAction(<
      codepipelineActions.CodeBuildActionProps
    >{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-e2e-tests`,
    });
  }

  private createProject(props: E2ETestsCiConfigProps) {
    const dockerAssumeRole = new iam.Role(this, 'BuildDockerAssume', {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    const basicAuth = props.envSettings.appBasicAuth?.split(':');

    const installCommands = this.getAssumeRoleCommands();
    const preBuildCommands = [
      ...this.getWorkspaceSetupCommands(PnpmWorkspaceFilters.E2E_TESTS),
      this.getECRLoginCommand(),
    ];
    const baseImage = `${GlobalECR.getECRPublicCacheUrl()}/${
      props.envSettings.dockerImages.e2eTestsBaseImage
    }`;

    const project = new codebuild.Project(this, 'E2ETestsProject', {
      projectName: `${props.envSettings.projectEnvName}-e2e-tests`,
      source: codebuild.Source.codeCommit({ repository: props.codeRepository }),
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: installCommands,
          },
          pre_build: {
            commands: preBuildCommands,
          },
          build: { commands: ['pnpm nx run e2e-tests:test'] },
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
        ASSUME_ROLE_ARN: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: dockerAssumeRole.roleArn,
        },
        E2E_TESTS_BASE_IMAGE: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: baseImage,
        },
        ...(basicAuth
          ? {
              CYPRESS_BASIC_AUTH_LOGIN: {
                type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                value: basicAuth[0],
              },
              CYPRESS_BASIC_AUTH_PASSWORD: {
                type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                value: basicAuth[1],
              },
              CYPRESS_BASIC_AUTH_HEADER: {
                type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
                value: `Basic ${Buffer.from(
                  `${basicAuth[0]}:${basicAuth[1]}`
                ).toString('base64')}`,
              },
            }
          : {}),
      },
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.DOCKER_LAYER),
    });

    BootstrapStack.getIamPolicyStatementsForEnvParameters(
      props.envSettings
    ).forEach((statement) => {
      dockerAssumeRole.addToPolicy(statement);
      project.addToRolePolicy(statement);
    });

    EnvMainStack.getIamPolicyStatementsForEnvParameters(
      props.envSettings
    ).forEach((statement) => {
      dockerAssumeRole.addToPolicy(statement);
      project.addToRolePolicy(statement);
    });

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        resources: [dockerAssumeRole.roleArn],
      })
    );

    GlobalECR.getPublicECRIamPolicyStatements().forEach((statement) =>
      project.addToRolePolicy(statement)
    );

    return project;
  }
}
