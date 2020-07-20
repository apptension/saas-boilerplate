import {Construct, Stack} from "@aws-cdk/core";
import {BuildSpec, Cache, LocalCacheMode, Project} from "@aws-cdk/aws-codebuild";
import {CodeBuildAction, CodeBuildActionProps} from "@aws-cdk/aws-codepipeline-actions";
import {Artifact, IStage} from "@aws-cdk/aws-codepipeline";
import {Effect, PolicyStatement} from "@aws-cdk/aws-iam";

import {EnvConstructProps} from "../../../types";
import {ServiceCiConfig} from "../../../patterns/serviceCiConfig";

interface WebAppCiConfigProps extends EnvConstructProps {
    inputArtifact: Artifact;
    buildStage: IStage;
    deployStage: IStage;
}

export class WebappCiConfig extends ServiceCiConfig {
    constructor(scope: Construct, id: string, props: WebAppCiConfigProps) {
        super(scope, id, {envSettings: props.envSettings});

        const buildArtifact = Artifact.artifact(`${props.envSettings.projectEnvName}-webapp`);

        const buildProject = this.createBuildProject(props);
        props.buildStage.addAction(this.createBuildAction({
            project: buildProject,
            input: props.inputArtifact,
            outputs: [buildArtifact],
        }, props));

        const deployProject = this.createDeployProject(props);
        props.deployStage.addAction(this.createDeployAction({
            project: deployProject,
            input: buildArtifact,
            runOrder: 2,
        }, props));
    }

    private createBuildAction(actionProps: Partial<CodeBuildActionProps>, props: WebAppCiConfigProps) {
        return new CodeBuildAction(<CodeBuildActionProps>{
            ...actionProps,
            actionName: `${props.envSettings.projectEnvName}-build-webapp`,
        });
    }

    private createBuildProject(props: WebAppCiConfigProps) {
        return new Project(this, "WebAppBuildProject", {
            projectName: `${props.envSettings.projectEnvName}-build-webapp`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    pre_build: {commands: ['make -C services/webapp install']},
                    build: {commands: ['make -C services/webapp build']},
                },
                artifacts: {
                    files: [
                        '*',
                        'infra/**/*',
                        'scripts/**/*',
                        'services/webapp/*',
                        'services/webapp/build/**/*',
                    ],
                }
            }),
            environment: {
                privileged: true,
            },
            environmentVariables: {...this.defaultEnvVariables},
            cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
        });
    }

    private createDeployAction(actionProps: Partial<CodeBuildActionProps>, props: WebAppCiConfigProps) {
        return new CodeBuildAction(<CodeBuildActionProps>{
            ...actionProps,
            actionName: `${props.envSettings.projectEnvName}-deploy-webapp`,
        });
    }

    private createDeployProject(props: WebAppCiConfigProps) {
        const stack = Stack.of(this);
        const project = new Project(this, "WebAppDeployProject", {
            projectName: `${props.envSettings.projectEnvName}-deploy-webapp`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    pre_build: {commands: ['make -C services/webapp install-deploy']},
                    build: {commands: ['make -C services/webapp deploy']},
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
            actions: [
                'cloudformation:*',
            ],
            resources: [
                `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
                `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-WebAppStack/*`,
            ],
        }));

        project.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'iam:*',
                'cloudfront:*',
                's3:*',
                'ecs:*',
                'lambda:*',
                'route53:*'
            ],
            resources: ['*'],
        }));

        return project;
    }
}
