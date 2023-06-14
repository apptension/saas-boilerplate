import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import { EnvironmentSettings } from '@sb/infra-core';

export class BootstrapStack extends Stack {
  key: kms.Key;

  static getParameterStoreKeyAlias() {
    return 'alias/parameter_store_key';
  }

  static getIamPolicyStatementsForEnvParameters(
    envSettings: EnvironmentSettings
  ) {
    const alias = BootstrapStack.getParameterStoreKeyAlias();
    return [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'kms:Get*',
          'kms:Describe*',
          'kms:List*',
          'kms:Decrypt',
          'kms:Verify',
        ],
        resources: ['*'],
        conditions: {
          StringEquals: { 'kms:RequestAlias': alias },
          'ForAnyValue:StringEquals': { 'kms:ResourceAliases': alias },
        },
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ssm:DescribeParameters'],
        resources: ['*'],
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ssm:GetParameter*'],
        resources: [`arn:aws:ssm:::parameter/${envSettings.envStage}*`],
      }),
    ];
  }

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    this.key = new kms.Key(this, 'Key', {
      alias: BootstrapStack.getParameterStoreKeyAlias(),
    });

    this.key.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['kms:Encrypt', 'kms:Decrypt'],
        principals: [new iam.AccountRootPrincipal()],
        resources: ['*'],
      })
    );
  }
}
