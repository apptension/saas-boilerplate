import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cc from 'aws-cdk-lib/aws-codecommit';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import {
  EnvConstructProps,
  ServiceCiConfig,
} from '@saas-boilerplate-app/infra-core';

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
    dockerAssumeRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['kms:*', 'ssm:*'],
        resources: ['*'],
      })
    );

    const basicAuth = props.envSettings.appBasicAuth?.split(':');

    const project = new codebuild.Project(this, 'E2ETestsProject', {
      projectName: `${props.envSettings.projectEnvName}-e2e-tests`,
      source: codebuild.Source.codeCommit({ repository: props.codeRepository }),
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            commands: [
              'TEMP_ROLE=`aws sts assume-role --role-arn $ASSUME_ROLE_ARN --role-session-name test`',
              'export TEMP_ROLE',
              'export AWS_ACCESS_KEY_ID=$(echo "${TEMP_ROLE}" | jq -r \'.Credentials.AccessKeyId\')',
              'export AWS_SECRET_ACCESS_KEY=$(echo "${TEMP_ROLE}" | jq -r \'.Credentials.SecretAccessKey\')',
              'export AWS_SESSION_TOKEN=$(echo "${TEMP_ROLE}" | jq -r \'.Credentials.SessionToken\')',
            ],
          },
          pre_build: {
            commands: [
              'npm i -g nx@^15.4.5 pnpm@^7.25.0',
              `pnpm install \
                --include-workspace-root \
                --frozen-lockfile \
                --filter=e2e-tests^...`,
            ],
          },
          build: { commands: ['nx run e2e-tests:test'] },
        },
        cache: {
          paths: this.defaultCachePaths,
        },
      }),
      environment: {
        privileged: true,
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        ASSUME_ROLE_ARN: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: dockerAssumeRole.roleArn,
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

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        resources: [dockerAssumeRole.roleArn],
      })
    );

    return project;
  }
}
