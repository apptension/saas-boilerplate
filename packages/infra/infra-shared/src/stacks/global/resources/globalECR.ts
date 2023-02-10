import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import {
  EnvConstructProps,
  EnvironmentSettings,
} from '@saas-boilerplate-app/infra-core';

export class GlobalECR extends Construct {
  backendRepository: ecr.Repository;

  static getBackendRepositoryName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectName}-backend`;
  }

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.backendRepository = new ecr.Repository(this, 'ECRBackendRepository', {
      repositoryName: GlobalECR.getBackendRepositoryName(props.envSettings),
    });
  }
}
