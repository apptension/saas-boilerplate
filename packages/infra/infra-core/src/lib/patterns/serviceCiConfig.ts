import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { EnvConstructProps } from '../constructs';
import { Fn } from 'aws-cdk-lib';

export interface IServiceCiConfig {
  defaultEnvVariables: {
    [name: string]: codebuild.BuildEnvironmentVariable;
  };
}

export enum PnpmWorkspaceFilters {
  BACKEND = 'backend',
  INFRA_SHARED = 'infra-shared',
  DOCS = 'docs',
  WEBAPP_EMAILS = 'webapp-emails',
  WORKERS = 'workers',
  CORE = 'core',
  TOOLS = 'tools',
  WEBAPP = 'webapp...',
  E2E_TESTS = 'e2e-tests^...',
}

export class ServiceCiConfig extends Construct implements IServiceCiConfig {
  defaultEnvVariables: { [p: string]: codebuild.BuildEnvironmentVariable };
  defaultCachePaths: string[];

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

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
      (workspace) => ` --filter=${workspace}`
    );

    return [
      'go install github.com/segmentio/chamber/v2@latest',
      'npm i -g pnpm@^8.6.1',
      `pnpm install \
                --include-workspace-root \
                --frozen-lockfile`.concat(...filters),
    ];
  }

  protected getECRLoginCommand() {
    const awsRegion = Fn.ref('AWS::Region');
    const awsAccountId = Fn.ref('AWS::AccountId');

    return `aws ecr get-login-password --region ${awsRegion} \
       | docker login --username AWS --password-stdin ${awsAccountId}.dkr.ecr.${awsRegion}.amazonaws.com`;
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
}
