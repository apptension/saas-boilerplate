import { Construct } from 'constructs';
import { aws_events_targets as targets } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as events from 'aws-cdk-lib/aws-events';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import { EnvConstructProps, EnvironmentSettings } from '@sb/infra-core';
import { getInfraFunctionArnByName } from '../../lib/names';

export interface CiEntrypointProps extends EnvConstructProps {
  codeRepository: codecommit.IRepository;
}

export class CiEntrypoint extends Construct {
  public artifactsBucket: s3.Bucket;
  private readonly codeBuildProject: codebuild.Project;
  private readonly triggerFunction: lambda.IFunction;
  private readonly onDeployCommitRule: events.Rule;

  static getArtifactsIdentifier(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-entrypoint`;
  }

  static getArtifactsName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-entrypoint`;
  }

  constructor(scope: Construct, id: string, props: CiEntrypointProps) {
    super(scope, id);

    this.artifactsBucket = new s3.Bucket(this, 'ArtifactsBucket', {
      versioned: true,
    });

    const trail = new cloudtrail.Trail(this, 'CloudTrail');
    trail.addS3EventSelector(
      [
        {
          bucket: this.artifactsBucket,
          objectPrefix: CiEntrypoint.getArtifactsName(props.envSettings),
        },
      ],
      {
        readWriteType: cloudtrail.ReadWriteType.WRITE_ONLY,
      },
    );

    this.codeBuildProject = this.createBuildProject(
      this.artifactsBucket,
      props,
    );

    this.triggerFunction = lambda.Function.fromFunctionArn(
      this,
      'TriggerLambda',
      getInfraFunctionArnByName(this, 'TriggerEntrypoint', {
        envSettings: props.envSettings,
      }),
    );
    this.onDeployCommitRule = props.codeRepository.onCommit('OnDeployCommit', {
      target: new targets.LambdaFunction(this.triggerFunction),
    });
    // add permissions resource-based permissions to imported lambda
    new lambda.CfnPermission(this, 'AllowOnDeployCommit', {
      action: 'lambda:InvokeFunction',
      functionName: this.triggerFunction.functionName,
      principal: 'events.amazonaws.com',
      sourceArn: this.onDeployCommitRule.ruleArn,
    });
  }

  private createBuildProject(
    artifactsBucket: s3.Bucket,
    props: CiEntrypointProps,
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
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
      environmentVariables: {
        CI: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: 'true',
        },
        PROJECT_NAME: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.projectName,
        },
        ENV_STAGE: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
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
