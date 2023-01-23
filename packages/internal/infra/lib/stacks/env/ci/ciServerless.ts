import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  Cache,
  LinuxBuildImage,
  LocalCacheMode,
  Project,
} from 'aws-cdk-lib/aws-codebuild';
import {
  CodeBuildAction,
  CodeBuildActionProps,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import { Artifact, IStage } from 'aws-cdk-lib/aws-codepipeline';
import {
  AccountRootPrincipal,
  Effect,
  PolicyStatement,
  Role,
} from 'aws-cdk-lib/aws-iam';

import { EnvConstructProps } from '../../../types';
import { ServiceCiConfig } from '../../../patterns/serviceCiConfig';
import { IRepository } from 'aws-cdk-lib/aws-ecr';

interface ServerlessCiConfigProps extends EnvConstructProps {
  name: string;
  inputArtifact: Artifact;
  buildStage: IStage;
  deployStage: IStage;
  webappBaseRepository: IRepository;
}

export class ServerlessCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: ServerlessCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const buildArtifact = Artifact.artifact(
      `${props.envSettings.projectEnvName}-${props.name}`
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
    actionProps: Partial<CodeBuildActionProps>,
    props: ServerlessCiConfigProps
  ) {
    return new CodeBuildAction(<CodeBuildActionProps>{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-build-${props.name}`,
    });
  }

  private createBuildProject(props: ServerlessCiConfigProps) {
    const dockerAssumeRole = new Role(this, 'BuildDockerAssume', {
      assumedBy: new AccountRootPrincipal(),
    });

    const project = new Project(this, 'BuildProject', {
      projectName: `${props.envSettings.projectEnvName}-build-${props.name}`,
      buildSpec: BuildSpec.fromObject({
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
              'go get github.com/segmentio/chamber',
              'npm i -g nx@^15.4.5 pnpm@^7.25.0',
              `pnpm install \
                --include-workspace-root \
                --frozen-lockfile \
                --filter=!e2e-tests \
                --filter=!docs \
                --filter=!status-dashboard \
                --filter=!local-ws-server`,
            ],
          },
          build: {
            commands: [
              'nx run webapp:build:emails',
              `nx run ${props.name}:test`,
            ],
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
        buildImage: LinuxBuildImage.STANDARD_6_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        DOCKER_USERNAME: {
          type: BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: 'GlobalBuildSecrets:DOCKER_USERNAME',
        },
        DOCKER_PASSWORD: {
          type: BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: 'GlobalBuildSecrets:DOCKER_PASSWORD',
        },
        ASSUME_ROLE_ARN: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: dockerAssumeRole.roleArn,
        },
      },
      cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.DOCKER_LAYER),
    });

    dockerAssumeRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['kms:*', 'ssm:*'],
        resources: ['*'],
      })
    );

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['secretsmanager:*'],
        resources: ['*'],
      })
    );

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        resources: [dockerAssumeRole.roleArn],
      })
    );

    props.webappBaseRepository.grantPull(dockerAssumeRole);

    return project;
  }

  private createDeployAction(
    actionProps: Partial<CodeBuildActionProps>,
    props: ServerlessCiConfigProps
  ) {
    return new CodeBuildAction(<CodeBuildActionProps>{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-deploy-${props.name}`,
    });
  }

  private createDeployProject(props: ServerlessCiConfigProps) {
    const stack = Stack.of(this);
    const dockerAssumeRole = new Role(this, 'DeployDockerAssume', {
      assumedBy: new AccountRootPrincipal(),
    });

    const project = new Project(this, 'DeployProject', {
      projectName: `${props.envSettings.projectEnvName}-deploy-${props.name}`,
      buildSpec: BuildSpec.fromObject({
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
                --filter=core \
                --filter=tools`,
            ],
          },
          build: { commands: [`nx run ${props.name}:deploy`] },
        },
        cache: {
          paths: this.defaultCachePaths,
        },
      }),
      environment: {
        privileged: true,
        buildImage: LinuxBuildImage.STANDARD_6_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        DOCKER_USERNAME: {
          type: BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: 'GlobalBuildSecrets:DOCKER_USERNAME',
        },
        DOCKER_PASSWORD: {
          type: BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: 'GlobalBuildSecrets:DOCKER_PASSWORD',
        },
        ASSUME_ROLE_ARN: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: dockerAssumeRole.roleArn,
        },
      },
      cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
    });

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['secretsmanager:*'],
        resources: ['*'],
      })
    );

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        resources: [dockerAssumeRole.roleArn],
      })
    );

    dockerAssumeRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['cloudformation:*'],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-${props.name}/*`,
        ],
      })
    );

    dockerAssumeRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['kms:*', 'ssm:*'],
        resources: ['*'],
      })
    );

    dockerAssumeRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'iam:*',
          'cloudfront:*',
          's3:*',
          'lambda:*',
          'apigateway:*',
          'logs:*',
          'kms:*',
          'ssm:*',
          'events:*',
          'ec2:DescribeSecurityGroups',
          'ec2:DescribeSubnets',
          'ec2:DescribeVpcs',
          'ec2:DescribeNetworkInterfaces',
          'cloudformation:ValidateTemplate',
          'states:*',
        ],
        resources: ['*'],
      })
    );

    props.webappBaseRepository.grantPull(dockerAssumeRole);

    return project;
  }
}
