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
import {CodeBuildAction, CodeBuildActionProps} from "aws-cdk-lib/aws-codepipeline-actions";
import {Artifact, IStage} from "aws-cdk-lib/aws-codepipeline";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

import {EnvConstructProps} from "../../../types";
import {ServiceCiConfig} from "../../../patterns/serviceCiConfig";

interface DocsCiConfigProps extends EnvConstructProps {
  inputArtifact: Artifact;
  buildStage: IStage;
  deployStage: IStage;
}

export class DocsCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: DocsCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const buildArtifact = Artifact.artifact(
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
    actionProps: Partial<CodeBuildActionProps>,
    props: DocsCiConfigProps
  ) {
    return new CodeBuildAction(<CodeBuildActionProps>{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-build-docs`,
    });
  }

  private createBuildProject(props: DocsCiConfigProps) {
    const project = new Project(this, "DocsBuildProject", {
      projectName: `${props.envSettings.projectEnvName}-build-docs`,
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: { commands: ["make -C services/docs install"] },
          build: { commands: ["make -C services/docs build"] },
        },
        artifacts: {
          files: [
            "*",
            "infra/**/*",
            "scripts/**/*",
            "services/docs/*",
            "services/docs/build/**/*",
          ],
        },
      }),
      environment: {
        privileged: true,
        buildImage: LinuxBuildImage.STANDARD_6_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        REACT_APP_ENVIRONMENT_NAME: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.envStage,
        },
      },
      cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
    });

    return project;
  }

  private createDeployAction(
    actionProps: Partial<CodeBuildActionProps>,
    props: DocsCiConfigProps
  ) {
    return new CodeBuildAction(<CodeBuildActionProps>{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-deploy-docs`,
    });
  }

  private createDeployProject(props: DocsCiConfigProps) {
    const stack = Stack.of(this);
    const project = new Project(this, "DocsDeployProject", {
      projectName: `${props.envSettings.projectEnvName}-deploy-docs`,
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: { commands: ["make -C services/docs install-deploy"] },
          build: { commands: ["make -C services/docs deploy"] },
        },
        cache: {
          paths: [...this.defaultCachePaths],
        },
      }),
      environmentVariables: { ...this.defaultEnvVariables },
      environment: { buildImage: LinuxBuildImage.STANDARD_6_0 },
      cache: Cache.local(LocalCacheMode.CUSTOM),
    });

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["cloudformation:*"],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-DocsStack/*`,
        ],
      })
    );

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "iam:*",
          "sts:*",
          "cloudfront:*",
          "s3:*",
          "ecs:*",
          "lambda:*",
          "route53:*",
        ],
        resources: ["*"],
      })
    );

    return project;
  }
}
