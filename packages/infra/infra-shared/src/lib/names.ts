import { EnvironmentSettings } from '@sb/infra-core';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export const getInfraFunctionArnByName = (
  scope: Construct,
  functionName: string,
  { envSettings }: { envSettings: EnvironmentSettings }
) => {
  const stack = Stack.of(scope);
  return [
    'arn:aws:lambda',
    stack.region,
    stack.account,
    'function',
    `${envSettings.projectName}-infra-functions-${envSettings.envStage}-${functionName}`,
  ].join(':');
};
