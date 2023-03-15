import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  EnvConstructProps,
  EnvironmentSettings,
} from '@sb/infra-core';

export class GlobalCodeCommit extends Construct {
  repository: codecommit.Repository;

  static getCodeRepositoryName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectName}-code`;
  }

  static getCodeRepoUserNameOutputExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectName}-codeRepoUserName`;
  }

  static getCodeRepoCloneUrlHttpOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectName}-codeRepoCloneUrlHttp`;
  }

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.repository = new codecommit.Repository(this, 'CodeRepo', {
      repositoryName: GlobalCodeCommit.getCodeRepositoryName(props.envSettings),
      description: `${props.envSettings.projectName} code mirror repository used to source CodePipeline`,
    });

    const user = new iam.User(this, 'CodeRepoUser', {
      userName: `${props.envSettings.projectName}-code`,
    });
    this.repository.grantPullPush(user);

    new CfnOutput(this, 'CodeRepoUserName', {
      exportName: GlobalCodeCommit.getCodeRepoUserNameOutputExportName(
        props.envSettings
      ),
      value: user.userName,
    });

    new CfnOutput(this, 'CodeRepoCloneUrlHttp', {
      exportName: GlobalCodeCommit.getCodeRepoCloneUrlHttpOutputExportName(
        props.envSettings
      ),
      value: this.repository.repositoryCloneUrlHttp,
    });
  }
}
