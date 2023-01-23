import {Construct} from "constructs";
import {CfnOutput} from "aws-cdk-lib";
import {Key} from "aws-cdk-lib/aws-kms";
import {AccountRootPrincipal, PolicyStatement} from "aws-cdk-lib/aws-iam";

import {EnvironmentSettings} from "../../../settings";
import {EnvConstructProps} from "../../../types";

export interface MainKmsKeyProps extends EnvConstructProps {
}

export class MainKmsKey extends Construct {
    key: Key;

    private readonly envSettings: EnvironmentSettings;

    static getKeyAlias(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-main`;
    }

    static getMainKmsOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-mainKmsKeyArn`;
    }

    constructor(scope: Construct, id: string, props: MainKmsKeyProps) {
        super(scope, id);

        this.envSettings = props.envSettings;

        this.key = new Key(this, "Key", {
            alias: `alias/${MainKmsKey.getKeyAlias(this.envSettings)}`
        });

        this.key.addToResourcePolicy(new PolicyStatement({
            actions: [
                "kms:Encrypt",
                "kms:Decrypt",
            ],
            principals: [new AccountRootPrincipal()],
            resources: ["*"],
        }));

        new CfnOutput(this, "MainKmsKeyArnOutput", {
            exportName: MainKmsKey.getMainKmsOutputExportName(this.envSettings),
            value: this.key.keyArn,
        });
    }
}
