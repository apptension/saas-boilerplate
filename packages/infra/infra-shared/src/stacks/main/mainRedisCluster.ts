import { Construct } from 'constructs';
import * as elasticache from 'aws-cdk-lib/aws-elasticache';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { SecurityGroup, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { EnvironmentSettings } from '@sb/infra-core';
import { CfnOutput } from 'aws-cdk-lib';

type MainRedisClusterProps = {
  envSettings: EnvironmentSettings;
  vpc: Vpc;
  fargateContainerSecurityGroup: SecurityGroup;
};

export class MainRedisCluster extends Construct {
  private readonly envSettings: EnvironmentSettings;
  private cluster: elasticache.CfnCacheCluster;

  static getMainRedisClusterAddressExportName(
    envSettings: EnvironmentSettings,
  ) {
    return `${envSettings.projectEnvName}-mainRedisClusterAddress`;
  }

  constructor(scope: Construct, id: string, props: MainRedisClusterProps) {
    super(scope, id);

    this.envSettings = props.envSettings;
    const securityGroup = this.createSecurityGroup(props);
    const subnetGroup = this.createSubnetGroup(props);

    this.cluster = new elasticache.CfnCacheCluster(this, 'CacheCluster', {
      clusterName: `${props.envSettings.projectEnvName}-main`,
      autoMinorVersionUpgrade: true,
      engine: 'redis',
      cacheNodeType: 'cache.t2.micro',
      numCacheNodes: 1,
      cacheSubnetGroupName: subnetGroup.ref,
      vpcSecurityGroupIds: [securityGroup.securityGroupId],
    });

    new CfnOutput(this, 'MainRedisClusterAddress', {
      exportName: MainRedisCluster.getMainRedisClusterAddressExportName(
        this.envSettings,
      ),
      value: this.cluster.attrRedisEndpointAddress,
    });
  }

  private createSubnetGroup(props: MainRedisClusterProps) {
    return new elasticache.CfnSubnetGroup(this, 'SubnetGroup', {
      cacheSubnetGroupName: `${props.envSettings.projectEnvName}-main-redis`,
      description: `Subnet group for private subnets of a ${props.envSettings.projectEnvName} main redis cluster`,
      subnetIds: props.vpc.selectSubnets({
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      }).subnetIds,
    });
  }

  private createSecurityGroup(props: MainRedisClusterProps) {
    const sg = new ec2.SecurityGroup(this, 'RedisSecurityGroup', {
      vpc: props.vpc,
    });

    const clusterPort = new ec2.Port({
      fromPort: 6379,
      toPort: 6379,
      protocol: ec2.Protocol.TCP,
      stringRepresentation: '',
    });

    sg.addIngressRule(props.fargateContainerSecurityGroup, clusterPort);

    return sg;
  }
}
