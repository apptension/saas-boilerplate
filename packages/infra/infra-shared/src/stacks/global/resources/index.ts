import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { EnvConstructProps } from '@sb/infra-core';

import { GlobalECR } from './globalECR';
import { GlobalBuildSecrets } from './globalBuildSecrets';

export class GlobalResources extends Construct {
  ecr: GlobalECR;
  buildSecrets: GlobalBuildSecrets;
  externalCiUser: iam.User;

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.ecr = new GlobalECR(this, 'ECRGlobal', props);
    this.buildSecrets = new GlobalBuildSecrets(this, 'GlobalBuildSecrets');
    this.externalCiUser = new iam.User(this, 'ExternalCiUser', {
      userName: GlobalResources.getExternalCIUserName(),
    });
  }

  static getExternalCIUserName() {
    return 'external-ci';
  }
}
