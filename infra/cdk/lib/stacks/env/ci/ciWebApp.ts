import {Construct} from "constructs";
import {Stack} from "aws-cdk-lib";
import {
  BuildEnvironmentVariableType,
  BuildSpec,
  Cache,
  LinuxBuildImage,
  LocalCacheMode,
  Project,
} from "aws-cdk-lib/aws-codebuild";
import {CodeBuildAction, CodeBuildActionProps} from "aws-cdk-lib/aws-codepipeline-actions";
import {Artifact, IStage} from "aws-cdk-lib/aws-codepipeline";
import {AccountRootPrincipal, Effect, PolicyStatement, Role} from "aws-cdk-lib/aws-iam";

import {EnvConstructProps} from "../../../types";
import {ServiceCiConfig} from "../../../patterns/serviceCiConfig";
import {IRepository} from "aws-cdk-lib/aws-ecr";

interface WebAppCiConfigProps extends EnvConstructProps {
  inputArtifact: Artifact;
  buildStage: IStage;
  deployStage: IStage;
  webappBaseRepository: IRepository;
}

export class WebappCiConfig extends ServiceCiConfig {
  constructor(scope: Construct, id: string, props: WebAppCiConfigProps) {
    super(scope, id, { envSettings: props.envSettings });

    const buildArtifact = Artifact.artifact(
      `${props.envSettings.projectEnvName}-webapp`
    );

    const buildProject = this.createBuildProject(props);
    props.buildStage.addAction(
      this.createBuildAction(
        {
          project: buildProject,
          input: props.inputArtifact,
          outputs: [buildArtifact],
        },
        props
      )
    );

    const deployProject = this.createDeployProject(props);
    props.deployStage.addAction(
      this.createDeployAction(
        {
          project: deployProject,
          input: buildArtifact,
          runOrder: 2,
        },
        props
      )
    );
  }

  private createBuildAction(
    actionProps: Partial<CodeBuildActionProps>,
    props: WebAppCiConfigProps
  ) {
    return new CodeBuildAction(<CodeBuildActionProps>{
      ...actionProps,
      actionName: `${props.envSettings.projectEnvName}-build-webapp`,
    });
  }

  private createBuildProject(props: WebAppCiConfigProps) {
    const configEnvVariables = Object.assign(
      {},
      ...Object.keys(props.envSettings.webAppEnvVariables).map((k) => ({
        [k]: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.webAppEnvVariables[k],
        },
      }))
    );
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

    const project = new Project(this, "WebAppBuildProject", {
      projectName: `${props.envSettings.projectEnvName}-build-webapp`,
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
          build: { commands: ["make -C services/webapp build"] },
        },
        artifacts: {
          files: [
            "*",
            "infra/**/*",
            "scripts/**/*",
            "services/webapp/*",
            "services/webapp/build/**/*",
          ],
        },
      }),
      environment: {
        privileged: true,
        buildImage: LinuxBuildImage.STANDARD_6_0,
      },
      environmentVariables: {
        ...this.defaultEnvVariables,
        ...configEnvVariables,
        REACT_APP_ENVIRONMENT_NAME: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.envStage,
        },
        ASSUME_ROLE_ARN: {
          type: BuildEnvironmentVariableType.PLAINTEXT,
          value: dockerAssumeRole.roleArn,
        },
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

    props.webappBaseRepository.grantPull(dockerAssumeRole);

    return project;
  }

  private createDeployAction(
    actionProps: Partial<CodeBuildActionProps>,
    props: WebAppCiConfigProps
  ) {
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
        version: "0.2",
        phases: {
          pre_build: { commands: ["make -C services/webapp install-deploy"] },
          build: { commands: ["make -C services/webapp deploy"] },
        },
        cache: {
          paths: [...this.defaultCachePaths],
        },
      }),
      environmentVariables: { ...this.defaultEnvVariables },
      environment: { buildImage: LinuxBuildImage.STANDARD_6_0 },
      cache: Cache.local(LocalCacheMode.CUSTOM),
    });

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["cloudformation:*"],
        resources: [
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/CDKToolkit/*`,
          `arn:aws:cloudformation:${stack.region}:${stack.account}:stack/${props.envSettings.projectEnvName}-WebAppStack/*`,
        ],
      })
    );

    project.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "iam:*",
          "sts:*",
          "cloudfront:*",
          "s3:*",
          "ecs:*",
          "lambda:*",
          "route53:*",
        ],
        resources: ["*"],
      })
    );

    return project;
  }
}
