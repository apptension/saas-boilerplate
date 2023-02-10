import { Construct } from 'constructs';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { EnvConstructProps } from '@saas-boilerplate-app/infra-core';

export class GlobalBuildSecrets extends Construct {
  secret: sm.Secret;

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.secret = new sm.Secret(this, 'Secret', {
      description: 'Build Secrets',
      secretName: 'GlobalBuildSecrets',
    });
  }
}
