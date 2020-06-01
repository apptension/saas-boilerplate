import {Construct} from "@aws-cdk/core";
import {Artifact, Pipeline} from "@aws-cdk/aws-codepipeline";
import {CodeBuildAction, S3SourceAction, S3Trigger} from "@aws-cdk/aws-codepipeline-actions";
import {Bucket} from "@aws-cdk/aws-s3";
import {BuildSpec, Project} from "@aws-cdk/aws-codebuild";

import {EnvConstructProps} from "../../../types";
import {EnvironmentSettings} from "../../../settings";
import {CiEntrypoint} from "./ciEntrypoint";


export interface CiPipelineProps extends EnvConstructProps {
    entrypointArtifactBucket: Bucket;
}

export class CiPipeline extends Construct {
    static getSourceOutputArtifact(envSettings: EnvironmentSettings) {
        return Artifact.artifact(`${envSettings.projectName}-source`)
    }

    constructor(scope: Construct, id: string, props: CiPipelineProps) {
        super(scope, id);

        const sourceOutputArtifact = CiPipeline.getSourceOutputArtifact(props.envSettings);

        const pipeline = new Pipeline(this, "Pipeline", {
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
                stageName: 'Build',
                actions: [
                    new CodeBuildAction({
                        actionName: 'Dummy',
                        input: sourceOutputArtifact,
                        project: new Project(this, "DummyProject", {
                            projectName: `${props.envSettings.projectName}-dummy`,
                            buildSpec: BuildSpec.fromObject({
                                version: '0.2',
                                phases: {
                                    build: {
                                        commands: [
                                            'echo Dummy'
                                        ]
                                    }
                                }
                            })
                        })
                    })
                ],
            }],
        });
    }
}
