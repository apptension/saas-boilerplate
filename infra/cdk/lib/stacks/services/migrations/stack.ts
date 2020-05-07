import * as core from '@aws-cdk/core';
import {Duration, Fn} from '@aws-cdk/core';
import {AwsLogDriver, ContainerImage, FargateTaskDefinition} from "@aws-cdk/aws-ecs";
import {RunEcsFargateTask} from "@aws-cdk/aws-stepfunctions-tasks";
import {ServiceIntegrationPattern, StateMachine, Task} from "@aws-cdk/aws-stepfunctions";

import {EnvConstructProps} from "../../../types";
import {FargateServiceResources} from "../../../patterns/fargateServiceResources";
import {Secret as EcsSecret} from "@aws-cdk/aws-ecs/lib/container-definition";
import {Secret} from "@aws-cdk/aws-secretsmanager";
import {MainDatabase} from "../../env/main/mainDatabase";
import {MainKmsKey} from "../../env/main/mainKmsKey";


export interface MigrationsStackProps extends core.StackProps, EnvConstructProps {
}

export class MigrationsStack extends core.Stack {

    constructor(scope: core.App, id: string, props: MigrationsStackProps) {
        super(scope, id, props);

        const {envSettings} = props;
        const resources = new FargateServiceResources(this, "MigrationsResources", props);

        const dbSecretArn = Fn.importValue(MainDatabase.geDatabaseSecretArnOutputExportName(envSettings));

        const migrationsTaskDefinition = new FargateTaskDefinition(this, "MigrationsTaskDefinition", {
            cpu: 256,
            memoryLimitMiB: 512,
        });

        const containerName = 'migrations';

        migrationsTaskDefinition.addContainer(containerName, {
            image: ContainerImage.fromEcrRepository(resources.backendRepository, envSettings.version),
            logging: this.createAWSLogDriver(this.node.id),
            environment: {
                "CHAMBER_SERVICE_NAME": `${envSettings.projectEnvName}-admin-panel`,
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
                            containerName: containerName,
                            command: ['./scripts/run_migrations.sh'],
                        }
                    ],
                    integrationPattern: ServiceIntegrationPattern.SYNC,
                }),
            }),
            timeout: Duration.seconds(60),
        });
    }

    protected createAWSLogDriver(prefix: string): AwsLogDriver {
        return new AwsLogDriver({streamPrefix: prefix});
    }
}
