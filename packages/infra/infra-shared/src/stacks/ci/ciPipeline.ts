import { Construct } from 'constructs';
import { Artifact, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import {
  S3SourceAction,
  S3Trigger,
} from 'aws-cdk-lib/aws-codepipeline-actions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { aws_codecommit as cc, aws_ecr as ecr } from 'aws-cdk-lib';
import { EnvConstructProps, EnvironmentSettings } from '@sb/infra-core';

import { CiEntrypoint } from './ciEntrypoint';
import { BackendCiConfig } from './ciBackend';
import { WebappCiConfig } from './ciWebApp';
import { ServerlessCiConfig } from './ciServerless';
import { UploadVersionCiConfig } from './ciUploadVersion';
import { ComponentsCiConfig } from './ciComponents';
import { DocsCiConfig } from './ciDocs';

export interface CiPipelineProps extends EnvConstructProps {
  entrypointArtifactBucket: Bucket;
  backendRepository: ecr.IRepository;
}

export class CiPipeline extends Construct {
  buildStageName = 'Build';
  deployStageName = 'Deploy';

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
      props.envSettings,
    );
    const buildStage = this.selectStage(this.buildStageName, pipeline);
    const deployStage = this.selectStage(this.deployStageName, pipeline);

    new ComponentsCiConfig(this, 'ComponentsConfig', {
      buildStage,
      deployStage,
      envSettings: props.envSettings,
      inputArtifact: sourceOutputArtifact,
    });

    new BackendCiConfig(this, 'BackendConfig', {
      buildStage,
      deployStage,
      envSettings: props.envSettings,
      inputArtifact: sourceOutputArtifact,
      backendRepository: props.backendRepository,
    });

    new WebappCiConfig(this, 'WebAppConfig', {
      envSettings: props.envSettings,
      buildStage,
      deployStage,
      inputArtifact: sourceOutputArtifact,
    });

    new ServerlessCiConfig(this, 'WorkersConfig', {
      envSettings: props.envSettings,
      buildStage,
      deployStage,
      inputArtifact: sourceOutputArtifact,
    });

    new DocsCiConfig(this, 'DocsConfig', {
      envSettings: props.envSettings,
      buildStage,
      deployStage,
      inputArtifact: sourceOutputArtifact,
    });

    if (props.envSettings.tools.enabled) {
      new UploadVersionCiConfig(this, 'UploadVersionConfig', {
        envSettings: props.envSettings,
        stage: deployStage,
        inputArtifact: sourceOutputArtifact,
      });
    }
  }

  private selectStage(name: string, pipeline: Pipeline) {
    const stage = pipeline.stages.find((stage) => stage.stageName === name);

    if (!stage) {
      throw Error(`Stage ${name} hasn't been found!`);
    }

    return stage;
  }

  private createPipeline(props: CiPipelineProps) {
    return new Pipeline(this, 'Pipeline', {
      pipelineName: `${props.envSettings.projectEnvName}-ci`,
      stages: [
        {
          stageName: 'Source',
          actions: [
            new S3SourceAction({
              actionName: `${props.envSettings.projectEnvName}-source`,
              bucket: props.entrypointArtifactBucket,
              bucketKey: CiEntrypoint.getArtifactsName(props.envSettings),
              output: CiPipeline.getSourceOutputArtifact(props.envSettings),
              trigger: S3Trigger.EVENTS,
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
      ],
    });
  }
}
