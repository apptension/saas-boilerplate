import * as core from '@aws-cdk/core';
import {Fn} from '@aws-cdk/core';
import {ContainerImage, Secret as EcsSecret} from "@aws-cdk/aws-ecs";
import {PolicyStatement, Role, ServicePrincipal} from "@aws-cdk/aws-iam";
import {Secret} from "@aws-cdk/aws-secretsmanager";

import {EnvConstructProps} from "../../../types";
import {ApplicationMultipleTargetGroupsFargateService} from "../../../patterns/applicationMultipleTargetGroupsFargateService";
import {MainKmsKey} from "../../env/main/mainKmsKey";
import {MainDatabase} from "../../env/main/mainDatabase";
import {AdminPanelResources} from "./resources";


export interface AdminPanelStackProps extends core.StackProps, EnvConstructProps {
}

export class AdminPanelStack extends core.Stack {
    constructor(scope: core.App, id: string, props: AdminPanelStackProps) {
        super(scope, id, props);

        const {envSettings} = props;
        const resources = new AdminPanelResources(this, "AdminPanelResources", props);

        const taskRole = new Role(this, "AdminPanelTaskIAMRole", {
            assumedBy: new ServicePrincipal('ecs-tasks'),
        });

        taskRole.addToPolicy(new PolicyStatement({
            actions: [
                "kms:*",
                "ssm:*",
                "sqs:*",
                "cloudformation:DescribeStacks",
                "events:*",
            ],
            resources: ["*"]
        }));

        const dbSecretArn = Fn.importValue(MainDatabase.geDatabaseSecretArnOutputExportName(envSettings));

        new ApplicationMultipleTargetGroupsFargateService(this, "AdminPanelService", {
            serviceName: `${props.envSettings.projectEnvName}-admin-panel`,
            cluster: resources.mainCluster,
            cpu: 512,
            memoryLimitMiB: 1024,
            desiredCount: 1,
            taskRole,
            assignPublicIp: true,
            taskImageOptions: [
                {
                    containerName: 'nginx',
                    containerPorts: [80],
                    image: ContainerImage.fromEcrRepository(resources.nginxRepository, envSettings.version),
                    environment: {
                        "NGINX_BACKEND_HOST": "localhost",
                        "NGINX_SERVER_NAME": resources.publicLoadBalancer.loadBalancerDnsName
                    }
                },
                {
                    containerName: 'backend',
                    image: ContainerImage.fromEcrRepository(resources.backendRepository, envSettings.version),
                    environment: {
                        "CHAMBER_SERVICE_NAME": `${envSettings.projectEnvName}-admin-panel`,
                        "CHAMBER_KMS_KEY_ALIAS": MainKmsKey.getKeyAlias(envSettings),
                    },
                    secrets: {
                        "DB_CONNECTION": EcsSecret.fromSecretsManager(
                            Secret.fromSecretArn(this, "DbSecret", dbSecretArn))
                    },
                }
            ],
            loadBalancers: [
                {
                    loadBalancer: resources.publicLoadBalancer,
                    listeners: [
                        {
                            name: 'AdminPanelNginxHTTP',
                            port: 80,
                        }
                    ],
                    // domainName: '',
                    // domainZone: '',
                }
            ],
        });
    }
}
