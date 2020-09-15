import {Construct, Stack} from "@aws-cdk/core";
import {BuildSpec, Cache, LinuxBuildImage, LocalCacheMode, Project} from "@aws-cdk/aws-codebuild";
import {CodeBuildAction, CodeBuildActionProps} from "@aws-cdk/aws-codepipeline-actions";
import {Artifact, IStage} from "@aws-cdk/aws-codepipeline";
import {Effect, PolicyStatement} from "@aws-cdk/aws-iam";

import {EnvConstructProps} from "../../../types";
import {ServiceCiConfig} from "../../../patterns/serviceCiConfig";

interface ServerlessCiConfigProps extends EnvConstructProps {
    name: string;
    inputArtifact: Artifact;
    buildStage: IStage;
    deployStage: IStage;
}

export class ServerlessCiConfig extends ServiceCiConfig {
    constructor(scope: Construct, id: string, props: ServerlessCiConfigProps) {
        super(scope, id, {envSettings: props.envSettings});

        const buildArtifact = Artifact.artifact(`${props.envSettings.projectEnvName}-${props.name}`);

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

    private createBuildAction(actionProps: Partial<CodeBuildActionProps>, props: ServerlessCiConfigProps) {
        return new CodeBuildAction(<CodeBuildActionProps>{
            ...actionProps,
            actionName: `${props.envSettings.projectEnvName}-build-${props.name}`,
        });
    }

    private createBuildProject(props: ServerlessCiConfigProps) {
        return new Project(this, "BuildProject", {
            projectName: `${props.envSettings.projectEnvName}-build-${props.name}`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {"runtime-versions": {"python": "3.8"}},
                    pre_build: {commands: [`make -C services/${props.name} install-build`]},
                    build: {commands: [`make -C services/${props.name} build`]},
                },
                artifacts: {
                    files: [
                        '*',
                        'infra/**/*',
                        'scripts/**/*',
                        `services/${props.name}/**/*`,
                    ],
                },
            }),
            environment: {
                privileged: true,
                buildImage: LinuxBuildImage.AMAZON_LINUX_2_3,
            },
            environmentVariables: {...this.defaultEnvVariables},
            cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.DOCKER_LAYER),
        });
    }

    private createDeployAction(actionProps: Partial<CodeBuildActionProps>, props: ServerlessCiConfigProps) {
        return new CodeBuildAction(<CodeBuildActionProps>{
            ...actionProps,
            actionName: `${props.envSettings.projectEnvName}-deploy-${props.name}`,
        });
    }

    private createDeployProject(props: ServerlessCiConfigProps) {
        const stack = Stack.of(this);
        const project = new Project(this, "DeployProject", {
            projectName: `${props.envSettings.projectEnvName}-deploy-${props.name}`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {"runtime-versions": {"python": "3.8"}},
                    pre_build: {commands: [`make -C services/${props.name} install-deploy`]},
                    build: {commands: [`make -C services/${props.name} deploy`]}
                },
                cache: {
                    paths: [
                        ...this.defaultCachePaths,
                        `services/${props.name}/node_modules/**/*`,
                    ],
                },
            }),
            environment: {
                privileged: true,
                buildImage: LinuxBuildImage.AMAZON_LINUX_2_3,
            },
            environmentVariables: {...this.defaultEnvVariables},
            cache: Cache.local(LocalCacheMode.CUSTOM, LocalCacheMode.DOCKER_LAYER),
        });

        project.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'cloudformation:*',
            ],
            resources: [
                `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
                `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-${props.name}/*`,
            ],
        }));

        project.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'iam:*',
                'cloudfront:*',
                's3:*',
                'lambda:*',
                'apigateway:*',
                'logs:*',
                'ec2:DescribeSecurityGroups',
                'ec2:DescribeSubnets',
                'ec2:DescribeVpcs',
                'ec2:DescribeNetworkInterfaces',
                'cloudformation:ValidateTemplate',
            ],
            resources: ['*'],
        }));

        return project;
    }
}
