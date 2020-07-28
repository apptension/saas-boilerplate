import {App, Fn, Stack, StackProps} from "@aws-cdk/core";

import {EnvConstructProps} from "../../../types";
import {MainDatabase} from "./mainDatabase";
import {SecurityGroup, Vpc} from "@aws-cdk/aws-ec2";
import {MainVpc} from "../main/mainVpc";
import {MainECSCluster} from "../main/mainEcsCluster";
import {MainLambdaConfig} from "../main/mainLambdaConfig";


export interface EnvDbStackProps extends StackProps, EnvConstructProps {

}

export class EnvDbStack extends Stack {
    mainDatabase: MainDatabase;

    constructor(scope: App, id: string, props: EnvDbStackProps) {
        super(scope, id, props);

        const {envSettings} = props;

        const mainVpc = this.retrieveMainVpc(props);


        this.mainDatabase = new MainDatabase(this, "MainDatabase", {
            envSettings,
            vpc: mainVpc,
            fargateContainerSecurityGroup: this.retrieveFargateContainerSecurityGroup(props),
            lambdaSecurityGroup: this.retrieveLambdaSecurityGroup(props),
        });
    }

    private retrieveMainVpc(props: EnvDbStackProps) {
        const stack = Stack.of(this);

        return Vpc.fromVpcAttributes(this, "EC2MainVpc", {
            vpcId: Fn.importValue(MainVpc.getVpcArnOutputExportName(props.envSettings)),
            publicSubnetIds: [
                Fn.importValue(MainVpc.getPublicSubnetOneIdOutputExportName(props.envSettings)),
                Fn.importValue(MainVpc.getPublicSubnetTwoIdOutputExportName(props.envSettings)),
            ],
            availabilityZones: [
                stack.availabilityZones[0],
                stack.availabilityZones[1],
            ],
        });
    }

    private retrieveFargateContainerSecurityGroup(props: EnvDbStackProps) {
        return SecurityGroup.fromSecurityGroupId(this, "FargateContainerSecurityGroup",
            Fn.importValue(MainECSCluster.getFargateContainerSecurityGroupIdOutputExportName(props.envSettings)));
    }

    private retrieveLambdaSecurityGroup(props: EnvDbStackProps) {
        return SecurityGroup.fromSecurityGroupId(this, "LambdaSecurityGroup",
            Fn.importValue(MainLambdaConfig.getLambdaSecurityGroupIdOutputExportName(props.envSettings)));
    }
}
