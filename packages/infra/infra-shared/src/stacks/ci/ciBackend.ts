import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  EnvConstructProps,
  ServiceCiConfig,
} from '@saas-boilerplate-app/infra-core';

interface BackendCiConfigProps extends EnvConstructProps {
  inputArtifact: codepipeline.Artifact;
  buildStage: codepipeline.IStage;
  deployStage: codepipeline.IStage;
  backendRepository: ecr.IRepository;
}

export class BackendCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: BackendCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const buildProject = this.createBuildProject(props);
    props.buildStage.addAction(
      this.createBuildAction(
        'backend',
        {
          project: buildProject,
        },
        props
      )
    );

    const apiDeployProject = this.createApiDeployProject(props);
    props.deployStage.addAction(
      this.createDeployAction(
        'api',
        {
          project: apiDeployProject,
          runOrder: 2,
        },
        props
      )
    );

    const migrationsDeployProject = this.createMigrationsDeployProject(props);
    props.deployStage.addAction(
      this.createDeployAction(
        'migrations',
        {
          project: migrationsDeployProject,
          runOrder: 2,
        },
        props
      )
    );
  }

  private createBuildAction(
    name: string,
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: BackendCiConfigProps
  ) {
    return new codepipelineActions.CodeBuildAction(<
      codepipelineActions.CodeBuildActionProps
    >{
      actionName: `${props.envSettings.projectEnvName}-build-${name}`,
      project: actionProps.project,
      input: props.inputArtifact,
    });
  }

  private createBuildProject(props: BackendCiConfigProps) {
    const project = new codebuild.Project(this, 'BackendBuildProject', {
      projectName: `${props.envSettings.projectEnvName}-build-backend`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'npm i -g nx@^15.4.5 pnpm@^7.25.0',
              `pnpm install \
                --include-workspace-root \
                --frozen-lockfile \
                --filter=backend...`,
            ],
          },
          build: {
            commands: ['nx run backend:build'],
          },
        },
      }),
      environment: {
        privileged: true,
        buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
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
    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['secretsmanager:*'],
        resources: ['*'],
      })
    );
    props.backendRepository.grantPullPush(project);

    return project;
  }

  private createDeployAction(
    name: string,
    actionProps: Partial<codepipelineActions.CodeBuildActionProps>,
    props: BackendCiConfigProps
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

  private createApiDeployProject(props: BackendCiConfigProps) {
    const stack = Stack.of(this);
    const project = new codebuild.Project(this, 'ApiDeployProject', {
      projectName: `${props.envSettings.projectEnvName}-deploy-api`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'npm i -g nx@^15.4.5 pnpm@^7.25.0',
              `pnpm install \
                --include-workspace-root \
                --frozen-lockfile \
                --filter=backend...`,
            ],
          },
          build: { commands: ['nx run backend:deploy:api'] },
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
        actions: ['cloudformation:*'],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-ApiStack/*`,
        ],
      })
    );

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
      })
    );

    return project;
  }

  private createMigrationsDeployProject(props: BackendCiConfigProps) {
    const stack = Stack.of(this);
    const project = new codebuild.Project(this, 'MigrationsDeployProject', {
      projectName: `${props.envSettings.projectEnvName}-deploy-migrations`,
      buildSpec: codebuild.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: [
              'npm i -g nx@^15.4.5 pnpm@^7.25.0',
              `pnpm install \
                --include-workspace-root \
                --frozen-lockfile \
                --filter=backend...`,
            ],
          },
          build: { commands: ['nx run backend:deploy:migrations'] },
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
        actions: ['cloudformation:*'],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-MigrationsStack/*`,
        ],
      })
    );

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'iam:*',
          'sts:*',
          'ec2:*',
          'ecs:*',
          'states:*',
          'lambda:*',
          'logs:*',
          'route53:*',
          'stepfunctions:*',
        ],
        resources: ['*'],
      })
    );

    return project;
  }
}
