import { App, Fn, Stack, StackProps } from 'aws-cdk-lib';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { EnvConstructProps } from '@sb/infra-core';

import { MainDatabase } from './mainDatabase';
import { MainVpc } from '../main/mainVpc';
import { MainECSCluster } from '../main/mainEcsCluster';
import { MainLambdaConfig } from '../main/mainLambdaConfig';

export interface EnvDbStackProps extends StackProps, EnvConstructProps {}

export class EnvDbStack extends Stack {
  mainDatabase: MainDatabase;

  constructor(scope: App, id: string, props: EnvDbStackProps) {
    super(scope, id, props);

    const { envSettings } = props;

    const mainVpc = this.retrieveMainVpc(props);

    this.mainDatabase = new MainDatabase(this, 'MainDatabase', {
      envSettings,
      vpc: mainVpc,
      fargateContainerSecurityGroup:
        this.retrieveFargateContainerSecurityGroup(props),
      lambdaSecurityGroup: this.retrieveLambdaSecurityGroup(props),
    });
  }

  private retrieveMainVpc(props: EnvDbStackProps) {
    const stack = Stack.of(this);

    return Vpc.fromVpcAttributes(this, 'EC2MainVpc', {
      vpcId: Fn.importValue(
        MainVpc.getVpcArnOutputExportName(props.envSettings)
      ),
      publicSubnetIds: [
        Fn.importValue(
          MainVpc.getPublicSubnetOneIdOutputExportName(props.envSettings)
        ),
        Fn.importValue(
          MainVpc.getPublicSubnetTwoIdOutputExportName(props.envSettings)
        ),
      ],
      privateSubnetIds: [
        Fn.importValue(
          MainVpc.getPrivateSubnetOneIdOutputExportName(props.envSettings)
        ),
        Fn.importValue(
          MainVpc.getPrivateSubnetTwoIdOutputExportName(props.envSettings)
        ),
      ],
      availabilityZones: [
        stack.availabilityZones[0],
        stack.availabilityZones[1],
      ],
    });
  }

  private retrieveFargateContainerSecurityGroup(props: EnvDbStackProps) {
    return SecurityGroup.fromSecurityGroupId(
      this,
      'FargateContainerSecurityGroup',
      Fn.importValue(
        MainECSCluster.getFargateContainerSecurityGroupIdOutputExportName(
          props.envSettings
        )
      )
    );
  }

  private retrieveLambdaSecurityGroup(props: EnvDbStackProps) {
    return SecurityGroup.fromSecurityGroupId(
      this,
      'LambdaSecurityGroup',
      Fn.importValue(
        MainLambdaConfig.getLambdaSecurityGroupIdOutputExportName(
          props.envSettings
        )
      )
    );
  }
}
