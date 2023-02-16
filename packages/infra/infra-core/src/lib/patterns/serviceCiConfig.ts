import { Construct } from 'constructs';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { EnvConstructProps } from '../constructs';

export interface IServiceCiConfig {
  defaultEnvVariables: {
    [name: string]: codebuild.BuildEnvironmentVariable;
  };
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
}
