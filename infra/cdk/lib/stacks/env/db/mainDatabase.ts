import {Construct} from "constructs";
import {CfnOutput, Duration} from "aws-cdk-lib";
import {DatabaseInstance, DatabaseInstanceEngine, PostgresEngineVersion} from "aws-cdk-lib/aws-rds";
import {
    InstanceClass,
    InstanceSize,
    InstanceType,
    ISecurityGroup,
    IVpc,
    Port,
    Protocol,
    SecurityGroup,
    SubnetType
} from "aws-cdk-lib/aws-ec2";

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

    static getDatabaseProxyEndpointOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-databaseProxyEndpoint`;
    }

    static getProxyName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-rds-proxy`;
    }

    constructor(scope: Construct, id: string, props: MainDatabaseProps) {
        super(scope, id);

        const securityGroup = this.createSecurityGroup(props);
        this.instance = this.createDbInstance(props, securityGroup);
        this.createRdsProxy(this.instance, props, securityGroup);
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

    private createDbInstance(props: MainDatabaseProps, securityGroup: SecurityGroup) {
        const instance = new DatabaseInstance(this, "Instance", {
            instanceIdentifier: `${props.envSettings.projectEnvName}-main`,
            vpc: props.vpc,
            vpcSubnets: {subnetType: SubnetType.PUBLIC},
            engine: DatabaseInstanceEngine.postgres({
                version: PostgresEngineVersion.VER_11_12
            }),
            instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.MICRO),
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

    private createRdsProxy(
        instance: DatabaseInstance,
        props: MainDatabaseProps,
        securityGroup: SecurityGroup
    ) {
        const proxy = instance.addProxy("proxy", {
            dbProxyName: MainDatabase.getProxyName(props.envSettings),
            borrowTimeout: Duration.seconds(30),
            maxConnectionsPercent: 100,
            secrets: instance.secret ? [instance.secret] : [],
            vpc: props.vpc,
            securityGroups: [securityGroup],
            requireTLS: false,
        });

        new CfnOutput(this, "DbProxyEndpoint", {
            exportName: MainDatabase.getDatabaseProxyEndpointOutputExportName(props.envSettings),
            value: proxy.endpoint,
        });

        return proxy;
    }
}
