import {App, Duration, Fn, Stack, StackProps} from "aws-cdk-lib";
import {AwsLogDriver, ContainerImage, FargateTaskDefinition, Secret as EcsSecret} from "aws-cdk-lib/aws-ecs";
import {EcsFargateLaunchTarget, EcsRunTask} from "aws-cdk-lib/aws-stepfunctions-tasks";
import {IntegrationPattern, StateMachine} from "aws-cdk-lib/aws-stepfunctions";
import {Secret} from "aws-cdk-lib/aws-secretsmanager";
import {PolicyStatement, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";

import {EnvConstructProps} from "../../../types";
import {FargateServiceResources} from "../../../patterns/fargateServiceResources";
import {MainDatabase} from "../../env/db/mainDatabase";
import {MainKmsKey} from "../../env/main/mainKmsKey";
import {EnvironmentSettings} from "../../../settings";

export interface MigrationsStackProps
  extends StackProps,
    EnvConstructProps {}

export class MigrationsStack extends Stack {
  constructor(scope: App, id: string, props: MigrationsStackProps) {
    super(scope, id, props);

    const { envSettings } = props;
    const resources = new FargateServiceResources(
      this,
      "MigrationsResources",
      props
    );

    const containerName = "migrations";
    const dbSecretArn = Fn.importValue(
      MainDatabase.getDatabaseSecretArnOutputExportName(envSettings)
    );
    const taskRole = this.createTaskRole(props);

    const migrationsTaskDefinition = new FargateTaskDefinition(
      this,
      "MigrationsTaskDefinition",
      {
        taskRole,
        cpu: 256,
        memoryLimitMiB: 512,
      }
    );

    const containerDef = migrationsTaskDefinition.addContainer(containerName, {
      image: ContainerImage.fromEcrRepository(
        resources.backendRepository,
        envSettings.version
      ),
      logging: this.createAWSLogDriver(this.node.id),
      environment: {
        CHAMBER_SERVICE_NAME: this.getChamberServiceName(envSettings),
        CHAMBER_KMS_KEY_ALIAS: MainKmsKey.getKeyAlias(envSettings),
        DB_PROXY_ENDPOINT: Fn.importValue(
          MainDatabase.getDatabaseProxyEndpointOutputExportName(props.envSettings)
        ),
      },
      secrets: {
        DB_CONNECTION: EcsSecret.fromSecretsManager(
          Secret.fromSecretCompleteArn(this, "DbSecret", dbSecretArn)
        ),
      },
    });

    new StateMachine(this, "MigrationsStateMachine", {
      stateMachineName: `${envSettings.projectEnvName}-migrations`,
      definition: new EcsRunTask(this, "MigrationsFargateTask", {
          cluster: resources.mainCluster,
          launchTarget: new EcsFargateLaunchTarget(),
          taskDefinition: migrationsTaskDefinition,
          assignPublicIp: false,
          securityGroups: [resources.fargateContainerSecurityGroup],
          containerOverrides: [
            {
              containerDefinition: containerDef,
              command: ["./scripts/run_migrations.sh"],
            },
          ],
          integrationPattern: IntegrationPattern.RUN_JOB,
      }),
      timeout: Duration.minutes(5),
    });
  }

  protected createAWSLogDriver(prefix: string): AwsLogDriver {
    return new AwsLogDriver({ streamPrefix: prefix });
  }

  protected createTaskRole(props: MigrationsStackProps): Role {
    const stack = Stack.of(this);
    const chamberServiceName = this.getChamberServiceName(props.envSettings);

    const taskRole = new Role(this, "MigrationsTaskRole", {
      assumedBy: new ServicePrincipal("ecs-tasks"),
    });

    taskRole.addToPolicy(
      new PolicyStatement({
        actions: ["kms:Get*", "kms:Describe*", "kms:List*", "kms:Decrypt"],
        resources: [
          Fn.importValue(
            MainKmsKey.getMainKmsOutputExportName(props.envSettings)
          ),
        ],
      })
    );

    taskRole.addToPolicy(
      new PolicyStatement({
        actions: ["ssm:DescribeParameters"],
        resources: ["*"],
      })
    );

    taskRole.addToPolicy(
      new PolicyStatement({
        actions: ["ssm:GetParameters*"],
        resources: [
          `arn:aws:ssm:${stack.region}:${stack.account}:parameter/${chamberServiceName}/*`,
        ],
      })
    );

    return taskRole;
  }

  protected getChamberServiceName(envSettings: EnvironmentSettings) {
    return `env-${envSettings.projectEnvName}-backend`;
  }
}
