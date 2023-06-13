import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codebuildActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as iam from 'aws-cdk-lib/aws-iam';
import { EnvConstructProps, ServiceCiConfig } from '@sb/infra-core';

interface UploadVersionCiConfigProps extends EnvConstructProps {
  inputArtifact: codepipeline.Artifact;
  stage: codepipeline.IStage;
}

export class UploadVersionCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: UploadVersionCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const deployProject = this.createDeployProject(props);
    props.stage.addAction(
      this.createDeployAction(
        {
          project: deployProject,
          input: props.inputArtifact,
          runOrder: 3,
        },
        props
      )
    );
  }

  private createDeployAction(
    actionProps: Partial<codebuildActions.CodeBuildActionProps>,
    props: UploadVersionCiConfigProps
  ) {
    return new codebuildActions.CodeBuildAction(<
      codebuildActions.CodeBuildActionProps
    >{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-upload-version`,
    });
  }

  private createDeployProject(props: UploadVersionCiConfigProps) {
    const project = new codebuild.Project(this, 'UploadVersionDeployProject', {
      projectName: `${props.envSettings.projectEnvName}-upload-version`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'npm i -g pnpm@^8.6.1',
              `pnpm install \
                --include-workspace-root \
                --frozen-lockfile \
                --filter=core \
                --filter=tools`,
            ],
          },
          build: {
            commands: [
              'pnpm nx run tools:upload-version migrations,api,workers,webapp',
            ],
          },
        },
        cache: {
          paths: [...this.defaultCachePaths],
        },
      }),
      environment: { buildImage: codebuild.LinuxBuildImage.STANDARD_6_0 },
      environmentVariables: { ...this.defaultEnvVariables },
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM),
    });

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['kms:*', 'ssm:*'],
        resources: ['*'],
      })
    );

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['s3:*'],
        resources: ['*'],
      })
    );

    return project;
  }
}
