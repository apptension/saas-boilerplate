import { Construct } from 'constructs';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { EnvConstructProps, EnvironmentSettings } from '@sb/infra-core';

export interface MainDatabaseProps extends EnvConstructProps {
  vpc: ec2.IVpc;
  fargateContainerSecurityGroup: ec2.ISecurityGroup;
  lambdaSecurityGroup: ec2.ISecurityGroup;
}

export class MainDatabase extends Construct {
  private instance: rds.DatabaseInstance;

  static getDatabaseSecretArnOutputExportName(
    envSettings: EnvironmentSettings,
  ) {
    return `${envSettings.projectEnvName}-databaseSecretArn`;
  }

  static getDatabaseProxyEndpointOutputExportName(
    envSettings: EnvironmentSettings,
  ) {
    return `${envSettings.projectEnvName}-databaseProxyEndpoint`;
  }

  static getProxyName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-rds-proxy`;
  }

  static getInstanceIdentifier(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-main-db`;
  }

  constructor(scope: Construct, id: string, props: MainDatabaseProps) {
    super(scope, id);

    const securityGroup = this.createSecurityGroup(props);
    this.instance = this.createDbInstance(props, securityGroup);
    this.createRdsProxy(this.instance, props, securityGroup);
  }

  createSecurityGroup(props: MainDatabaseProps): ec2.SecurityGroup {
    const sg = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc: props.vpc,
    });

    const dbPort = new ec2.Port({
      fromPort: 5432,
      toPort: 5432,
      protocol: ec2.Protocol.TCP,
      stringRepresentation: '',
    });

    sg.addIngressRule(props.fargateContainerSecurityGroup, dbPort);
    sg.addIngressRule(props.lambdaSecurityGroup, dbPort);

    return sg;
  }

  private createDbInstance(
    props: MainDatabaseProps,
    securityGroup: ec2.SecurityGroup,
  ) {
    const instance = new rds.DatabaseInstance(this, 'Instance', {
      instanceIdentifier: MainDatabase.getInstanceIdentifier(props.envSettings),
      vpc: props.vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_17_2,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO,
      ),
      databaseName: 'main',
      securityGroups: [securityGroup],
      deletionProtection: true,
      storageEncrypted: true,
      allowMajorVersionUpgrade: true,
    });

    if (instance.secret) {
      new CfnOutput(this, 'SecretOutput', {
        exportName: MainDatabase.getDatabaseSecretArnOutputExportName(
          props.envSettings,
        ),
        value: instance.secret.secretArn,
      });
    }

    return instance;
  }

  private createRdsProxy(
    instance: rds.DatabaseInstance,
    props: MainDatabaseProps,
    securityGroup: ec2.SecurityGroup,
  ) {
    const proxy = instance.addProxy('proxy', {
      dbProxyName: MainDatabase.getProxyName(props.envSettings),
      borrowTimeout: Duration.seconds(30),
      maxConnectionsPercent: 100,
      secrets: instance.secret ? [instance.secret] : [],
      vpc: props.vpc,
      securityGroups: [securityGroup],
      requireTLS: false,
    });

    new CfnOutput(this, 'DbProxyEndpoint', {
      exportName: MainDatabase.getDatabaseProxyEndpointOutputExportName(
        props.envSettings,
      ),
      value: proxy.endpoint,
    });

    return proxy;
  }
}
