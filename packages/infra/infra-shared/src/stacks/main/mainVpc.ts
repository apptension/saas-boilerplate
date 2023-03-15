import { Construct } from 'constructs';
import { IpAddresses, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { CfnOutput } from 'aws-cdk-lib';
import {
  EnvConstructProps,
  EnvironmentSettings,
} from '@sb/infra-core';

export class MainVpc extends Construct {
  vpc: Vpc;

  private readonly envSettings: EnvironmentSettings;

  static getVpcArnOutputExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-mainVpcId`;
  }

  static getPublicSubnetOneIdOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-publicSubnetOneId`;
  }

  static getPublicSubnetTwoIdOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-publicSubnetTwoId`;
  }

  static getPrivateSubnetOneIdOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-privateSubnetOneId`;
  }

  static getPrivateSubnetTwoIdOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-privateSubnetTwoId`;
  }

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.envSettings = props.envSettings;
    this.vpc = this.createVPC();

    this.createOutputs(props);
  }

  private createVPC() {
    return new Vpc(this, 'EC2MainVpc', {
      ipAddresses: IpAddresses.cidr('10.0.0.0/16'),
      enableDnsSupport: true,
      enableDnsHostnames: true,
      natGateways: 1,
      subnetConfiguration: [
        { cidrMask: 24, name: 'PublicSubnet', subnetType: SubnetType.PUBLIC },
        {
          cidrMask: 24,
          name: 'PrivateSubnet',
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });
  }

  private createOutputs(props: EnvConstructProps) {
    new CfnOutput(this, 'PublicSubnetOneIdOutput', {
      exportName: MainVpc.getPublicSubnetOneIdOutputExportName(
        props.envSettings
      ),
      value: this.vpc.publicSubnets[0].subnetId,
    });

    new CfnOutput(this, 'PublicSubnetTwoIdOutput', {
      exportName: MainVpc.getPublicSubnetTwoIdOutputExportName(
        props.envSettings
      ),
      value: this.vpc.publicSubnets[1].subnetId,
    });

    new CfnOutput(this, 'PrivateSubnetOneIdOutput', {
      exportName: MainVpc.getPrivateSubnetOneIdOutputExportName(
        props.envSettings
      ),
      value: this.vpc.privateSubnets[0].subnetId,
    });

    new CfnOutput(this, 'PrivateSubnetTwoIdOutput', {
      exportName: MainVpc.getPrivateSubnetTwoIdOutputExportName(
        props.envSettings
      ),
      value: this.vpc.privateSubnets[1].subnetId,
    });

    new CfnOutput(this, 'MainVPCOutput', {
      exportName: MainVpc.getVpcArnOutputExportName(props.envSettings),
      value: this.vpc.vpcId,
    });
  }
}
