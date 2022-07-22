import * as path from "path";
import {Construct} from "constructs";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {IRepository} from "aws-cdk-lib/aws-codecommit";
import {
    Artifacts,
    BuildSpec,
    Cache,
    LinuxBuildImage,
    LocalCacheMode,
    Project,
    Source,
} from "aws-cdk-lib/aws-codebuild";
import {aws_events_targets as targets} from "aws-cdk-lib";
import {Code, Function, Runtime} from "aws-cdk-lib/aws-lambda";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";

import {EnvConstructProps} from "../../../types";
import {EnvironmentSettings} from "../../../settings";

export interface CiEntrypointProps extends EnvConstructProps {
  codeRepository: IRepository;
}

export class CiEntrypoint extends Construct {
    public artifactsBucket: Bucket;
    private readonly codeBuildProject: Project;
    private readonly triggerFunction: Function;

  static getArtifactsIdentifier(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-entrypoint`;
  }

  static getArtifactsName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-entrypoint`;
  }

  constructor(scope: Construct, id: string, props: CiEntrypointProps) {
    super(scope, id);

    this.artifactsBucket = new Bucket(this, "ArtifactsBucket", {
      versioned: true,
    });
    this.codeBuildProject = this.createBuildProject(
      this.artifactsBucket,
      props
    );

    const deployBranches = props.envSettings.deployBranches;
    if (deployBranches.length > 0) {
        this.triggerFunction = new Function(this, 'TriggerLambda', {
            runtime: Runtime.NODEJS_12_X,
            handler: 'index.handler',
            code: Code.fromAsset(path.join(__dirname, 'functions', 'trigger-entrypoint')),
            environment: {
                PROJECT_ENV_NAME: props.envSettings.projectEnvName,
                DEPLOY_BRANCHES: JSON.stringify(deployBranches),
                PROJECT_NAME: this.codeBuildProject.projectName
            }
        });

        this.triggerFunction.addToRolePolicy(new PolicyStatement({
            actions: [
                'codebuild:StartBuild',
            ],
            resources: [this.codeBuildProject.projectArn]
        }));
        props.codeRepository.onCommit('OnDeployCommit', {
            target: new targets.LambdaFunction(this.triggerFunction)
        });
    }
  }

  private createBuildProject(
    artifactsBucket: Bucket,
    props: CiEntrypointProps
  ) {
    return new Project(this, "Project", {
      projectName: `${props.envSettings.projectEnvName}`,
      description: `Run this project to deploy ${props.envSettings.envStage} environment`,
      buildSpec: this.createBuildSpec(),
      cache: Cache.local(LocalCacheMode.SOURCE),
      source: Source.codeCommit({ repository: props.codeRepository }),
      artifacts: Artifacts.s3({
        identifier: CiEntrypoint.getArtifactsIdentifier(props.envSettings),
        bucket: artifactsBucket,
        name: CiEntrypoint.getArtifactsName(props.envSettings),
        includeBuildId: false,
        path: "",
      }),
      environment: {
        buildImage: LinuxBuildImage.STANDARD_6_0,
      },
    });
  }

  private createBuildSpec() {
    return BuildSpec.fromObject({
      version: "0.2",
      phases: {
        build: {
          commands: ["make version > VERSION"],
        },
      },
      artifacts: {
        files: ["**/*"],
      },
    });
  }
}
