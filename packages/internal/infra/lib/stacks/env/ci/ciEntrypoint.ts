import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { BuildEnvironmentVariableType } from 'aws-cdk-lib/aws-codebuild';
import { aws_events_targets as targets, Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { EnvConstructProps } from '../../../types';
import { EnvironmentSettings } from '../../../settings';

export interface CiEntrypointProps extends EnvConstructProps {
  codeRepository: codecommit.IRepository;
}

export class CiEntrypoint extends Construct {
  public artifactsBucket: s3.Bucket;
  private readonly codeBuildProject: codebuild.Project;
  private readonly triggerFunction: lambda.IFunction;

  static getArtifactsIdentifier(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-entrypoint`;
  }

  static getArtifactsName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-entrypoint`;
  }

  constructor(scope: Construct, id: string, props: CiEntrypointProps) {
    super(scope, id);
    const stack = Stack.of(this);

    this.artifactsBucket = new s3.Bucket(this, 'ArtifactsBucket', {
      versioned: true,
    });
    this.codeBuildProject = this.createBuildProject(
      this.artifactsBucket,
      props
    );

    this.triggerFunction = lambda.Function.fromFunctionArn(
      this,
      'TriggerLambda',
      `arn:aws:lambda:${stack.region}:${stack.account}:function:${props.envSettings.projectEnvName}-functions-TriggerEntrypoint`
    );
    props.codeRepository.onCommit('OnDeployCommit', {
      target: new targets.LambdaFunction(this.triggerFunction),
    });
  }

  private createBuildProject(
    artifactsBucket: s3.Bucket,
    props: CiEntrypointProps
  ) {
    return new codebuild.Project(this, 'Project', {
      projectName: props.envSettings.projectEnvName,
      description: `Run this project to deploy ${props.envSettings.envStage} environment`,
      buildSpec: this.createBuildSpec(),
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.SOURCE),
      source: codebuild.Source.codeCommit({ repository: props.codeRepository }),
      artifacts: codebuild.Artifacts.s3({
        identifier: CiEntrypoint.getArtifactsIdentifier(props.envSettings),
        bucket: artifactsBucket,
        name: CiEntrypoint.getArtifactsName(props.envSettings),
        includeBuildId: false,
        path: '',
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
      },
      environmentVariables: {
        CI: { type: BuildEnvironmentVariableType.PLAINTEXT, value: 'true' },
        PROJECT_NAME: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.projectName,
        },
        ENV_STAGE: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.envStage,
        },
      },
    });
  }

  private createBuildSpec() {
    return codebuild.BuildSpec.fromObject({
      version: '0.2',
      phases: {
        build: {
          commands: [
            'app_version=$(git describe --tags --first-parent --abbrev=11 --long --dirty --always)',
            'cp .env.${ENV_STAGE} .env',
            'echo "VERSION=${app_version}" >> .env',
          ],
        },
      },
      artifacts: {
        files: ['**/*'],
      },
    });
  }
}
