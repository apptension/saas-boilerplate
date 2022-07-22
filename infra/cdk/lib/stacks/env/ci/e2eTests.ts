import {Construct} from "constructs";
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  Cache,
  LinuxBuildImage,
  LocalCacheMode,
  Project,
  Source,
} from "aws-cdk-lib/aws-codebuild";
import {CodeBuildAction, CodeBuildActionProps} from "aws-cdk-lib/aws-codepipeline-actions";
import {Artifact, IStage} from "aws-cdk-lib/aws-codepipeline";
import {AccountRootPrincipal, Effect, PolicyStatement, Role} from "aws-cdk-lib/aws-iam";
import {aws_codecommit as cc, aws_ecr as ecr} from "aws-cdk-lib";

import {EnvConstructProps} from "../../../types";
import {ServiceCiConfig} from "../../../patterns/serviceCiConfig";

interface E2ETestsCiConfigProps extends EnvConstructProps {
  inputArtifact: Artifact;
  stage: IStage;
  e2eBaseRepository: ecr.IRepository;
  codeRepository: cc.IRepository;
}

export class E2ETestsCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: E2ETestsCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const project = this.createProject(props);
    props.stage.addAction(
      this.createAction({ project, input: props.inputArtifact }, props)
    );
  }

  private createAction(
    actionProps: Partial<CodeBuildActionProps>,
    props: E2ETestsCiConfigProps
  ) {
    return new CodeBuildAction(<CodeBuildActionProps>{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-e2e-tests`,
    });
  }

  private createProject(props: E2ETestsCiConfigProps) {
    const dockerAssumeRole = new Role(this, "BuildDockerAssume", {
      assumedBy: new AccountRootPrincipal(),
    });
    dockerAssumeRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["kms:*", "ssm:*"],
        resources: ["*"],
      })
    );

    const basicAuth = props.envSettings.appBasicAuth?.split(":");

    const project = new Project(this, "E2ETestsProject", {
      projectName: `${props.envSettings.projectEnvName}-e2e-tests`,
      source: Source.codeCommit({ repository: props.codeRepository }),
      buildSpec: BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            commands: [
              "TEMP_ROLE=`aws sts assume-role --role-arn $ASSUME_ROLE_ARN --role-session-name test`",
              "export TEMP_ROLE",
              "export AWS_ACCESS_KEY_ID=$(echo \"${TEMP_ROLE}\" | jq -r '.Credentials.AccessKeyId')",
              "export AWS_SECRET_ACCESS_KEY=$(echo \"${TEMP_ROLE}\" | jq -r '.Credentials.SecretAccessKey')",
              "export AWS_SESSION_TOKEN=$(echo \"${TEMP_ROLE}\" | jq -r '.Credentials.SessionToken')",
            ],
          },
          build: { commands: ["make -C E2E test"] },
        },
      }),
      environment: {
        privileged: true,
        buildImage: LinuxBuildImage.STANDARD_6_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        ASSUME_ROLE_ARN: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: dockerAssumeRole.roleArn,
        },
        ...(basicAuth
          ? {
              CYPRESS_BASIC_AUTH_LOGIN: {
                type: BuildEnvironmentVariableType.PLAINTEXT,
                value: basicAuth[0],
              },
              CYPRESS_BASIC_AUTH_PASSWORD: {
                type: BuildEnvironmentVariableType.PLAINTEXT,
                value: basicAuth[1],
              },
              CYPRESS_BASIC_AUTH_HEADER: {
                type: BuildEnvironmentVariableType.PLAINTEXT,
                value: `Basic ${Buffer.from(
                  `${basicAuth[0]}:${basicAuth[1]}`
                ).toString("base64")}`,
              },
            }
          : {}),
      },
      cache: Cache.local(LocalCacheMode.DOCKER_LAYER),
    });

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sts:AssumeRole"],
        resources: [dockerAssumeRole.roleArn],
      })
    );

    props.e2eBaseRepository.grantPull(dockerAssumeRole);

    return project;
  }
}
