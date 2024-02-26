import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import {
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
  EnvConstructProps,
  PnpmWorkspaceFilters,
  ServiceCiConfig,
} from '@sb/infra-core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { BootstrapStack } from '../bootstrap';
import { EnvMainStack } from '../main';
import { GlobalECR } from '../global/resources/globalECR';

interface ComponentsCiConfigProps extends EnvConstructProps {
  inputArtifact: Artifact;
  buildStage: IStage;
  deployStage: IStage;
}

export class ComponentsCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: ComponentsCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    props.deployStage.addAction(
      this.createDeployAction(
        {
          project: this.createDeployProject(props),
        },
        props,
      ),
    );
  }

  private createDeployAction(
    actionProps: Partial<CodeBuildActionProps>,
    props: ComponentsCiConfigProps,
  ) {
    return new CodeBuildAction(<CodeBuildActionProps>{
      ...actionProps,
      project: actionProps.project,
      actionName: `${props.envSettings.projectEnvName}-deploy-components`,
      input: props.inputArtifact,
      runOrder: this.getRunOrder(props.deployStage, 1),
    });
  }

  private createDeployProject(props: ComponentsCiConfigProps) {
    const stack = Stack.of(this);
    const project = new Project(this, 'ComponentsDeployProject', {
      projectName: `${props.envSettings.projectEnvName}-deploy-components`,
      buildSpec: BuildSpec.fromObject({
        version: '0.2',
        phases: {
          pre_build: {
            commands: this.getWorkspaceSetupCommands(
              PnpmWorkspaceFilters.INFRA_SHARED,
            ),
          },
          build: { commands: ['pnpm saas infra deploy components'] },
        },
        cache: {
          paths: [...this.defaultCachePaths],
        },
      }),
      environment: { buildImage: LinuxBuildImage.STANDARD_7_0 },
      environmentVariables: { ...this.defaultEnvVariables },
      cache: Cache.local(LocalCacheMode.CUSTOM),
    });

    project.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['cloudformation:*'],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-ComponentsStack/*`,
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
          'logs:*',
          's3:*',
          'sqs:*',
          'events:*',
          'apigateway:*',
          'cloudfront:*',
          'route53:*',
        ],
        resources: ['*'],
      }),
    );

    return project;
  }
}
