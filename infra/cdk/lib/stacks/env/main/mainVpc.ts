import {SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {CfnOutput, Construct} from "@aws-cdk/core";

import {EnvironmentSettings} from "../../../settings";
import {EnvConstructProps} from "../../../types";

export interface MainVpcProps extends EnvConstructProps {
}

export class MainVpc extends Construct {
    vpc: Vpc;

    private readonly envSettings: EnvironmentSettings;

    static getVpcArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-mainVpcId`
    }

    static getPublicSubnetOneIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicSubnetOneId`
    }

    static getPublicSubnetTwoIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-publicSubnetTwoId`
    }

    constructor(scope: Construct, id: string, props: MainVpcProps) {
        super(scope, id);

        this.envSettings = props.envSettings;

        this.createVPC();
        this.createOutputs();
    }

    private createVPC() {
        this.vpc = new Vpc(this, "EC2MainVpc", {
            cidr: '10.0.0.0/16',
            enableDnsSupport: true,
            enableDnsHostnames: true,
            natGateways: 0,
            subnetConfiguration: [
                {cidrMask: 24, name: "PublicSubnetOne", subnetType: SubnetType.PUBLIC},
                {cidrMask: 24, name: "PublicSubnetTwo", subnetType: SubnetType.PUBLIC},
            ]
        });
    }

    private createOutputs() {
        new CfnOutput(this, "PublicSubnetOneIdOutput", {
            exportName: MainVpc.getPublicSubnetOneIdOutputExportName(this.envSettings),
            value: this.vpc.publicSubnets[0].subnetId,
        });

        new CfnOutput(this, "PublicSubnetTwoIdOutput", {
            exportName: MainVpc.getPublicSubnetTwoIdOutputExportName(this.envSettings),
            value: this.vpc.publicSubnets[1].subnetId,
        });

        new CfnOutput(this, "MainVPCOutput", {
            exportName: MainVpc.getVpcArnOutputExportName(this.envSettings),
            value: this.vpc.vpcId,
        });
    }
}
