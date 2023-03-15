import { Construct } from 'constructs';
import { Fn, Stack } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elb2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
  EnvConstructProps,
  EnvironmentSettings,
} from '@sb/infra-core';

import { MainVpc } from '../stacks/main/mainVpc';
import { MainECSCluster } from '../stacks/main/mainEcsCluster';
import { GlobalECR } from '../stacks/global/resources/globalECR';

export class FargateServiceResources extends Construct {
  mainVpc: ec2.IVpc;
  mainCluster: ecs.ICluster;
  backendRepository: ecr.IRepository;
  publicLoadBalancer: elb2.IApplicationLoadBalancer;
  publicLoadBalancerSecurityGroup: ec2.ISecurityGroup;
  fargateContainerSecurityGroup: ec2.ISecurityGroup;

  private readonly envSettings: EnvironmentSettings;

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.envSettings = props.envSettings;

    this.mainVpc = this.retrieveMainVpc();
    this.fargateContainerSecurityGroup =
      this.retrieveFargateContainerSecurityGroup();
    this.mainCluster = this.retrieveMainCluster(this.mainVpc);
    this.publicLoadBalancer = this.retrievePublicLoadBalancer(this.mainVpc);
    this.publicLoadBalancerSecurityGroup =
      this.retrievePublicLoadBalancerSecurityGroup(props);
    this.backendRepository = this.retrieveBackendECRRepositories();
  }

  private retrieveMainVpc() {
    const stack = Stack.of(this);

    return ec2.Vpc.fromVpcAttributes(this, 'EC2MainVpc', {
      vpcId: Fn.importValue(
        MainVpc.getVpcArnOutputExportName(this.envSettings)
      ),
      publicSubnetIds: [
        Fn.importValue(
          MainVpc.getPublicSubnetOneIdOutputExportName(this.envSettings)
        ),
        Fn.importValue(
          MainVpc.getPublicSubnetTwoIdOutputExportName(this.envSettings)
        ),
      ],
      privateSubnetIds: [
        Fn.importValue(
          MainVpc.getPrivateSubnetOneIdOutputExportName(this.envSettings)
        ),
        Fn.importValue(
          MainVpc.getPrivateSubnetTwoIdOutputExportName(this.envSettings)
        ),
      ],
      availabilityZones: [
        stack.availabilityZones[0],
        stack.availabilityZones[1],
      ],
    });
  }

  private retrieveFargateContainerSecurityGroup() {
    return ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'FargateContainerSecurityGroup',
      Fn.importValue(
        MainECSCluster.getFargateContainerSecurityGroupIdOutputExportName(
          this.envSettings
        )
      )
    );
  }

  private retrieveMainCluster(vpc: ec2.IVpc) {
    return ecs.Cluster.fromClusterAttributes(this, 'ECSMainCluster', {
      vpc,
      securityGroups: [],
      clusterName: MainECSCluster.getClusterName(this.envSettings),
    });
  }

  private retrievePublicLoadBalancer(vpc: ec2.IVpc) {
    const securityGroupId = Fn.importValue(
      MainECSCluster.getPublicLoadBalancerSecurityGroupIdOutputExportName(
        this.envSettings
      )
    );
    const loadBalancerArn = Fn.importValue(
      MainECSCluster.getLoadBalancerArnOutputExportName(this.envSettings)
    );
    const loadBalancerDnsName = Fn.importValue(
      MainECSCluster.getLoadBalancerDnsNameOutput(this.envSettings)
    );
    const loadBalancerCanonicalHostedZoneId = Fn.importValue(
      MainECSCluster.getLoadBalancerCanonicalHostedZoneIdOutputExportName(
        this.envSettings
      )
    );

    return elb2.ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(
      this,
      'MainPublicLoadBalancer',
      {
        vpc,
        loadBalancerArn,
        securityGroupId,
        loadBalancerDnsName,
        loadBalancerCanonicalHostedZoneId,
      }
    );
  }

  private retrievePublicLoadBalancerSecurityGroup(
    props: EnvConstructProps
  ): ec2.ISecurityGroup {
    return ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'LbSecurityGroup',
      Fn.importValue(
        MainECSCluster.getPublicLoadBalancerSecurityGroupIdOutputExportName(
          props.envSettings
        )
      )
    );
  }

  private retrieveBackendECRRepositories() {
    return ecr.Repository.fromRepositoryName(
      this,
      'ECRBackendRepository',
      GlobalECR.getBackendRepositoryName(this.envSettings)
    );
  }
}
