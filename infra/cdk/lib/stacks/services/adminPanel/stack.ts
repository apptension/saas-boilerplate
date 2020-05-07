import * as core from '@aws-cdk/core';
import {Fn, Stack} from '@aws-cdk/core';
import {ContainerImage, Secret as EcsSecret} from "@aws-cdk/aws-ecs";
import {PolicyStatement, Role, ServicePrincipal} from "@aws-cdk/aws-iam";
import {Secret} from "@aws-cdk/aws-secretsmanager";

import {EnvConstructProps} from "../../../types";
import {ApplicationMultipleTargetGroupsFargateService} from "../../../patterns/applicationMultipleTargetGroupsFargateService";
import {MainKmsKey} from "../../env/main/mainKmsKey";
import {MainDatabase} from "../../env/main/mainDatabase";
import {FargateServiceResources} from "../../../patterns/fargateServiceResources";
import {MigrationsStackProps} from "../migrations/stack";
import {EnvironmentSettings} from "../../../settings";


export interface AdminPanelStackProps extends core.StackProps, EnvConstructProps {
}

export class AdminPanelStack extends core.Stack {
    fargateService: ApplicationMultipleTargetGroupsFargateService;

    constructor(scope: core.App, id: string, props: AdminPanelStackProps) {
        super(scope, id, props);

        const {envSettings} = props;
        const resources = new FargateServiceResources(this, "AdminPanelResources", props);
        const taskRole = this.createTaskRole(props);

        const dbSecretArn = Fn.importValue(MainDatabase.geDatabaseSecretArnOutputExportName(envSettings));

        this.fargateService = new ApplicationMultipleTargetGroupsFargateService(this, "AdminPanelService", {
            securityGroup: resources.fargateContainerSecurityGroup,
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
                },
                {
                    containerName: 'backend',
                    image: ContainerImage.fromEcrRepository(resources.backendRepository, envSettings.version),
                    environment: {
                        "CHAMBER_SERVICE_NAME": this.getChamberServiceName(envSettings),
                        "CHAMBER_KMS_KEY_ALIAS": MainKmsKey.getKeyAlias(envSettings),
                        "DJANGO_ALLOWED_HOSTS": `${resources.publicLoadBalancer.loadBalancerDnsName},`,
                        "DJANGO_ALLOWED_CIDR_NETS": "10.0.1.0/24"
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

    protected createTaskRole(props: MigrationsStackProps): Role {
        const stack = Stack.of(this);
        const chamberServiceName = this.getChamberServiceName(props.envSettings);

        const taskRole = new Role(this, "AdminPanelTaskRole", {
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
        return `${envSettings.projectEnvName}-admin-panel`;
    }
}
