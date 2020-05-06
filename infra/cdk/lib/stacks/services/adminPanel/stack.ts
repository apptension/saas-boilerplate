import * as core from '@aws-cdk/core';
import {ContainerImage} from "@aws-cdk/aws-ecs";
import {PolicyStatement, Role, ServicePrincipal} from "@aws-cdk/aws-iam";

import {EnvConstructProps} from "../../../types";
import {ApplicationMultipleTargetGroupsFargateService} from "../../../patterns/applicationMultipleTargetGroupsFargateService";
import {AdminPanelResources} from "./resources";
import {MainKmsKey} from "../../env/main/mainKmsKey";

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
                    },
                    secrets: {
                        // "DB_CONNECTION": aws_ecs.Secret.from_secrets_manager(
                        //     aws_secretsmanager.Secret.from_secret_arn(
                        //         scope,
                        //         "DbSecret",
                        //         secret_arn=core.Fn.import_value(f"resources:{environment_name}:WebBackendDbSecretArn"),
                        //     )
                        // )
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
                        // "DB_CONNECTION": aws_ecs.Secret.from_secrets_manager(
                        //     aws_secretsmanager.Secret.from_secret_arn(
                        //         scope,
                        //         "DbSecret",
                        //         secret_arn=core.Fn.import_value(f"resources:{environment_name}:WebBackendDbSecretArn"),
                        //     )
                        // )
                    }
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
