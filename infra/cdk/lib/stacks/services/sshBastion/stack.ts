import * as core from '@aws-cdk/core';
import {CfnOutput, Fn, Stack} from '@aws-cdk/core';
import {AwsLogDriver, ContainerImage, FargateTaskDefinition, Protocol} from "@aws-cdk/aws-ecs";
import {Secret} from "@aws-cdk/aws-secretsmanager";
import {Secret as EcsSecret} from "@aws-cdk/aws-ecs/lib/container-definition";
import {PolicyStatement, Role, ServicePrincipal} from "@aws-cdk/aws-iam";

import {EnvConstructProps} from "../../../types";
import {FargateServiceResources} from "../../../patterns/fargateServiceResources";
import {MainDatabase} from "../../env/db/mainDatabase";
import {MainKmsKey} from "../../env/main/mainKmsKey";
import {EnvironmentSettings} from "../../../settings";
import {Peer, Port, SecurityGroup} from "@aws-cdk/aws-ec2";
import {EnvComponentsStack} from "../../env/components";


export interface SshBastionStackProps extends core.StackProps, EnvConstructProps {
}

export class SshBastionStack extends core.Stack {

    static getTaskDefinitionArn(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-sshBastionTaskDefinitionArn`;
    }

    static getSecurityGroupId(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-sshBastionSecurityGroupId`;
    }

    constructor(scope: core.App, id: string, props: SshBastionStackProps) {
        super(scope, id, props);

        const {envSettings} = props;

        if (!props.envSettings.sshBastion.sshPublicKey) {
            return;
        }

        const resources = new FargateServiceResources(this, "Resources", props);
        const securityGroup = new SecurityGroup(this, "SecurityGroup", {
            vpc: resources.mainVpc,
            allowAllOutbound: true,
        });
        securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22));
        securityGroup.addIngressRule(securityGroup, Port.allTcp());

        const containerName = 'sshBastion';
        const dbSecretArn = Fn.importValue(MainDatabase.getDatabaseSecretArnOutputExportName(envSettings));
        const taskRole = this.createTaskRole(props);

        const taskDefinition = new FargateTaskDefinition(this, "TaskDefinition", {
            taskRole,
            cpu: 256,
            memoryLimitMiB: 512,
        });

        const container = taskDefinition.addContainer(containerName, {
            image: ContainerImage.fromEcrRepository(resources.backendRepository, 'ssh-bastion'),
            logging: this.createAWSLogDriver(this.node.id),
            environment: {
                "CHAMBER_SERVICE_NAME": this.getChamberServiceName(envSettings),
                "CHAMBER_KMS_KEY_ALIAS": MainKmsKey.getKeyAlias(envSettings),
                "SSH_PUBLIC_KEY": props.envSettings.sshBastion.sshPublicKey,
                "WORKERS_EVENT_BUS_NAME": EnvComponentsStack.getWorkersEventBusName(props.envSettings),
            },
            secrets: {
                "DB_CONNECTION": EcsSecret.fromSecretsManager(
                    Secret.fromSecretArn(this, "DbSecret", dbSecretArn)),
            },
            command: ["sh", "-c", "/bin/chamber exec $CHAMBER_SERVICE_NAME -- ./scripts/run-ssh-bastion.sh"]
        });

        container.addPortMappings({
            protocol: Protocol.TCP,
            hostPort: 22,
            containerPort: 22,
        });

        new CfnOutput(this, "TaskDefinitionArnOutput", {
            exportName: SshBastionStack.getTaskDefinitionArn(props.envSettings),
            value: taskDefinition.taskDefinitionArn,
        });

        new CfnOutput(this, "SecurityGroupIdOutput", {
            exportName: SshBastionStack.getSecurityGroupId(props.envSettings),
            value: securityGroup.securityGroupId,
        });
    }

    protected createAWSLogDriver(prefix: string): AwsLogDriver {
        return new AwsLogDriver({streamPrefix: prefix});
    }

    protected createTaskRole(props: SshBastionStackProps): Role {
        const stack = Stack.of(this);
        const chamberServiceName = this.getChamberServiceName(props.envSettings);

        const taskRole = new Role(this, "MigrationsTaskRole", {
            assumedBy: new ServicePrincipal('ecs-tasks'),
        });

        taskRole.addToPolicy(new PolicyStatement({
            actions: ["sqs:*", "cloudformation:DescribeStacks", "events:*"],
            resources: ["*"],
        }));

        taskRole.addToPolicy(new PolicyStatement({
            actions: [
                "kms:Get*",
                "kms:Describe*",
                "kms:List*",
                "kms:Decrypt",
            ],
            resources: [
                Fn.importValue(MainKmsKey.getMainKmsOutputExportName(props.envSettings)),
            ],
        }));

        taskRole.addToPolicy(new PolicyStatement({
            actions: ["ssm:DescribeParameters"],
            resources: ["*"],
        }));

        taskRole.addToPolicy(new PolicyStatement({
            actions: ["ssm:GetParameters*"],
            resources: [
                `arn:aws:ssm:${stack.region}:${stack.account}:parameter/${chamberServiceName}/*`,
            ],
        }));

        return taskRole;
    }

    protected getChamberServiceName(envSettings: EnvironmentSettings) {
        return `env-${envSettings.projectEnvName}-backend`;
    }
}
