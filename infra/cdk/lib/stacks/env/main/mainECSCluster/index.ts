import {CfnOutput, Construct, Duration} from "@aws-cdk/core";
import {Cluster} from '@aws-cdk/aws-ecs';
import {Peer, Port, SecurityGroup, SubnetType} from "@aws-cdk/aws-ec2";
import {ApplicationLoadBalancer} from "@aws-cdk/aws-elasticloadbalancingv2";

import {EnvironmentSettings} from "../../../../settings";
import {EnvConstructProps} from "../../../../types";
import {MainVpc} from "../mainVpc";
import {ApplicationMultipleTargetGroupsFargateService} from "@aws-cdk/aws-ecs-patterns";

export interface MainECSClusterProps extends EnvConstructProps {
    mainVpc: MainVpc,
}

export class MainECSCluster extends Construct {
    cluster: Cluster;
    fargateContainerSecurityGroup: SecurityGroup;
    publicLoadBalancer: ApplicationLoadBalancer;
    loadBalancerSecurityGroup: SecurityGroup;

    private readonly mainVpc: MainVpc;
    private readonly envSettings: EnvironmentSettings;

    static getClusterName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-main`;
    }

    static getLoadBalancerArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicLBArn`;
    }

    static getLoadBalancerDnsNameOutput(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicLBDnsName`;
    }

    static getPublicLoadBalancerSecurityGroupIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicLBSecurityGroupId`;
    }

    constructor(scope: Construct, id: string, props: MainECSClusterProps) {
        super(scope, id);

        this.mainVpc = props.mainVpc;
        this.envSettings = props.envSettings;

        this.createCluster();
        this.createFargateSecurityGroup();
        this.createPublicLoadBalancer();
        this.createOutputs();
    }

    private createCluster() {
        this.cluster = new Cluster(this, "ECSMainCluster", {
            clusterName: MainECSCluster.getClusterName(this.envSettings),
            vpc: this.mainVpc.vpc,
        });
    }

    private createFargateSecurityGroup() {
        this.fargateContainerSecurityGroup = new SecurityGroup(this, "EC2FargateContainerSecurityGroup", {
            vpc: this.mainVpc.vpc,
            allowAllOutbound: true,
            description: `${this.envSettings.projectName} Fargate container security group`,
        })

        this.fargateContainerSecurityGroup.addIngressRule(this.fargateContainerSecurityGroup, Port.allTcp())
    }

    private createPublicLoadBalancer() {
        ApplicationMultipleTargetGroupsFargateService
        this.loadBalancerSecurityGroup = new SecurityGroup(this, "ECSMainALBSecurityGroup", {
            vpc: this.mainVpc.vpc,
        });
        this.loadBalancerSecurityGroup.addIngressRule(Peer.anyIpv4(), Port.allTraffic());

        this.publicLoadBalancer = new ApplicationLoadBalancer(this, "ECSMainALB", {
            vpc: this.mainVpc.vpc,
            internetFacing: true,
            securityGroup: this.loadBalancerSecurityGroup,
            idleTimeout: Duration.seconds(30),
            vpcSubnets: {subnetType: SubnetType.PUBLIC, onePerAz: true},
        });
    }

    private createOutputs() {
        new CfnOutput(this, "PublicLoadBalancerDnsNameOutput", {
            exportName: MainECSCluster.getLoadBalancerDnsNameOutput(this.envSettings),
            value: this.publicLoadBalancer.loadBalancerDnsName,
        });

        new CfnOutput(this, "PublicLoadBalancerArnOutput", {
            exportName: MainECSCluster.getLoadBalancerArnOutputExportName(this.envSettings),
            value: this.publicLoadBalancer.loadBalancerArn,
        })

        new CfnOutput(this, "PublicLoadBalancerSecurityGroupIdOutput", {
            exportName: MainECSCluster.getPublicLoadBalancerSecurityGroupIdOutputExportName(this.envSettings),
            value: this.loadBalancerSecurityGroup.securityGroupId,
        })
    }
}
