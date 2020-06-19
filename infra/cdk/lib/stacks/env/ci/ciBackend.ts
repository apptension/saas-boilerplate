import {Construct, Stack} from "@aws-cdk/core";
import {BuildSpec, Cache, LocalCacheMode, Project} from "@aws-cdk/aws-codebuild";
import {CodeBuildAction, CodeBuildActionProps} from "@aws-cdk/aws-codepipeline-actions";
import {Artifact, IStage} from "@aws-cdk/aws-codepipeline";
import {IRepository} from "@aws-cdk/aws-ecr";
import {Effect, PolicyStatement} from "@aws-cdk/aws-iam";

import {EnvConstructProps} from "../../../types";
import {ServiceCiConfig} from "../../../patterns/serviceCiConfig";

interface BackendCiConfigProps extends EnvConstructProps {
    inputArtifact: Artifact;
    buildStage: IStage;
    deployStage: IStage;
    backendRepository: IRepository;
}

export class BackendCiConfig extends ServiceCiConfig {
    constructor(scope: Construct, id: string, props: BackendCiConfigProps) {
        super(scope, id, {envSettings: props.envSettings});

        const buildProject = this.createBuildProject(props);
        props.buildStage.addAction(this.createBuildAction('backend', {
            project: buildProject,
        }, props));

        const apiDeployProject = this.createApiDeployProject(props);
        props.deployStage.addAction(this.createDeployAction('api', {
            project: apiDeployProject,
        }, props));

        const adminPanelDeployProject = this.createAdminPanelDeployProject(props);
        props.deployStage.addAction(this.createDeployAction('admin', {
            project: adminPanelDeployProject,
        }, props));

        const migrationsDeployProject = this.createMigrationsDeployProject(props);
        props.deployStage.addAction(this.createDeployAction('migrations', {
            project: migrationsDeployProject,
        }, props));
    }

    private createBuildAction(name: string, actionProps: Partial<CodeBuildActionProps>, props: BackendCiConfigProps) {
        return new CodeBuildAction(<CodeBuildActionProps>{
            actionName: `${props.envSettings.projectEnvName}-build-${name}`,
            project: actionProps.project,
            input: props.inputArtifact,
        });
    }

    private createBuildProject(props: BackendCiConfigProps) {
        const project = new Project(this, "BackendBuildProject", {
            projectName: `${props.envSettings.projectEnvName}-build-backend`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {commands: ['make build-backend']},
                },
            }),
            environment: {
                privileged: true,
            },
            environmentVariables: {...this.defaultEnvVariables},
            cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
        });

        props.backendRepository.grantPullPush(project);

        return project;
    }

    private createDeployAction(name: string, actionProps: Partial<CodeBuildActionProps>, props: BackendCiConfigProps) {
        return new CodeBuildAction(<CodeBuildActionProps>{
            ...actionProps,
            project: actionProps.project,
            actionName: `${props.envSettings.projectEnvName}-deploy-${name}`,
            input: props.inputArtifact,
        });
    }

    private createApiDeployProject(props: BackendCiConfigProps) {
        const stack = Stack.of(this);
        const project = new Project(this, "ApiDeployProject", {
            projectName: `${props.envSettings.projectEnvName}-deploy-api`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    pre_build: {commands: ['make install-infra-cdk']},
                    build: {commands: ['make deploy-api']},
                },
                cache: {
                    paths: ['infra/cdk/node_modules/**/*'],
                },
            }),
            environmentVariables: {...this.defaultEnvVariables},
            cache: Cache.local(LocalCacheMode.CUSTOM),
        });

        project.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'cloudformation:*',
                'route53:*'
            ],
            resources: [
                `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
                `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-ApiStack/*`,
                `arn:aws:route53:::hostedzone/${props.envSettings.hostedZone.id}`,
            ],
        }));

        project.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'iam:*',
                'ec2:*',
                'ecs:*',
            ],
            resources: ['*'],
        }));

        return project;
    }

    private createAdminPanelDeployProject(props: BackendCiConfigProps) {
        const stack = Stack.of(this);
        const project = new Project(this, "AdminPanelDeployProject", {
            projectName: `${props.envSettings.projectEnvName}-deploy-admin-panel`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    pre_build: {commands: ['make install-infra-cdk']},
                    build: {commands: ['make deploy-admin-panel']},
                },
                cache: {
                    paths: ['infra/cdk/node_modules/**/*'],
                },
            }),
            environmentVariables: {...this.defaultEnvVariables},
            cache: Cache.local(LocalCacheMode.CUSTOM),
        });

        project.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'cloudformation:*',
                'route53:*'
            ],
            resources: [
                `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
                `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-AdminPanelStack/*`,
                `arn:aws:route53:::hostedzone/${props.envSettings.hostedZone.id}`,
            ],
        }));

        project.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'iam:*',
                'ec2:*',
                'ecs:*',
            ],
            resources: ['*'],
        }));

        return project;
    }

    private createMigrationsDeployProject(props: BackendCiConfigProps) {
        const stack = Stack.of(this);
        const project = new Project(this, "MigrationsDeployProject", {
            projectName: `${props.envSettings.projectEnvName}-deploy-migrations`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    pre_build: {commands: ['make install-infra-cdk', 'make install-infra-functions']},
                    build: {commands: ['make deploy-migrations']},
                },
                cache: {
                    paths: ['infra/cdk/node_modules/**/*'],
                },
            }),
            environmentVariables: {...this.defaultEnvVariables},
            cache: Cache.local(LocalCacheMode.CUSTOM),
        });

        project.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'cloudformation:*',
                'route53:*',
            ],
            resources: [
                `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
                `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-MigrationsStack/*`,
                `arn:aws:route53:::hostedzone/${props.envSettings.hostedZone.id}`,
            ],
        }));

        project.addToRolePolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                'iam:*',
                'ec2:*',
                'ecs:*',
                'states:*',
                'lambda:*',
            ],
            resources: ['*'],
        }));

        return project;
    }
}
