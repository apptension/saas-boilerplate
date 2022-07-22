import {Construct} from "constructs";
import {CfnOutput, Duration} from "aws-cdk-lib";
import {Cluster} from 'aws-cdk-lib/aws-ecs';
import {Peer, Port, SecurityGroup, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";
import {
    ApplicationLoadBalancer,
    ApplicationProtocol,
    ApplicationTargetGroup,
    ListenerCertificate,
    TargetType
} from "aws-cdk-lib/aws-elasticloadbalancingv2";

import {EnvironmentSettings} from "../../../settings";
import {EnvConstructProps} from "../../../types";


export interface MainECSClusterProps extends EnvConstructProps {
    vpc: Vpc,
    certificateArn: string,
}

export class MainECSCluster extends Construct {
    cluster: Cluster;
    fargateContainerSecurityGroup: SecurityGroup;
    publicLoadBalancer: ApplicationLoadBalancer;

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

    static getLoadBalancerCanonicalHostedZoneIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicLBCanonicalHostedZoneId`;
    }

    static getLoadBalancerHttpsListenerArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicLBHttpsListenerArn`;
    }

    static getFargateContainerSecurityGroupIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-fargateContainerSecurityGroupId`;
    }

    constructor(scope: Construct, id: string, props: MainECSClusterProps) {
        super(scope, id);

        this.cluster = this.createCluster(props);
        this.fargateContainerSecurityGroup = this.createFargateSecurityGroup(props);
        this.publicLoadBalancer = this.createPublicLoadBalancer(props);
    }

    private createCluster(props: MainECSClusterProps): Cluster {
        return new Cluster(this, "Cluster", {
            vpc: props.vpc,
            clusterName: MainECSCluster.getClusterName(props.envSettings),
        });
    }

    private createFargateSecurityGroup(props: MainECSClusterProps): SecurityGroup {
        const sg = new SecurityGroup(this, "FargateContainerSecurityGroup", {
            vpc: props.vpc,
            allowAllOutbound: true,
            description: `${props.envSettings.projectName} Fargate container security group`,
        });

        sg.addIngressRule(sg, Port.allTcp());

        new CfnOutput(this, "FargateContainerSecurityGroupIdOutput", {
            exportName: MainECSCluster.getFargateContainerSecurityGroupIdOutputExportName(props.envSettings),
            value: sg.securityGroupId,
        });

        return sg;
    }

    private createPublicLoadBalancer(props: MainECSClusterProps): ApplicationLoadBalancer {
        const securityGroup = new SecurityGroup(this, "ALBSecurityGroup", {
            vpc: props.vpc,
        });
        securityGroup.addIngressRule(Peer.anyIpv4(), Port.allTraffic());

        const publicLoadBalancer = new ApplicationLoadBalancer(this, "ALB", {
            vpc: props.vpc,
            internetFacing: true,
            securityGroup: securityGroup,
            idleTimeout: Duration.seconds(30),
            vpcSubnets: {subnetType: SubnetType.PUBLIC, onePerAz: true},
        });

        const httpsListener = publicLoadBalancer.addListener("HttpsListener", {
            protocol: ApplicationProtocol.HTTPS,
            open: true,
            port: 443,
            defaultTargetGroups: [new ApplicationTargetGroup(this, 'DummyTargetGroup', {
                vpc: props.vpc,
                port: 80,
                targetGroupName: `${props.envSettings.projectEnvName}-dtg`,
                targetType: TargetType.IP,
            })]
        });

        httpsListener.addCertificates("Certificate", [ListenerCertificate.fromArn(props.certificateArn)]);

        new CfnOutput(this, "PublicLoadBalancerSecurityGroupIdOutput", {
            exportName: MainECSCluster.getPublicLoadBalancerSecurityGroupIdOutputExportName(props.envSettings),
            value: securityGroup.securityGroupId,
        });

        new CfnOutput(this, "PublicLoadBalancerDnsNameOutput", {
            exportName: MainECSCluster.getLoadBalancerDnsNameOutput(props.envSettings),
            value: publicLoadBalancer.loadBalancerDnsName,
        });

        new CfnOutput(this, "PublicLoadBalancerArnOutput", {
            exportName: MainECSCluster.getLoadBalancerArnOutputExportName(props.envSettings),
            value: publicLoadBalancer.loadBalancerArn,
        });

        new CfnOutput(this, "PublicLoadBalancerCanonicalHostedZoneIdOutput", {
            exportName: MainECSCluster.getLoadBalancerCanonicalHostedZoneIdOutputExportName(props.envSettings),
            value: publicLoadBalancer.loadBalancerCanonicalHostedZoneId,
        });

        new CfnOutput(this, "PublicLoadBalancerHttpsListenerArn", {
            exportName: MainECSCluster.getLoadBalancerHttpsListenerArnOutputExportName(props.envSettings),
            value: httpsListener.listenerArn,
        })

        return publicLoadBalancer;
    }
}
