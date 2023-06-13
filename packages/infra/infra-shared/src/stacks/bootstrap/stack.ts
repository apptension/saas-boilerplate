import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as iam from 'aws-cdk-lib/aws-iam';

export class BootstrapStack extends Stack {
  key: kms.Key;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    this.key = new kms.Key(this, 'Key', {
      alias: 'alias/parameter_store_key',
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
