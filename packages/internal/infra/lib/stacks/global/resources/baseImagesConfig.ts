import {Construct} from "constructs";
import {IRepository} from "aws-cdk-lib/aws-codecommit";
import {Repository as ECRRepository} from "aws-cdk-lib/aws-ecr";
import {BuildSpec, Cache, LinuxBuildImage, LocalCacheMode, Project, Source} from "aws-cdk-lib/aws-codebuild";
import {aws_events_targets as targets} from "aws-cdk-lib";
import {AnyPrincipal, User} from "aws-cdk-lib/aws-iam";

import {EnvConstructProps} from "../../../types";
import {EnvironmentSettings} from "../../../settings";


export interface BaseImagesConfigProps extends EnvConstructProps {
  codeRepository: IRepository;
  externalCiUser: User;
}

export class BaseImagesConfig extends Construct {
  private readonly codeBuildProject: Project;
  backendBaseRepository: ECRRepository;
  webappBaseRepository: ECRRepository;
  e2eBaseRepository: ECRRepository;
  workersBaseRepository: ECRRepository;

  static getBackendBaseRepositoryName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectName}-backend-base`;
  }

  static getWebappBaseRepositoryName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectName}-webapp-base`;
  }

  static getE2EBaseRepositoryName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectName}-e2e-base`;
  }

  static getWorkersBaseRepositoryName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectName}-workers-base`;
  }

  constructor(scope: Construct, id: string, props: BaseImagesConfigProps) {
    super(scope, id);

    this.codeBuildProject = this.createBuildProject(props);

    this.backendBaseRepository = new ECRRepository(
      this,
      "ECRBackendBaseRepository",
      {
        repositoryName: BaseImagesConfig.getBackendBaseRepositoryName(
          props.envSettings
        ),
      }
    );

    this.webappBaseRepository = new ECRRepository(
      this,
      "ECRWebappBaseRepository",
      {
        repositoryName: BaseImagesConfig.getWebappBaseRepositoryName(
          props.envSettings
        ),
      }
    );

    this.e2eBaseRepository = new ECRRepository(
      this,
      "ECRE2EBaseRepository", 
      {
        repositoryName: BaseImagesConfig.getE2EBaseRepositoryName(
        props.envSettings
        ),
      }
    );

    this.workersBaseRepository = new ECRRepository(
      this,
      "ECRWorkersBaseRepository",
      {
        repositoryName: BaseImagesConfig.getWorkersBaseRepositoryName(
          props.envSettings
        ),
      }
    );

    this.backendBaseRepository.grantPullPush(this.codeBuildProject);
    this.webappBaseRepository.grantPullPush(this.codeBuildProject);
    this.e2eBaseRepository.grantPullPush(this.codeBuildProject);
    this.workersBaseRepository.grantPullPush(this.codeBuildProject);

    this.backendBaseRepository.grantPull(new AnyPrincipal());
    this.webappBaseRepository.grantPull(new AnyPrincipal());
    this.e2eBaseRepository.grantPull(new AnyPrincipal());
    this.workersBaseRepository.grantPull(new AnyPrincipal());

    this.backendBaseRepository.grantPull(props.externalCiUser);
    this.webappBaseRepository.grantPull(props.externalCiUser);
    this.workersBaseRepository.grantPull(props.externalCiUser);

    props.codeRepository.onCommit("OnDeployCommit", {
      branches: ["master"],
      target: new targets.CodeBuildProject(this.codeBuildProject),
    });
  }

  private createBuildProject(props: BaseImagesConfigProps) {
    return new Project(this, "Project", {
      projectName: `${props.envSettings.projectName}-base-images`,
      buildSpec: this.createBuildSpec(),
      cache: Cache.local(LocalCacheMode.SOURCE, LocalCacheMode.DOCKER_LAYER),
      source: Source.codeCommit({ repository: props.codeRepository }),
      environment: {
        privileged: true,
        buildImage: LinuxBuildImage.STANDARD_6_0,
      },
    });
  }

  private createBuildSpec() {
    return BuildSpec.fromObject({
      version: "0.2",
      phases: {
        build: {
          commands: [
            "make -C services/webapp build-base-image",
            "make -C E2E build-base-image",
            "make -C services/workers build-base-image",
          ],
        },
      },
    });
  }
}
