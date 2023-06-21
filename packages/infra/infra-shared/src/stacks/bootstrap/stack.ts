import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';
import { EnvironmentSettings } from '@sb/infra-core';

export class BootstrapStack extends Stack {
  key: kms.Key;

  static getParameterStoreKeyAlias() {
    return 'parameter_store_key';
  }

  static getIamPolicyStatementsForEnvParameters(
    envSettings: EnvironmentSettings,
    region = '*',
    account = '*'
  ) {
    const alias = BootstrapStack.getParameterStoreKeyAlias();
    return [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['kms:Decrypt'],
        resources: ['*'],
        conditions: {
          'ForAllValues:StringLike': {
            'kms:ResourceAliases': [`alias/*${alias}*`],
          },
          'ForAnyValue:StringLike': {
            'kms:ResourceAliases': [`alias/*${alias}*`],
          },
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
        resources: [
          `arn:aws:ssm:${region}:${account}:parameter/${envSettings.envStage}/*`,
        ],
      }),
    ];
  }

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    this.key = new kms.Key(this, 'Key', {
      alias: `alias/${BootstrapStack.getParameterStoreKeyAlias()}`,
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
