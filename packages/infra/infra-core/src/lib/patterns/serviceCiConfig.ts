import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { EnvConstructProps } from '../constructs';
import { CI_MODE } from '../env-config';
import { IStage } from 'aws-cdk-lib/aws-codepipeline';

export interface IServiceCiConfig {
  defaultEnvVariables: {
    [name: string]: codebuild.BuildEnvironmentVariable;
  };
}

export enum PnpmWorkspaceFilters {
  BACKEND = 'backend...',
  INFRA_SHARED = 'infra-shared...',
  DOCS = 'docs...',
  WEBAPP_EMAILS = 'webapp-emails...',
  WORKERS = 'workers...',
  CORE = 'core',
  TOOLS = 'tools',
  WEBAPP = 'webapp...',
}

export class ServiceCiConfig extends Construct implements IServiceCiConfig {
  defaultEnvVariables: { [p: string]: codebuild.BuildEnvironmentVariable };
  defaultCachePaths: string[];
  props: EnvConstructProps;

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);
    this.props = props;

    this.defaultEnvVariables = {
      CI: {
        type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        value: 'true',
      },
      PROJECT_NAME: {
        type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        value: props.envSettings.projectName,
      },
      ENV_STAGE: {
        type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
        value: props.envSettings.envStage,
      },
    };

    this.defaultCachePaths = ['~/.pnpm-store'];
  }

  protected getWorkspaceSetupCommands(
    ...pnpmWorkspaceFilters: PnpmWorkspaceFilters[]
  ) {
    const filters = pnpmWorkspaceFilters.map(
      (workspace) => ` --filter=${workspace}`,
    );

    return [
      'go install github.com/segmentio/chamber/v2@latest',
      'npm i -g pnpm@~9.5.0',
      `pnpm install \
                --include-workspace-root \
                --frozen-lockfile`.concat(...filters),
    ];
  }

  protected getAssumeRoleCommands() {
    return [
      'TEMP_ROLE=`aws sts assume-role --role-arn $ASSUME_ROLE_ARN --role-session-name test`',
      'export TEMP_ROLE',
      'export AWS_ACCESS_KEY_ID=$(echo "${TEMP_ROLE}" | jq -r \'.Credentials.AccessKeyId\')',
      'export AWS_SECRET_ACCESS_KEY=$(echo "${TEMP_ROLE}" | jq -r \'.Credentials.SecretAccessKey\')',
      'export AWS_SESSION_TOKEN=$(echo "${TEMP_ROLE}" | jq -r \'.Credentials.SessionToken\')',
    ];
  }

  protected getRunOrder(stage: IStage, defaultRunOrder?: number) {
    if (this.props.envSettings.CIConfig.mode === CI_MODE.PARALLEL) {
      return defaultRunOrder;
    }
    return stage.actions.length + 1;
  }
}
