import {Construct} from "@aws-cdk/core";
import {Artifact, Pipeline} from "@aws-cdk/aws-codepipeline";
import {S3SourceAction, S3Trigger} from "@aws-cdk/aws-codepipeline-actions";
import {Bucket} from "@aws-cdk/aws-s3";

import {EnvConstructProps} from "../../../types";
import {EnvironmentSettings} from "../../../settings";
import {CiEntrypoint} from "./ciEntrypoint";
import {BackendCiBuild} from "../../../ci/backendCi";
import {GlobalResources} from "../resources";


export interface CiPipelineProps extends EnvConstructProps {
    entrypointArtifactBucket: Bucket;
    resources: GlobalResources;
}

export class CiPipeline extends Construct {
    buildStageName = 'Build';

    static getSourceOutputArtifact(envSettings: EnvironmentSettings) {
        return Artifact.artifact(`${envSettings.projectName}-source`)
    }

    constructor(scope: Construct, id: string, props: CiPipelineProps) {
        super(scope, id);

        const sourceOutputArtifact = CiPipeline.getSourceOutputArtifact(props.envSettings);

        const pipeline = this.createPipeline(props, sourceOutputArtifact);
        const buildStage = this.selectBuildStage(pipeline, this.buildStageName);

        new BackendCiBuild(this, 'Backend', {
            envSettings: props.envSettings,
            inputArtifact: sourceOutputArtifact,
            stage: buildStage,
            backendRepository: props.resources.ecr.backendRepository,
            nginxRepository: props.resources.ecr.nginxRepository,
        });
    }

    private selectBuildStage(pipeline: Pipeline, buildStageName: string) {
        const buildStage = pipeline.stages.find(stage => stage.stageName === buildStageName);

        if (!buildStage) {
            throw Error('Build stage has to be defined!');
        }

        return buildStage;
    }

    private createPipeline(props: CiPipelineProps, sourceOutputArtifact: Artifact) {
        return new Pipeline(this, "Pipeline", {
            pipelineName: `${props.envSettings.projectName}-ci`,
            stages: [{
                stageName: "Source",
                actions: [
                    new S3SourceAction({
                        actionName: `${props.envSettings.projectName}-source`,
                        bucket: props.entrypointArtifactBucket,
                        bucketKey: CiEntrypoint.getArtifactsName(props.envSettings),
                        output: sourceOutputArtifact,
                        trigger: S3Trigger.EVENTS,
                    }),
                ],
            }, {
                stageName: this.buildStageName,
                actions: [],
            }],
        });
    }
}
