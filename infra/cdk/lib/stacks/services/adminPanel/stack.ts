import * as core from '@aws-cdk/core';
import {Fn, Stack} from '@aws-cdk/core';
import {ContainerImage, Protocol, Secret as EcsSecret} from "@aws-cdk/aws-ecs";
import {PolicyStatement, Role, ServicePrincipal} from "@aws-cdk/aws-iam";
import {Secret} from "@aws-cdk/aws-secretsmanager";
import {ApplicationListener} from "@aws-cdk/aws-elasticloadbalancingv2";
import {PublicHostedZone} from "@aws-cdk/aws-route53";

import {EnvConstructProps} from "../../../types";
import {ApplicationMultipleTargetGroupsFargateService} from "../../../patterns/applicationMultipleTargetGroupsFargateService";
import {MainKmsKey} from "../../env/main/mainKmsKey";
import {MainDatabase} from "../../env/db/mainDatabase";
import {FargateServiceResources} from "../../../patterns/fargateServiceResources";
import {MigrationsStackProps} from "../migrations/stack";
import {EnvironmentSettings} from "../../../settings";
import {MainECSCluster} from "../../env/main/mainEcsCluster";
import {EnvComponentsStack} from "../../env/components";


export interface AdminPanelStackProps extends core.StackProps, EnvConstructProps {
}

export class AdminPanelStack extends core.Stack {
    fargateService: ApplicationMultipleTargetGroupsFargateService;

    constructor(scope: core.App, id: string, props: AdminPanelStackProps) {
        super(scope, id, props);

        const {envSettings} = props;
        const resources = new FargateServiceResources(this, "AdminPanelResources", props);
        const taskRole = this.createTaskRole(props);

        const dbSecretArn = Fn.importValue(MainDatabase.getDatabaseSecretArnOutputExportName(envSettings));
        const domainZone = PublicHostedZone.fromHostedZoneAttributes(this, "DomainZone", {
            hostedZoneId: envSettings.hostedZone.id,
            zoneName: envSettings.hostedZone.name,
        });

        const httpsListener = ApplicationListener.fromApplicationListenerAttributes(this, "HttpsListener", {
            listenerArn: Fn.importValue(
                MainECSCluster.getLoadBalancerHttpsListenerArnOutputExportName(props.envSettings)),
            securityGroup: resources.publicLoadBalancerSecurityGroup,
        });

        this.fargateService = new ApplicationMultipleTargetGroupsFargateService(this, "AdminPanelService", {
            securityGroup: resources.fargateContainerSecurityGroup,
            serviceName: `${props.envSettings.projectEnvName}-admin-panel`,
            cluster: resources.mainCluster,
            cpu: 256,
            memoryLimitMiB: 512,
            desiredCount: 1,
            taskRole,
            assignPublicIp: true,
            taskImageOptions: [
                {
                    containerName: 'backend',
                    image: ContainerImage.fromEcrRepository(resources.backendRepository, envSettings.version),
                    environment: {
                        "CHAMBER_SERVICE_NAME": this.getChamberServiceName(envSettings),
                        "CHAMBER_KMS_KEY_ALIAS": MainKmsKey.getKeyAlias(envSettings),
                        "DJANGO_ALLOWED_HOSTS": `${envSettings.domains.adminPanel}`,
                        "DJANGO_ALLOWED_CIDR_NETS": "10.0.1.0/16",
                        "WORKERS_EVENT_BUS_NAME": EnvComponentsStack.getWorkersEventBusName(props.envSettings),
                    },
                    secrets: {
                        "DB_CONNECTION": EcsSecret.fromSecretsManager(
                            Secret.fromSecretArn(this, "DbSecret", dbSecretArn)),
                    },
                }
            ],
            loadBalancers: [
                {
                    domainZone,
                    domainName: envSettings.domains.adminPanel,
                    loadBalancer: resources.publicLoadBalancer,
                    listeners: [httpsListener],
                },
            ],
            targetGroups: [
                {protocol: Protocol.TCP, containerPort: 80, priority: 1, hostHeader: envSettings.domains.adminPanel}
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
        return `env-${envSettings.projectEnvName}-backend`;
    }
}
