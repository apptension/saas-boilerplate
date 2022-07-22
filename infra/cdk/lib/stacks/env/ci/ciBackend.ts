import {Construct} from "constructs";
import {Stack} from "aws-cdk-lib";
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  Cache,
  LinuxBuildImage,
  LocalCacheMode,
  Project,
} from "aws-cdk-lib/aws-codebuild";
import {CodeBuildAction, CodeBuildActionProps,} from "aws-cdk-lib/aws-codepipeline-actions";
import {Artifact, IStage} from "aws-cdk-lib/aws-codepipeline";
import {IRepository} from "aws-cdk-lib/aws-ecr";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

import {EnvConstructProps} from "../../../types";
import {ServiceCiConfig} from "../../../patterns/serviceCiConfig";

interface BackendCiConfigProps extends EnvConstructProps {
  inputArtifact: Artifact;
  buildStage: IStage;
  deployStage: IStage;
  backendRepository: IRepository;
}

export class BackendCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: BackendCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const buildProject = this.createBuildProject(props);
    props.buildStage.addAction(
      this.createBuildAction(
        "backend",
        {
          project: buildProject,
        },
        props
      )
    );

    const apiDeployProject = this.createApiDeployProject(props);
    props.deployStage.addAction(
      this.createDeployAction(
        "api",
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
        "migrations",
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
    actionProps: Partial<CodeBuildActionProps>,
    props: BackendCiConfigProps
  ) {
    return new CodeBuildAction(<CodeBuildActionProps>{
      actionName: `${props.envSettings.projectEnvName}-build-${name}`,
      project: actionProps.project,
      input: props.inputArtifact,
    });
  }

  private createBuildProject(props: BackendCiConfigProps) {
    const project = new Project(this, "BackendBuildProject", {
      projectName: `${props.envSettings.projectEnvName}-build-backend`,
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          build: { commands: ["make -C services/backend build"] },
        },
      }),
      environment: {
        privileged: true,
        buildImage: LinuxBuildImage.STANDARD_6_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        ...{
          DOCKER_USERNAME: {
            type: BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: "GlobalBuildSecrets:DOCKER_USERNAME",
          },
          DOCKER_PASSWORD: {
            type: BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: "GlobalBuildSecrets:DOCKER_PASSWORD",
          },
        },
      },
      cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
    });
    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["secretsmanager:*"],
        resources: ["*"],
      })
    );
    props.backendRepository.grantPullPush(project);

    return project;
  }

  private createDeployAction(
    name: string,
    actionProps: Partial<CodeBuildActionProps>,
    props: BackendCiConfigProps
  ) {
    return new CodeBuildAction(<CodeBuildActionProps>{
      ...actionProps,
      project: actionProps.project,
      actionName: `${props.envSettings.projectEnvName}-deploy-${name}`,
      input: props.inputArtifact,
    });
  }

  private createApiDeployProject(props: BackendCiConfigProps) {
    const stack = Stack.of(this);
    const project = new Project(this, "ApiDeployProject", {
      projectName: `${props.envSettings.projectEnvName}-deploy-api`,
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: { commands: ["make -C services/backend install-deploy"] },
          build: { commands: ["make -C services/backend deploy-api"] },
        },
        cache: {
          paths: [...this.defaultCachePaths],
        },
      }),
      environment: { buildImage: LinuxBuildImage.STANDARD_6_0 },
      environmentVariables: { ...this.defaultEnvVariables },
      cache: Cache.local(LocalCacheMode.CUSTOM),
    });

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["cloudformation:*"],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-ApiStack/*`,
        ],
      })
    );

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "iam:*",
          "sts:*",
          "ec2:*",
          "ecs:*",
          "application-autoscaling:*",
          "logs:*",
          "elasticloadbalancing:*",
          "route53:*",
          "s3:*",
        ],
        resources: ["*"],
      })
    );

    return project;
  }

  private createMigrationsDeployProject(props: BackendCiConfigProps) {
    const stack = Stack.of(this);
    const project = new Project(this, "MigrationsDeployProject", {
      projectName: `${props.envSettings.projectEnvName}-deploy-migrations`,
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: { commands: ["make -C services/backend install-deploy"] },
          build: { commands: ["make -C services/backend deploy-migrations"] },
        },
        cache: {
          paths: [...this.defaultCachePaths],
        },
      }),
      environment: { buildImage: LinuxBuildImage.STANDARD_6_0 },
      environmentVariables: { ...this.defaultEnvVariables },
      cache: Cache.local(LocalCacheMode.CUSTOM),
    });

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["cloudformation:*"],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-MigrationsStack/*`,
        ],
      })
    );

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "iam:*",
          "sts:*",
          "ec2:*",
          "ecs:*",
          "states:*",
          "lambda:*",
          "logs:*",
          "route53:*",
        ],
        resources: ["*"],
      })
    );

    return project;
  }
}
