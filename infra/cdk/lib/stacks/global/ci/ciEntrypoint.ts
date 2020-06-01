import {Construct} from "@aws-cdk/core";
import {Bucket} from "@aws-cdk/aws-s3";
import {IRepository} from "@aws-cdk/aws-codecommit";
import {Artifacts, BuildSpec, Cache, LocalCacheMode, Project, Source} from "@aws-cdk/aws-codebuild";
import * as targets from "@aws-cdk/aws-events-targets";

import {EnvConstructProps} from "../../../types";
import {EnvironmentSettings} from "../../../settings";


export interface CiEntrypointProps extends EnvConstructProps {
    codeRepository: IRepository;
}

export class CiEntrypoint extends Construct {
    public artifactsBucket: Bucket;
    private codeBuildProject: Project;

    static getArtifactsIdentifier(envSettings: EnvironmentSettings) {
        return `${envSettings.projectName}-entrypoint`;
    }

    static getArtifactsName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectName}-entrypoint`;
    }

    constructor(scope: Construct, id: string, props: CiEntrypointProps) {
        super(scope, id);

        this.artifactsBucket = new Bucket(this, "ArtifactsBucket", {
            versioned: true,
        });
        this.codeBuildProject = this.createBuildProject(this.artifactsBucket, props);

        props.codeRepository.onCommit('OnMasterCommit', {
            branches: ['master'],
            target: new targets.CodeBuildProject(this.codeBuildProject),
        });
    }

    private createBuildProject(artifactsBucket: Bucket, props: CiEntrypointProps) {
        return new Project(this, "Project", {
            projectName: `${props.envSettings.projectName}`,
            buildSpec: this.createBuildSpec(),
            cache: Cache.local(LocalCacheMode.SOURCE),
            source: Source.codeCommit({repository: props.codeRepository}),
            artifacts: Artifacts.s3({
                identifier: CiEntrypoint.getArtifactsIdentifier(props.envSettings),
                bucket: artifactsBucket,
                name: CiEntrypoint.getArtifactsName(props.envSettings),
                includeBuildId: false,
                path: '',
            }),
        });
    }

    private createBuildSpec() {
        return BuildSpec.fromObject({
            version: '0.2',
            phases: {
                build: {
                    commands: [
                        'echo Build!',
                        'make version > VERSION',
                    ],
                },
            },
            artifacts: {
                files: ['**/*'],
            },
        });
    }
}
