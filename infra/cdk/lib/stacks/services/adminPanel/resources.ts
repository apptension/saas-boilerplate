import {Construct, Fn, Stack} from "@aws-cdk/core";
import {IVpc, Vpc} from "@aws-cdk/aws-ec2";
import {Cluster, ICluster} from "@aws-cdk/aws-ecs";
import {IRepository, Repository} from "@aws-cdk/aws-ecr";
import {ApplicationLoadBalancer, IApplicationLoadBalancer} from "@aws-cdk/aws-elasticloadbalancingv2";

import {EnvConstructProps} from "../../../types";
import {MainVpc} from '../../env/main/mainVpc';
import {GlobalECR} from "../../global/resources/ecr";
import {MainECSCluster} from "../../env/main/mainEcsCluster";
import {EnvironmentSettings} from "../../../settings";


export class AdminPanelResources extends Construct {
    mainVpc: IVpc;
    mainCluster: ICluster;
    nginxRepository: IRepository;
    backendRepository: IRepository;
    publicLoadBalancer: IApplicationLoadBalancer;

    private envSettings: EnvironmentSettings;

    constructor(scope: Construct, id: string, props: EnvConstructProps) {
        super(scope, id);

        this.envSettings = props.envSettings;

        this.retrieveMainVpc();
        this.retrieveMainCluster();
        this.retrievePublicLoadBalancer();
        this.retrieveECRRepositories();
    }

    private retrieveMainVpc() {
        const stack = Stack.of(this);

        this.mainVpc = Vpc.fromVpcAttributes(this, "EC2MainVpc", {
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

    private retrieveMainCluster() {
        this.mainCluster = Cluster.fromClusterAttributes(this, "ECSMainCluster", {
            vpc: this.mainVpc,
            securityGroups: [],
            clusterName: MainECSCluster.getClusterName(this.envSettings),
        });
    }

    private retrievePublicLoadBalancer() {
        const securityGroupId = Fn.importValue(
            MainECSCluster.getPublicLoadBalancerSecurityGroupIdOutputExportName(this.envSettings));
        const loadBalancerArn = Fn.importValue(MainECSCluster.getLoadBalancerArnOutputExportName(this.envSettings));
        const loadBalancerDnsName = Fn.importValue(MainECSCluster.getLoadBalancerDnsNameOutput(this.envSettings));

        this.publicLoadBalancer = ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(this,
            "MainPublicLoadBalancer", {
                vpc: this.mainVpc,
                loadBalancerArn,
                securityGroupId,
                loadBalancerDnsName,
            })
    }

    private retrieveECRRepositories() {
        this.nginxRepository = Repository.fromRepositoryName(this, "ECRNginxRepository",
            GlobalECR.getNginxRepositoryName(this.envSettings));

        this.backendRepository = Repository.fromRepositoryName(this, "ECRBackendRepository",
            GlobalECR.getBackendRepositoryName(this.envSettings));
    }
}
