import {Construct} from "@aws-cdk/core";
import {BuildEnvironmentVariableType, BuildSpec, Cache, LocalCacheMode, Project} from "@aws-cdk/aws-codebuild";
import {CodeBuildAction} from "@aws-cdk/aws-codepipeline-actions";
import {Artifact, IStage} from "@aws-cdk/aws-codepipeline";

import {EnvConstructProps} from "../types";

export interface BackendCiProps extends EnvConstructProps {
    inputArtifact: Artifact;
    stage: IStage;
}

export class BackendCiBuild extends Construct {
    constructor(scope: Construct, id: string, props: BackendCiProps) {
        super(scope, id);

        const project = new Project(this, "BackendBuildProject", {
            projectName: `${props.envSettings.projectName}-build-backend`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {
                        commands: [
                            'make build-backend',
                        ],
                    },
                },
            }),
            environment: {
                privileged: true,
            },
            environmentVariables: {
                CI: {type: BuildEnvironmentVariableType.PLAINTEXT, value: 'true'},
                PROJECT_NAME: {type: BuildEnvironmentVariableType.PLAINTEXT, value: props.envSettings.projectName},
            },
            cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
        });

        props.stage.addAction(new CodeBuildAction({
            actionName: `${props.envSettings.projectName}-build-backend`,
            input: props.inputArtifact,
            project: project,
        }));
    }
}
