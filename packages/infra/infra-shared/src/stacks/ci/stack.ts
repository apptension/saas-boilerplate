import { App, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import { EnvConstructProps } from '@sb/infra-core';

import { GlobalECR } from '../global/resources/globalECR';
import { GlobalCodeCommit } from '../global/resources/globalCodeCommit';
import { CiPipeline, CiPipelineProps } from './ciPipeline';
import { CiEntrypoint } from './ciEntrypoint';
import { IPipeline, Pipeline } from 'aws-cdk-lib/aws-codepipeline';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface EnvCiStackProps extends StackProps, EnvConstructProps {}

export class EnvCiStack extends Stack {
  constructor(scope: App, id: string, props: EnvCiStackProps) {
    super(scope, id, props);

    const backendRepository = this.retrieveBackendECRRepository(props);
    const codeRepository = this.retrieveCodeRepository(props);

    const entrypoint = new CiEntrypoint(this, 'Entrypoint', {
      envSettings: props.envSettings,
      codeRepository,
    });

    new CiPipeline(this, 'PipelineConfig', {
      envSettings: props.envSettings,
      codeRepository,
      backendRepository,
      entrypointArtifactBucket: entrypoint.artifactsBucket,
    });
  }

  private retrieveCodeRepository(props: EnvCiStackProps) {
    return codecommit.Repository.fromRepositoryName(
      this,
      'CodeRepository',
      GlobalCodeCommit.getCodeRepositoryName(props.envSettings)
    );
  }

  private retrieveBackendECRRepository(props: EnvCiStackProps) {
    return ecr.Repository.fromRepositoryName(
      this,
      'ECRBackendRepository',
      GlobalECR.getBackendRepositoryName(props.envSettings)
    );
  }

  private createEventBridgePipelineExecutionRule(
    pipeline: Pipeline,
    props: CiPipelineProps
  ) {
    const role = this.createEventBridgePipelineExecutionRole(pipeline);
    const target = new targets.CodePipeline(pipeline, { eventRole: role });

    new events.Rule(this, 'EbPipelineExecutionRule', {
      eventPattern: {
        source: ['aws.s3'],
        detailType: ['AWS API Call via CloudTrail'],
        detail: {
          eventSource: ['s3.amazonaws.com'],
          eventName: ['CopyObject', 'PutObject', 'CompleteMultipartUpload'],
          requestParameters: {
            bucketName: [props.entrypointArtifactBucket],
            key: [CiEntrypoint.getArtifactsName(props.envSettings)],
          },
        },
      },
      targets: [target],
    });
  }

  private createEventBridgePipelineExecutionRole(pipeline: IPipeline) {
    const role = new iam.Role(this, 'EbPipelineExecutionRole', {
      assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
    });

    role.addToPrincipalPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['sts:AssumeRole'],
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['codepipeline:StartPipelineExecution'],
        resources: [pipeline.pipelineArn],
      })
    );

    return role;
  }
}
