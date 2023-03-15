import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import { SecurityGroup } from 'aws-cdk-lib/aws-ec2';

import { MainVpc } from './mainVpc';
import {
  EnvConstructProps,
  EnvironmentSettings,
} from '@sb/infra-core';

export interface MainLambdaConfigProps extends EnvConstructProps {
  mainVpc: MainVpc;
}

export class MainLambdaConfig extends Construct {
  lambdaSecurityGroup: SecurityGroup;

  static getLambdaSecurityGroupIdOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-lambdaSecurityGroupId`;
  }

  constructor(scope: Construct, id: string, props: MainLambdaConfigProps) {
    super(scope, id);

    this.lambdaSecurityGroup = this.createLambdaSecurityGroup(props);
  }

  private createLambdaSecurityGroup(
    props: MainLambdaConfigProps
  ): SecurityGroup {
    const sg = new SecurityGroup(this, 'LambdaSecurityGroup', {
      vpc: props.mainVpc.vpc,
      allowAllOutbound: true,
      description: `${props.envSettings.projectName} Lambda function security group`,
    });

    new CfnOutput(this, 'LambdaSecurityGroupIdOutput', {
      exportName: MainLambdaConfig.getLambdaSecurityGroupIdOutputExportName(
        props.envSettings
      ),
      value: sg.securityGroupId,
    });

    return sg;
  }
}
