import {App, Stack, StackProps} from "@aws-cdk/core";
import {EnvConstructProps} from "../../../types";
import {MainVpc} from './mainVpc';
import {MainECSCluster} from './mainECSCluster';
import {MainKmsKey} from "./mainKmsKey";


export interface EnvMainStackProps extends StackProps, EnvConstructProps {

}

export class EnvMainStack extends Stack {
    mainVpc: MainVpc;
    mainEcsCluster: MainECSCluster;
    mainKmsKey: MainKmsKey;

    constructor(scope: App, id: string, props: EnvMainStackProps) {
        super(scope, id, props);

        const {envSettings} = props;

        this.mainVpc = new MainVpc(this, "MainVPC", {envSettings});
        this.mainEcsCluster = new MainECSCluster(this, "MainECSCluster", {envSettings, mainVpc: this.mainVpc});
        this.mainKmsKey = new MainKmsKey(this, "MainKMSKey", {envSettings});
    }
}
