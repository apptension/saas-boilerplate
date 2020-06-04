import {Construct} from "@aws-cdk/core";
import {BuildSpec, Cache, LocalCacheMode, Project} from "@aws-cdk/aws-codebuild";
import {CodeBuildAction} from "@aws-cdk/aws-codepipeline-actions";
import {Artifact, IStage} from "@aws-cdk/aws-codepipeline";
import {IRepository} from "@aws-cdk/aws-ecr";

import {EnvConstructProps} from "../../../types";
import {ServiceCiConfig} from "../../../patterns/serviceCiConfig";


interface BackendCiConfigProps extends EnvConstructProps {
    inputArtifact: Artifact;
    buildStage: IStage;
    deployStage: IStage;
    backendRepository: IRepository;
    nginxRepository: IRepository;
}

export class BackendCiConfig extends ServiceCiConfig {
    constructor(scope: Construct, id: string, props: BackendCiConfigProps) {
        super(scope, id, {envSettings: props.envSettings});

        const project = this.createBuildProject(props);
        props.buildStage.addAction(this.createBuildAction('backend', project, props));

        const apiDeployProject = this.createApiDeployProject(props);
        props.deployStage.addAction(this.createDeployAction('api', apiDeployProject, props));

        const adminPanelDeployProject = this.createAdminPanelDeployProject(props);
        props.deployStage.addAction(this.createDeployAction('admin', adminPanelDeployProject, props));
    }

    private createBuildAction(name: string, project: Project, props: BackendCiConfigProps) {
        return new CodeBuildAction({
            actionName: `${props.envSettings.projectName}-build-${name}`,
            input: props.inputArtifact,
            project: project,
        });
    }

    private createBuildProject(props: BackendCiConfigProps) {
        const project = new Project(this, "BackendBuildProject", {
            projectName: `${props.envSettings.projectName}-build-backend`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {commands: ['make build-backend']},
                },
            }),
            environment: {
                privileged: true,
            },
            environmentVariables: {
                ...this.defaultEnvVariables,
            },
            cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
        });

        props.backendRepository.grantPullPush(project);
        props.nginxRepository.grantPullPush(project);

        return project;
    }

    private createDeployAction(name: string, project: Project, props: BackendCiConfigProps) {
        return new CodeBuildAction({
            actionName: `${props.envSettings.projectName}-deploy-${name}`,
            input: props.inputArtifact,
            project: project,
        });
    }

    private createApiDeployProject(props: BackendCiConfigProps) {
        const project = new Project(this, "ApiDeployProject", {
            projectName: `${props.envSettings.projectName}-deploy-api`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {commands: ['make deploy-api']},
                },
            }),
            environmentVariables: {...this.defaultEnvVariables},
        });

        props.backendRepository.grantPullPush(project);
        props.nginxRepository.grantPullPush(project);

        return project;
    }

    private createAdminPanelDeployProject(props: BackendCiConfigProps) {
        const project = new Project(this, "AdminPanelDeployProject", {
            projectName: `${props.envSettings.projectName}-deploy-admin-panel`,
            buildSpec: BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    build: {commands: ['make deploy-admin-panel']},
                },
            }),
            environmentVariables: {...this.defaultEnvVariables},
        });

        props.backendRepository.grantPullPush(project);
        props.nginxRepository.grantPullPush(project);

        return project;
    }
}
