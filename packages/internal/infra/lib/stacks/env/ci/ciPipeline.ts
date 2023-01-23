import {Construct} from "constructs";
import {Artifact, Pipeline} from "aws-cdk-lib/aws-codepipeline";
import {S3SourceAction, S3Trigger} from "aws-cdk-lib/aws-codepipeline-actions";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {aws_codecommit as cc, aws_ecr as ecr} from "aws-cdk-lib";

import {EnvConstructProps} from "../../../types";
import {EnvironmentSettings} from "../../../settings";
import {CiEntrypoint} from "./ciEntrypoint";
import {BackendCiConfig} from "./ciBackend";
import {WebappCiConfig} from "./ciWebApp";
import {ServerlessCiConfig} from "./ciServerless";
import {UploadVersionCiConfig} from "./ciUploadVersion";
import {ComponentsCiConfig} from "./ciComponents";
import {E2ETestsCiConfig} from "./e2eTests";
import {DocsCiConfig} from "./ciDocs";

export interface CiPipelineProps extends EnvConstructProps {
  entrypointArtifactBucket: Bucket;
  backendRepository: ecr.IRepository;
  webappBaseRepository: ecr.IRepository;
  e2eBaseRepository: ecr.IRepository;
  codeRepository: cc.IRepository;
}

export class CiPipeline extends Construct {
  buildStageName = "Build";
  deployStageName = "Deploy";
  postDeployStageName = "PostDeploy";

  static getSourceOutputArtifact(envSettings: EnvironmentSettings) {
    return Artifact.artifact(`${envSettings.projectEnvName}-source`);
  }

  constructor(scope: Construct, id: string, props: CiPipelineProps) {
    super(scope, id);

    const pipeline = this.createPipeline(props);
    this.configureEnv(pipeline, props);
  }

  private configureEnv(pipeline: Pipeline, props: CiPipelineProps) {
    const sourceOutputArtifact = CiPipeline.getSourceOutputArtifact(
      props.envSettings
    );
    const buildStage = this.selectStage(this.buildStageName, pipeline);
    const deployStage = this.selectStage(this.deployStageName, pipeline);
    const postDeployStage = this.selectStage(
      this.postDeployStageName,
      pipeline
    );

    new ComponentsCiConfig(this, "ComponentsConfig", {
      buildStage,
      deployStage,
      envSettings: props.envSettings,
      inputArtifact: sourceOutputArtifact,
    });

    new BackendCiConfig(this, "BackendConfig", {
      buildStage,
      deployStage,
      envSettings: props.envSettings,
      inputArtifact: sourceOutputArtifact,
      backendRepository: props.backendRepository,
    });

    new WebappCiConfig(this, "WebAppConfig", {
      envSettings: props.envSettings,
      buildStage,
      deployStage,
      inputArtifact: sourceOutputArtifact,
      webappBaseRepository: props.webappBaseRepository,
    });

    new DocsCiConfig(this, "DocsConfig", {
      envSettings: props.envSettings,
      buildStage,
      deployStage,
      inputArtifact: sourceOutputArtifact
    });

    new ServerlessCiConfig(this, "WorkersConfig", {
      name: "workers",
      envSettings: props.envSettings,
      buildStage,
      deployStage,
      inputArtifact: sourceOutputArtifact,
      webappBaseRepository: props.webappBaseRepository,
    });

    new UploadVersionCiConfig(this, "UploadVersionConfig", {
      envSettings: props.envSettings,
      stage: deployStage,
      inputArtifact: sourceOutputArtifact,
    });

    new E2ETestsCiConfig(this, "E2ETestsConfig", {
      envSettings: props.envSettings,
      codeRepository: props.codeRepository,
      stage: postDeployStage,
      inputArtifact: sourceOutputArtifact,
      e2eBaseRepository: props.e2eBaseRepository,
    });
  }

  private selectStage(name: string, pipeline: Pipeline) {
    const stage = pipeline.stages.find((stage) => stage.stageName === name);

    if (!stage) {
      throw Error(`Stage ${name} hasn't been found!`);
    }

    return stage;
  }

  private createPipeline(props: CiPipelineProps) {
    return new Pipeline(this, "Pipeline", {
      pipelineName: `${props.envSettings.projectEnvName}-ci`,
      stages: [
        {
          stageName: "Source",
          actions: [
            new S3SourceAction({
              actionName: `${props.envSettings.projectEnvName}-source`,
              bucket: props.entrypointArtifactBucket,
              bucketKey: CiEntrypoint.getArtifactsName(props.envSettings),
              output: CiPipeline.getSourceOutputArtifact(props.envSettings),
              trigger: S3Trigger.POLL,
            }),
          ],
        },
        {
          stageName: this.buildStageName,
          actions: [],
        },
        {
          stageName: this.deployStageName,
          actions: [],
        },
        {
          stageName: this.postDeployStageName,
          actions: [],
        },
      ],
    });
  }
}
