import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { EnvConstructProps, EnvironmentSettings } from '@sb/infra-core';

import { MainVpc } from './mainVpc';
import { MainECSCluster } from './mainEcsCluster';
import { MainKmsKey } from './mainKmsKey';
import { MainLambdaConfig } from './mainLambdaConfig';
import { MainCertificates } from './mainCertificates';
import { MainRedisCluster } from './mainRedisCluster';

export interface EnvMainStackProps extends StackProps, EnvConstructProps {}

export class EnvMainStack extends Stack {
  mainVpc: MainVpc;
  mainEcsCluster: MainECSCluster;
  mainKmsKey: MainKmsKey;
  mainLambdaConfig: MainLambdaConfig;
  mainCertificates?: MainCertificates;

  constructor(scope: App, id: string, props: EnvMainStackProps) {
    super(scope, id, props);

    const { envSettings } = props;

    this.mainVpc = new MainVpc(this, 'MainVPC', { envSettings });

    let certificateArn;
    if (envSettings.hostedZone.id) {
      this.mainCertificates = new MainCertificates(this, 'MainCertificates', {
        envSettings,
      });
      certificateArn = this.mainCertificates.certificate?.certificateArn;
    } else {
      certificateArn = envSettings.certificates.loadBalancerCertificateArn;
    }

    this.mainEcsCluster = new MainECSCluster(this, 'MainECSCluster', {
      envSettings,
      vpc: this.mainVpc.vpc,
      certificateArn,
    });
    this.mainKmsKey = new MainKmsKey(this, 'MainKMSKey', { envSettings });
    this.mainLambdaConfig = new MainLambdaConfig(this, 'MainLambdaConfig', {
      envSettings,
      mainVpc: this.mainVpc,
    });
    new MainRedisCluster(this, 'MainRedisCluster', {
      envSettings,
      vpc: this.mainVpc.vpc,
      fargateContainerSecurityGroup:
        this.mainEcsCluster.fargateContainerSecurityGroup,
    });
  }

  static getIamPolicyStatementsForEnvParameters(
    envSettings: EnvironmentSettings,
    region = '*',
    account = '*',
  ) {
    const alias = MainKmsKey.getKeyAlias(envSettings);
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
          `arn:aws:ssm:${region}:${account}:parameter/env-${envSettings.projectName}-${envSettings.envStage}-*`,
        ],
      }),
    ];
  }
}
