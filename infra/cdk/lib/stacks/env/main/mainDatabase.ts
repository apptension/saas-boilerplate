import {CfnOutput, Construct} from "@aws-cdk/core";
import {DatabaseInstance, DatabaseInstanceEngine} from "@aws-cdk/aws-rds";
import {InstanceClass, InstanceSize, InstanceType, Port, Protocol, SecurityGroup, Vpc} from "@aws-cdk/aws-ec2";

import {EnvironmentSettings} from "../../../settings";
import {EnvConstructProps} from "../../../types";


export interface MainDatabaseProps extends EnvConstructProps {
    vpc: Vpc;
    fargateContainerSecurityGroup: SecurityGroup,
}

export class MainDatabase extends Construct {
    private securityGroup: SecurityGroup;
    private instance: DatabaseInstance;

    private readonly envSettings: EnvironmentSettings;
    private readonly vpc: Vpc;
    private readonly fargateContainerSecurityGroup: SecurityGroup;

    static geDatabaseSecretArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-databaseSecretArn`
    }

    constructor(scope: Construct, id: string, props: MainDatabaseProps) {
        super(scope, id);

        this.envSettings = props.envSettings;
        this.vpc = props.vpc;
        this.fargateContainerSecurityGroup = props.fargateContainerSecurityGroup;

        this.securityGroup = this.createSecurityGroup();

        this.instance = new DatabaseInstance(this, "Instance", {
            instanceIdentifier: `${this.envSettings.projectEnvName}-main`,
            vpc: this.vpc,
            engine: DatabaseInstanceEngine.POSTGRES,
            instanceClass: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
            masterUsername: 'root',
            databaseName: 'main',
            securityGroups: [this.securityGroup],
            deletionProtection: true,
        });

        this.createOutputs();
    }

    createSecurityGroup(): SecurityGroup {
        const sg = new SecurityGroup(this, "SecurityGroup", {
            vpc: this.vpc,
        });

        sg.addIngressRule(this.fargateContainerSecurityGroup, new Port({
            fromPort: 5432,
            toPort: 5432,
            protocol: Protocol.TCP,
            stringRepresentation: "",
        }));

        return sg;
    }

    private createOutputs() {
        if (this.instance.secret) {
            new CfnOutput(this, "SecretOutput", {
                exportName: MainDatabase.geDatabaseSecretArnOutputExportName(this.envSettings),
                value: this.instance.secret.secretArn,
            });
        }
    }
}
