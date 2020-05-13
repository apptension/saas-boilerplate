import {App, Stack, StackProps} from "@aws-cdk/core";

import {EnvConstructProps} from "../../../types";
import {MainVpc} from './mainVpc';
import {MainECSCluster} from './mainEcsCluster';
import {MainKmsKey} from "./mainKmsKey";
import {MainDatabase} from "./mainDatabase";
import {MainLambdaConfig} from "./mainLambdaConfig";


export interface EnvMainStackProps extends StackProps, EnvConstructProps {

}

export class EnvMainStack extends Stack {
    mainVpc: MainVpc;
    mainEcsCluster: MainECSCluster;
    mainKmsKey: MainKmsKey;
    mainDatabase: MainDatabase;
    mainLambdaConfig: MainLambdaConfig;

    constructor(scope: App, id: string, props: EnvMainStackProps) {
        super(scope, id, props);

        const {envSettings} = props;

        this.mainVpc = new MainVpc(this, "MainVPC", {envSettings});
        this.mainEcsCluster = new MainECSCluster(this, "MainECSCluster", {
            envSettings,
            vpc: this.mainVpc.vpc,
        });
        this.mainKmsKey = new MainKmsKey(this, "MainKMSKey", {envSettings});
        this.mainLambdaConfig = new MainLambdaConfig(this, "MainLambdaConfig", {
            envSettings,
            mainVpc: this.mainVpc,
        });
        this.mainDatabase = new MainDatabase(this, "MainDatabase", {
            envSettings,
            vpc: this.mainVpc.vpc,
            fargateContainerSecurityGroup: this.mainEcsCluster.fargateContainerSecurityGroup,
            lambdaSecurityGroup: this.mainLambdaConfig.lambdaSecurityGroup,
        });
    }
}
