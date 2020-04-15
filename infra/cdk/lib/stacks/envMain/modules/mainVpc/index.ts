import {Port, SecurityGroup} from "@aws-cdk/aws-ec2";
import {Construct} from "@aws-cdk/core";

import {EnvironmentSettings} from "../../../../settings";
import {EnvMainResources} from "../../resources";

export class MainVpcConfig {
    fargateContainerSecurityGroup: SecurityGroup;

    constructor(scope: Construct, envSettings: EnvironmentSettings, resources: EnvMainResources) {
        this.fargateContainerSecurityGroup = new SecurityGroup(scope, "EC2FargateContainerSecurityGroup", {
            vpc: resources.ec2.mainVpc,
            allowAllOutbound: true,
            description: `${envSettings.projectName} Fargate container security group`,
        })

        this.fargateContainerSecurityGroup.addIngressRule(this.fargateContainerSecurityGroup, Port.allTcp())
    }
}