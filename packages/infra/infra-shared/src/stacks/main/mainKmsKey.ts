import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import { EnvConstructProps, EnvironmentSettings } from '@sb/infra-core';

export class MainKmsKey extends Construct {
  key: kms.Key;

  private readonly envSettings: EnvironmentSettings;

  static getKeyAlias(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-main`;
  }

  static getMainKmsOutputExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-mainKmsKeyArn`;
  }


  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.envSettings = props.envSettings;

    this.key = new kms.Key(this, 'Key', {
      alias: `alias/${MainKmsKey.getKeyAlias(this.envSettings)}`,
    });

    this.key.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['kms:Encrypt', 'kms:Decrypt'],
        principals: [new iam.AccountRootPrincipal()],
        resources: ['*'],
      })
    );

    new CfnOutput(this, 'MainKmsKeyArnOutput', {
      exportName: MainKmsKey.getMainKmsOutputExportName(this.envSettings),
      value: this.key.keyArn,
    });
  }
}
