import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import {
  EnvConstructProps,
  EnvironmentSettings,
} from '@sb/infra-core';

export interface MainECSClusterProps extends EnvConstructProps {
  vpc: ec2.Vpc;
  certificateArn?: string;
}

export class MainECSCluster extends Construct {
  cluster: ecs.Cluster;
  fargateContainerSecurityGroup: ec2.SecurityGroup;
  publicLoadBalancer: elb.ApplicationLoadBalancer;

  static getClusterName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-main`;
  }

  static getLoadBalancerArnOutputExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-publicLBArn`;
  }

  static getLoadBalancerDnsNameOutput(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-publicLBDnsName`;
  }

  static getPublicLoadBalancerSecurityGroupIdOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-publicLBSecurityGroupId`;
  }

  static getLoadBalancerCanonicalHostedZoneIdOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-publicLBCanonicalHostedZoneId`;
  }

  static getLoadBalancerHttpsListenerArnOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-publicLBHttpsListenerArn`;
  }

  static getFargateContainerSecurityGroupIdOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-fargateContainerSecurityGroupId`;
  }

  constructor(scope: Construct, id: string, props: MainECSClusterProps) {
    super(scope, id);

    this.cluster = this.createCluster(props);
    this.fargateContainerSecurityGroup = this.createFargateSecurityGroup(props);
    this.publicLoadBalancer = this.createPublicLoadBalancer(props);
  }

  private createCluster(props: MainECSClusterProps): ecs.Cluster {
    return new ecs.Cluster(this, 'Cluster', {
      vpc: props.vpc,
      clusterName: MainECSCluster.getClusterName(props.envSettings),
      enableFargateCapacityProviders: true,
    });
  }

  private createFargateSecurityGroup(
    props: MainECSClusterProps
  ): ec2.SecurityGroup {
    const sg = new ec2.SecurityGroup(this, 'FargateContainerSecurityGroup', {
      vpc: props.vpc,
      allowAllOutbound: true,
      description: `${props.envSettings.projectName} Fargate container security group`,
    });

    sg.addIngressRule(sg, ec2.Port.allTcp());

    new CfnOutput(this, 'FargateContainerSecurityGroupIdOutput', {
      exportName:
        MainECSCluster.getFargateContainerSecurityGroupIdOutputExportName(
          props.envSettings
        ),
      value: sg.securityGroupId,
    });

    return sg;
  }

  private createPublicLoadBalancer(
    props: MainECSClusterProps
  ): elb.ApplicationLoadBalancer {
    const securityGroup = new ec2.SecurityGroup(this, 'ALBSecurityGroup', {
      vpc: props.vpc,
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic());

    const publicLoadBalancer = new elb.ApplicationLoadBalancer(this, 'ALB', {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: securityGroup,
      idleTimeout: Duration.seconds(30),
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC, onePerAz: true },
    });

    const httpsListener = publicLoadBalancer.addListener('HttpsListener', {
      protocol: elb.ApplicationProtocol.HTTPS,
      open: true,
      port: 443,
      defaultTargetGroups: [
        new elb.ApplicationTargetGroup(this, 'DummyTargetGroup', {
          vpc: props.vpc,
          port: 80,
          targetGroupName: `${props.envSettings.projectEnvName}-dtg`,
          targetType: elb.TargetType.IP,
        }),
      ],
    });

    if (props.certificateArn) {
      httpsListener.addCertificates('Certificate', [
        elb.ListenerCertificate.fromArn(props.certificateArn),
      ]);
    }

    new CfnOutput(this, 'PublicLoadBalancerSecurityGroupIdOutput', {
      exportName:
        MainECSCluster.getPublicLoadBalancerSecurityGroupIdOutputExportName(
          props.envSettings
        ),
      value: securityGroup.securityGroupId,
    });

    new CfnOutput(this, 'PublicLoadBalancerDnsNameOutput', {
      exportName: MainECSCluster.getLoadBalancerDnsNameOutput(
        props.envSettings
      ),
      value: publicLoadBalancer.loadBalancerDnsName,
    });

    new CfnOutput(this, 'PublicLoadBalancerArnOutput', {
      exportName: MainECSCluster.getLoadBalancerArnOutputExportName(
        props.envSettings
      ),
      value: publicLoadBalancer.loadBalancerArn,
    });

    new CfnOutput(this, 'PublicLoadBalancerCanonicalHostedZoneIdOutput', {
      exportName:
        MainECSCluster.getLoadBalancerCanonicalHostedZoneIdOutputExportName(
          props.envSettings
        ),
      value: publicLoadBalancer.loadBalancerCanonicalHostedZoneId,
    });

    new CfnOutput(this, 'PublicLoadBalancerHttpsListenerArn', {
      exportName:
        MainECSCluster.getLoadBalancerHttpsListenerArnOutputExportName(
          props.envSettings
        ),
      value: httpsListener.listenerArn,
    });

    return publicLoadBalancer;
  }
}
