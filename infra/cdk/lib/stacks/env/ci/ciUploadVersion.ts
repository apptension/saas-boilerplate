import {Construct} from "@aws-cdk/core";
import {BuildSpec, Cache, LocalCacheMode, Project} from "@aws-cdk/aws-codebuild";
import {CodeBuildAction, CodeBuildActionProps} from "@aws-cdk/aws-codepipeline-actions";
import {Artifact, IStage} from "@aws-cdk/aws-codepipeline";
import {Effect, PolicyStatement} from "@aws-cdk/aws-iam";

import {EnvConstructProps} from "../../../types";
import {ServiceCiConfig} from "../../../patterns/serviceCiConfig";

interface UploadVersionCiConfigProps extends EnvConstructProps {
    inputArtifact: Artifact;
    buildStage: IStage;
    deployStage: IStage;
}

export class UploadVersionCiConfig extends ServiceCiConfig {
    constructor(scope: Construct, id: string, props: UploadVersionCiConfigProps) {
        super(scope, id, {envSettings: props.envSettings});

        const deployProject = this.createDeployProject(props);
        props.deployStage.addAction(this.createDeployAction({
            project: deployProject,
            input: props.inputArtifact,
            runOrder: 3,
        }, props));
    }

    private createDeployAction(actionProps: Partial<CodeBuildActionProps>, props: UploadVersionCiConfigProps) {
        return new CodeBuildAction(<CodeBuildActionProps>{
            ...actionProps,
            actionName: `${props.envSettings.projectEnvName}-upload-version`,
        });
    }

    private createDeployProject(props: UploadVersionCiConfigProps) {
        const project = new Project(this, "UploadVersionDeployProject", {
            projectName: `${props.envSettings.projectEnvName}-upload-version`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    pre_build: {commands: ['make install-scripts']},
                    build: {commands: ['make upload-version']},
                },
                cache: {
                    paths: [...this.defaultCachePaths],
                },
            }),
            environmentVariables: {...this.defaultEnvVariables},
            cache: Cache.local(LocalCacheMode.CUSTOM),
        });

        project.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['s3:*'],
            resources: ['*'],
        }));

        return project;
    }
}
