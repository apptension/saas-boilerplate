import * as core from '@aws-cdk/core';

import {EnvironmentSettings} from "../../../../settings";
import {SubnetType, Vpc} from "@aws-cdk/aws-ec2";

export class EnvMainEC2 {
    mainVpc: Vpc;

    constructor(scope: core.Construct, envSettings: EnvironmentSettings) {
        this.mainVpc = new Vpc(scope, "VPCMain", {
            cidr: '10.0.0.0/16',
            enableDnsSupport: true,
            enableDnsHostnames: true,
            natGateways: 0,
            subnetConfiguration: [
                {cidrMask: 24, name: "PublicSubnetOne", subnetType: SubnetType.PUBLIC},
                {cidrMask: 24, name: "PublicSubnetTwo", subnetType: SubnetType.PUBLIC},
            ]
        })
    }
}
