import * as core from '@aws-cdk/core';
import {Duration, Fn, Stack} from '@aws-cdk/core';
import {AwsLogDriver, ContainerDefinition, ContainerImage, FargateTaskDefinition} from "@aws-cdk/aws-ecs";
import {RunEcsFargateTask} from "@aws-cdk/aws-stepfunctions-tasks";
import {ServiceIntegrationPattern, StateMachine, Task} from "@aws-cdk/aws-stepfunctions";
import {Secret} from "@aws-cdk/aws-secretsmanager";
import {Secret as EcsSecret} from "@aws-cdk/aws-ecs/lib/container-definition";
import {PolicyStatement, Role, ServicePrincipal} from "@aws-cdk/aws-iam";

import {EnvConstructProps} from "../../../types";
import {FargateServiceResources} from "../../../patterns/fargateServiceResources";
import {MainDatabase} from "../../env/db/mainDatabase";
import {MainKmsKey} from "../../env/main/mainKmsKey";
import {EnvironmentSettings} from "../../../settings";


export interface MigrationsStackProps extends core.StackProps, EnvConstructProps {
}

export class MigrationsStack extends core.Stack {

    constructor(scope: core.App, id: string, props: MigrationsStackProps) {
        super(scope, id, props);

        const {envSettings} = props;
        const resources = new FargateServiceResources(this, "MigrationsResources", props);

        const containerName = 'migrations';
        const dbSecretArn = Fn.importValue(MainDatabase.getDatabaseSecretArnOutputExportName(envSettings));
        const taskRole = this.createTaskRole(props);

        const migrationsTaskDefinition = new FargateTaskDefinition(this, "MigrationsTaskDefinition", {
            taskRole,
            cpu: 256,
            memoryLimitMiB: 512,
        });

        const containerDef = migrationsTaskDefinition.addContainer(containerName, {
            image: ContainerImage.fromEcrRepository(resources.backendRepository, envSettings.version),
            logging: this.createAWSLogDriver(this.node.id),
            environment: {
                "CHAMBER_SERVICE_NAME": this.getChamberServiceName(envSettings),
                "CHAMBER_KMS_KEY_ALIAS": MainKmsKey.getKeyAlias(envSettings),
            },
            secrets: {
                "DB_CONNECTION": EcsSecret.fromSecretsManager(
                    Secret.fromSecretArn(this, "DbSecret", dbSecretArn))
            },
        });

        new StateMachine(this, "MigrationsStateMachine", {
            stateMachineName: `${envSettings.projectEnvName}-migrations`,
            definition: new Task(this, "MigrationsFargateTask", {
                task: new RunEcsFargateTask({
                    cluster: resources.mainCluster,
                    taskDefinition: migrationsTaskDefinition,
                    assignPublicIp: true,
                    securityGroup: resources.fargateContainerSecurityGroup,
                    containerOverrides: [
                        {
                            containerDefinition: containerDef,
                            command: ['./scripts/run_migrations.sh'],
                        }
                    ],
                    integrationPattern: ServiceIntegrationPattern.SYNC,
                }),
            }),
            timeout: Duration.minutes(5),
        });
    }

    protected createAWSLogDriver(prefix: string): AwsLogDriver {
        return new AwsLogDriver({streamPrefix: prefix});
    }

    protected createTaskRole(props: MigrationsStackProps): Role {
        const stack = Stack.of(this);
        const chamberServiceName = this.getChamberServiceName(props.envSettings);

        const taskRole = new Role(this, "MigrationsTaskRole", {
            assumedBy: new ServicePrincipal('ecs-tasks'),
        });

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
