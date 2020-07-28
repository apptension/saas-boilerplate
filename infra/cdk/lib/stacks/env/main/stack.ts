import {App, Stack, StackProps} from "@aws-cdk/core";

import {EnvConstructProps} from "../../../types";
import {MainVpc} from './mainVpc';
import {MainECSCluster} from './mainEcsCluster';
import {MainKmsKey} from "./mainKmsKey";
import {MainLambdaConfig} from "./mainLambdaConfig";
import {MainCertificates} from "./mainCertificates";


export interface EnvMainStackProps extends StackProps, EnvConstructProps {

}

export class EnvMainStack extends Stack {
    mainVpc: MainVpc;
    mainEcsCluster: MainECSCluster;
    mainKmsKey: MainKmsKey;
    mainLambdaConfig: MainLambdaConfig;
    mainCertificates: MainCertificates;

    constructor(scope: App, id: string, props: EnvMainStackProps) {
        super(scope, id, props);

        const {envSettings} = props;

        this.mainVpc = new MainVpc(this, "MainVPC", {envSettings});
        this.mainCertificates = new MainCertificates(this, "MainCertificates", {
            envSettings,
        });

        this.mainEcsCluster = new MainECSCluster(this, "MainECSCluster", {
            envSettings,
            vpc: this.mainVpc.vpc,
            certificate: this.mainCertificates.certificate,
        });
        this.mainKmsKey = new MainKmsKey(this, "MainKMSKey", {envSettings});
        this.mainLambdaConfig = new MainLambdaConfig(this, "MainLambdaConfig", {
            envSettings,
            mainVpc: this.mainVpc,
        });
    }
}
