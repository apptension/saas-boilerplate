import { Construct } from 'constructs';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { SecretValue } from 'aws-cdk-lib';

export class GlobalBuildSecrets extends Construct {
  secret: sm.Secret;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.secret = new sm.Secret(this, 'Secret', {
      description: 'Build Secrets',
      secretName: 'GlobalBuildSecrets',
      secretObjectValue: {
        DOCKER_USERNAME: SecretValue.unsafePlainText(''),
        DOCKER_PASSWORD: SecretValue.unsafePlainText(''),
      },
    });
  }
}
