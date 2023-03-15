import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  EnvConstructProps,
  ServiceCiConfig,
} from '@sb/infra-core';

interface DocsCiConfigProps extends EnvConstructProps {
  inputArtifact: codepipeline.Artifact;
  buildStage: codepipeline.IStage;
  deployStage: codepipeline.IStage;
}

export class DocsCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: DocsCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const buildArtifact = codepipeline.Artifact.artifact(
      `${props.envSettings.projectEnvName}-docs`
    );

    const buildProject = this.createBuildProject(props);
    props.buildStage.addAction(
      this.createBuildAction(
        {
          project: buildProject,
          input: props.inputArtifact,
          outputs: [buildArtifact],
        },
        props
      )
    );

    const deployProject = this.createDeployProject(props);
    props.deployStage.addAction(
      this.createDeployAction(
        {
          project: deployProject,
          input: buildArtifact,
          runOrder: 2,
        },
        props
      )
    );
  }

  private createBuildAction(
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: DocsCiConfigProps
  ) {
    return new codepipelineActions.CodeBuildAction(<
      codepipelineActions.CodeBuildActionProps
    >{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-build-docs`,
    });
  }

  private createBuildProject(props: DocsCiConfigProps) {
    return new codebuild.Project(this, 'DocsBuildProject', {
      projectName: `${props.envSettings.projectEnvName}-build-docs`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'npm i -g nx@^15.4.5 pnpm@^7.25.0',
              `pnpm install \
                --include-workspace-root \
                --frozen-lockfile \
                --filter=docs...`,
            ],
          },
          build: { commands: ['nx run docs:build'] },
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
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        VITE_ENVIRONMENT_NAME: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.envStage,
        },
      },
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.DOCKER_LAYER),
    });
  }

  private createDeployAction(
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: DocsCiConfigProps
  ) {
    return new codepipelineActions.CodeBuildAction(<
      codepipelineActions.CodeBuildActionProps
    >{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-deploy-docs`,
    });
  }

  private createDeployProject(props: DocsCiConfigProps) {
    const stack = Stack.of(this);
    const project = new codebuild.Project(this, 'DocsDeployProject', {
      projectName: `${props.envSettings.projectEnvName}-deploy-docs`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'npm i -g nx@^15.4.5 pnpm@^7.25.0',
              `pnpm install \
                --include-workspace-root \
                --frozen-lockfile \
                --filter=docs...`,
            ],
          },
          build: { commands: ['nx run docs:deploy'] },
        },
        cache: {
          paths: [...this.defaultCachePaths],
        },
      }),
      environmentVariables: { ...this.defaultEnvVariables },
      environment: { buildImage: codebuild.LinuxBuildImage.STANDARD_6_0 },
      cache: codebuild.Cache.local(codebuild.LocalCacheMode.CUSTOM),
    });

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cloudformation:*'],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-DocsStack/*`,
        ],
      })
    );

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'iam:*',
          'sts:*',
          'cloudfront:*',
          's3:*',
          'ecs:*',
          'lambda:*',
          'route53:*',
        ],
        resources: ['*'],
      })
    );

    return project;
  }
}
