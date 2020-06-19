import {Construct, Fn, Stack} from "@aws-cdk/core";
import {ISecurityGroup, IVpc, SecurityGroup, Vpc} from "@aws-cdk/aws-ec2";
import {Cluster, ICluster} from "@aws-cdk/aws-ecs";
import {IRepository, Repository} from "@aws-cdk/aws-ecr";
import {ApplicationLoadBalancer, IApplicationLoadBalancer} from "@aws-cdk/aws-elasticloadbalancingv2";

import {MainVpc} from '../stacks/env/main/mainVpc';
import {GlobalECR} from "../stacks/global/resources/globalECR";
import {MainECSCluster} from "../stacks/env/main/mainEcsCluster";
import {EnvConstructProps} from "../types";
import {EnvironmentSettings} from "../settings";


export class FargateServiceResources extends Construct {
    mainVpc: IVpc;
    mainCluster: ICluster;
    backendRepository: IRepository;
    publicLoadBalancer: IApplicationLoadBalancer;
    publicLoadBalancerSecurityGroup: ISecurityGroup;
    fargateContainerSecurityGroup: ISecurityGroup;

    private readonly envSettings: EnvironmentSettings;

    constructor(scope: Construct, id: string, props: EnvConstructProps) {
        super(scope, id);

        this.envSettings = props.envSettings;

        this.mainVpc = this.retrieveMainVpc();
        this.fargateContainerSecurityGroup = this.retrieveFargateContainerSecurityGroup();
        this.mainCluster = this.retrieveMainCluster(this.mainVpc);
        this.publicLoadBalancer = this.retrievePublicLoadBalancer(this.mainVpc);
        this.publicLoadBalancerSecurityGroup = this.retrievePublicLoadBalancerSecurityGroup(props);
        this.backendRepository = this.retrieveBackendECRRepositories();
    }

    private retrieveMainVpc() {
        const stack = Stack.of(this);

        return Vpc.fromVpcAttributes(this, "EC2MainVpc", {
            vpcId: Fn.importValue(MainVpc.getVpcArnOutputExportName(this.envSettings)),
            publicSubnetIds: [
                Fn.importValue(MainVpc.getPublicSubnetOneIdOutputExportName(this.envSettings)),
                Fn.importValue(MainVpc.getPublicSubnetTwoIdOutputExportName(this.envSettings)),
            ],
            availabilityZones: [
                stack.availabilityZones[0],
                stack.availabilityZones[1],
            ],
        });
    }

    private retrieveFargateContainerSecurityGroup() {
        return SecurityGroup.fromSecurityGroupId(this, "FargateContainerSecurityGroup",
            Fn.importValue(MainECSCluster.getFargateContainerSecurityGroupIdOutputExportName(this.envSettings)));
    }

    private retrieveMainCluster(vpc: IVpc) {
        return Cluster.fromClusterAttributes(this, "ECSMainCluster", {
            vpc,
            securityGroups: [],
            clusterName: MainECSCluster.getClusterName(this.envSettings),
        });
    }

    private retrievePublicLoadBalancer(vpc: IVpc) {
        const securityGroupId = Fn.importValue(
            MainECSCluster.getPublicLoadBalancerSecurityGroupIdOutputExportName(this.envSettings));
        const loadBalancerArn = Fn.importValue(MainECSCluster.getLoadBalancerArnOutputExportName(this.envSettings));
        const loadBalancerDnsName = Fn.importValue(MainECSCluster.getLoadBalancerDnsNameOutput(this.envSettings));
        const loadBalancerCanonicalHostedZoneId = Fn.importValue(
            MainECSCluster.getLoadBalancerCanonicalHostedZoneIdOutputExportName(this.envSettings));

        return ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(this,
            "MainPublicLoadBalancer", {
                vpc,
                loadBalancerArn,
                securityGroupId,
                loadBalancerDnsName,
                loadBalancerCanonicalHostedZoneId
            });
    }

    private retrievePublicLoadBalancerSecurityGroup(props: EnvConstructProps): ISecurityGroup {
        return SecurityGroup.fromSecurityGroupId(this, "LbSecurityGroup",
            Fn.importValue(MainECSCluster.getPublicLoadBalancerSecurityGroupIdOutputExportName(props.envSettings)));

    }

    private retrieveBackendECRRepositories() {
        return Repository.fromRepositoryName(this, "ECRBackendRepository",
            GlobalECR.getBackendRepositoryName(this.envSettings));
    }
}
