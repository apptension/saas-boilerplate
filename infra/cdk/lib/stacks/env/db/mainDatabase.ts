import {CfnOutput, Construct} from "@aws-cdk/core";
import {DatabaseInstance, DatabaseInstanceEngine} from "@aws-cdk/aws-rds";
import {
    InstanceClass,
    InstanceSize,
    InstanceType,
    ISecurityGroup,
    IVpc,
    Port,
    Protocol,
    SecurityGroup,
    Vpc
} from "@aws-cdk/aws-ec2";
import {Effect, PolicyStatement, Role, ServicePrincipal} from "@aws-cdk/aws-iam";

import {EnvironmentSettings} from "../../../settings";
import {EnvConstructProps} from "../../../types";


export interface MainDatabaseProps extends EnvConstructProps {
    vpc: IVpc;
    fargateContainerSecurityGroup: ISecurityGroup,
    lambdaSecurityGroup: ISecurityGroup,
}

export class MainDatabase extends Construct {
    private instance: DatabaseInstance;

    static getDatabaseSecretArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-databaseSecretArn`
    }

    static getDatabaseProxyRoleArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-databaseProxyRoleArn`
    }

    constructor(scope: Construct, id: string, props: MainDatabaseProps) {
        super(scope, id);

        this.instance = this.createDbInstance(props);
        this.createProxyRole(this.instance, props);
    }

    createSecurityGroup(props: MainDatabaseProps): SecurityGroup {
        const sg = new SecurityGroup(this, "SecurityGroup", {
            vpc: props.vpc,
        });

        const dbPort = new Port({
            fromPort: 5432,
            toPort: 5432,
            protocol: Protocol.TCP,
            stringRepresentation: "",
        });

        sg.addIngressRule(props.fargateContainerSecurityGroup, dbPort);
        sg.addIngressRule(props.lambdaSecurityGroup, dbPort);

        return sg;
    }

    private createDbInstance(props: MainDatabaseProps) {
        const securityGroup = this.createSecurityGroup(props);

        const instance = new DatabaseInstance(this, "Instance", {
            instanceIdentifier: `${props.envSettings.projectEnvName}-main`,
            vpc: props.vpc,
            engine: DatabaseInstanceEngine.POSTGRES,
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
            masterUsername: 'root',
            databaseName: 'main',
            securityGroups: [securityGroup],
            deletionProtection: true,
        });

        if (instance.secret) {
            new CfnOutput(this, "SecretOutput", {
                exportName: MainDatabase.getDatabaseSecretArnOutputExportName(props.envSettings),
                value: instance.secret.secretArn,
            });
        }

        return instance;
    }

    private createProxyRole(instance: DatabaseInstance, props: MainDatabaseProps) {
        const role = new Role(this, "DBProxyRole", {
            assumedBy: new ServicePrincipal('rds.amazonaws.com'),
        });

        role.addToPolicy(new PolicyStatement({
            effect: Effect.ALLOW,
            actions: [
                "secretsmanager:GetRandomPassword",
                "secretsmanager:CreateSecret",
                "secretsmanager:ListSecrets",
            ],
            resources: ['*'],
        }));

        if (instance.secret) {
            role.addToPolicy(new PolicyStatement({
                effect: Effect.ALLOW,
                actions: ['secretsmanager:*'],
                resources: [instance.secret.secretArn]
            }));
        }

        new CfnOutput(this, "DbProxyRoleArn", {
            exportName: MainDatabase.getDatabaseProxyRoleArnOutputExportName(props.envSettings),
            value: role.roleArn,
        });
    }
}
