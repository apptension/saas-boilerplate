import { Construct } from 'constructs';
import { Fn, Stack } from 'aws-cdk-lib';
import { EnvironmentSettings } from '@sb/infra-core';
import * as iam from 'aws-cdk-lib/aws-iam';
import { getBackendChamberServiceName } from './names';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import { EnvComponentsStack, MainKmsKey } from '@sb/infra-shared';

export function createBackendTaskRole(
  scope: Construct,
  id: string,
  {
    envSettings,
  }: {
    envSettings: EnvironmentSettings;
  },
): iam.Role {
  const stack = Stack.of(scope);
  const chamberServiceName = getBackendChamberServiceName(envSettings);

  const taskRole = new iam.Role(scope, id, {
    assumedBy: new iam.ServicePrincipal('ecs-tasks'),
  });

  const fileUploadsBucket = s3.Bucket.fromBucketName(
    scope,
    'FileUploadsBucket',
    EnvComponentsStack.getFileUploadsBucketName(envSettings),
  );
  fileUploadsBucket.grantReadWrite(taskRole);
  fileUploadsBucket.grantPutAcl(taskRole);

  const exportsBucket = s3.Bucket.fromBucketName(
    scope,
    'ExportsBucket',
    EnvComponentsStack.getExportsBucketName(envSettings),
  );
  exportsBucket.grantReadWrite(taskRole);
  exportsBucket.grantPutAcl(taskRole);

  const eventBus = events.EventBus.fromEventBusName(
    scope,
    'WorkersEventBus',
    EnvComponentsStack.getWorkersEventBusName(envSettings),
  );
  eventBus.grantPutEventsTo(taskRole);

  taskRole.addToPolicy(
    new iam.PolicyStatement({
      actions: [
        'cloudformation:DescribeStacks',
        'apigateway:*',
        'execute-api:*',
        'xray:*',
      ],
      resources: ['*'],
    }),
  );

  taskRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ['kms:Get*', 'kms:Describe*', 'kms:List*', 'kms:Decrypt'],
      resources: [
        Fn.importValue(MainKmsKey.getMainKmsOutputExportName(envSettings)),
      ],
    }),
  );

  taskRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ['ssm:DescribeParameters'],
      resources: ['*'],
    }),
  );

  taskRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ['ssm:GetParameters*'],
      resources: [
        `arn:aws:ssm:${stack.region}:${stack.account}:parameter/${chamberServiceName}/*`,
      ],
    }),
  );

  taskRole.addToPolicy(
    new iam.PolicyStatement({
      actions: [
        'ssmmessages:CreateControlChannel',
        'ssmmessages:CreateDataChannel',
        'ssmmessages:OpenControlChannel',
        'ssmmessages:OpenDataChannel',
      ],
      resources: ['*'],
    }),
  );

  taskRole.addToPolicy(
    new iam.PolicyStatement({
      actions: [
        'ses:SendEmail',
        'ses:SendRawEmail',
        'ses:GetAccount',
        'ses:GetSendQuota',
      ],
      resources: ['*'],
    }),
  );

  return taskRole;
}
