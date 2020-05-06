import {App, Stack, StackProps} from "@aws-cdk/core";
import {EnvConstructProps} from "../../../types";
import {MainVpc} from './mainVpc';
import {MainECSCluster} from './mainEcsCluster';
import {MainKmsKey} from "./mainKmsKey";
import {MainDatabase} from "./mainDatabase";


export interface EnvMainStackProps extends StackProps, EnvConstructProps {

}

export class EnvMainStack extends Stack {
    mainVpc: MainVpc;
    mainEcsCluster: MainECSCluster;
    mainKmsKey: MainKmsKey;
    mainDatabase: MainDatabase;

    constructor(scope: App, id: string, props: EnvMainStackProps) {
        super(scope, id, props);

        const {envSettings} = props;

        this.mainVpc = new MainVpc(this, "MainVPC", {envSettings});
        this.mainEcsCluster = new MainECSCluster(this, "MainECSCluster", {envSettings, mainVpc: this.mainVpc});
        this.mainKmsKey = new MainKmsKey(this, "MainKMSKey", {envSettings});
        this.mainDatabase = new MainDatabase(this, "MainDatabase", {
            envSettings,
            vpc: this.mainVpc.vpc,
            fargateContainerSecurityGroup: this.mainEcsCluster.fargateContainerSecurityGroup,
        });
    }
}
