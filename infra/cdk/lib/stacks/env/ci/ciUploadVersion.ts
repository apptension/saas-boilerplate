import {Construct} from "constructs";
import {BuildSpec, Cache, LinuxBuildImage, LocalCacheMode, Project} from "aws-cdk-lib/aws-codebuild";
import {CodeBuildAction, CodeBuildActionProps} from "aws-cdk-lib/aws-codepipeline-actions";
import {Artifact, IStage} from "aws-cdk-lib/aws-codepipeline";
import {Effect, PolicyStatement} from "aws-cdk-lib/aws-iam";

import {EnvConstructProps} from "../../../types";
import {ServiceCiConfig} from "../../../patterns/serviceCiConfig";

interface UploadVersionCiConfigProps extends EnvConstructProps {
  inputArtifact: Artifact;
  stage: IStage;
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
    actionProps: Partial<CodeBuildActionProps>,
    props: UploadVersionCiConfigProps
  ) {
    return new CodeBuildAction(<CodeBuildActionProps>{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-upload-version`,
    });
  }

  private createDeployProject(props: UploadVersionCiConfigProps) {
    const project = new Project(this, "UploadVersionDeployProject", {
      projectName: `${props.envSettings.projectEnvName}-upload-version`,
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: { commands: ["make install-scripts"] },
          build: { commands: ["make upload-version"] },
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
        actions: ["s3:*"],
        resources: ["*"],
      })
    );

    return project;
  }
}
