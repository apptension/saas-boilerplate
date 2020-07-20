import {Construct} from "@aws-cdk/core";
import {Artifact, Pipeline} from "@aws-cdk/aws-codepipeline";
import {S3SourceAction, S3Trigger} from "@aws-cdk/aws-codepipeline-actions";
import {Bucket} from "@aws-cdk/aws-s3";
import * as ecr from "@aws-cdk/aws-ecr";

import {EnvConstructProps} from "../../../types";
import {EnvironmentSettings} from "../../../settings";
import {CiEntrypoint} from "./ciEntrypoint";
import {BackendCiConfig} from "./ciBackend";
import {WebappCiConfig} from "./ciWebApp";
import {ServerlessCiConfig} from "./ciServerless";
import {UploadVersionCiConfig} from "./ciUploadVersion";
import {ComponentsCiConfig} from "./ciComponents";


export interface CiPipelineProps extends EnvConstructProps {
    entrypointArtifactBucket: Bucket;
    backendRepository: ecr.IRepository;
}

export class CiPipeline extends Construct {
    buildStageName = 'Build';
    deployStageName = 'Deploy';

    static getSourceOutputArtifact(envSettings: EnvironmentSettings) {
        return Artifact.artifact(`${envSettings.projectEnvName}-source`)
    }

    constructor(scope: Construct, id: string, props: CiPipelineProps) {
        super(scope, id);

        const pipeline = this.createPipeline(props);
        this.configureEnv(pipeline, props);
    }

    private configureEnv(pipeline: Pipeline, props: CiPipelineProps) {
        const sourceOutputArtifact = CiPipeline.getSourceOutputArtifact(props.envSettings);
        const buildStage = this.selectStage(this.buildStageName, pipeline);
        const deployStage = this.selectStage(this.deployStageName, pipeline);

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
        });

        new ServerlessCiConfig(this, "WorkersConfig", {
            name: 'workers',
            envSettings: props.envSettings,
            buildStage,
            deployStage,
            inputArtifact: sourceOutputArtifact,
        });

        new UploadVersionCiConfig(this, "UploadVersionConfig", {
            envSettings: props.envSettings,
            buildStage,
            deployStage,
            inputArtifact: sourceOutputArtifact,
        });
    }

    private selectStage(name: string, pipeline: Pipeline) {
        const stage = pipeline.stages.find(stage => stage.stageName === name);

        if (!stage) {
            throw Error(`Stage ${name} hasn't been found!`);
        }

        return stage;
    }

    private createPipeline(props: CiPipelineProps) {
        return new Pipeline(this, "Pipeline", {
            pipelineName: `${props.envSettings.projectEnvName}-ci`,
            stages: [{
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
            }, {
                stageName: this.buildStageName,
                actions: [],
            }, {
                stageName: this.deployStageName,
                actions: [],
            }],
        });
    }
}
