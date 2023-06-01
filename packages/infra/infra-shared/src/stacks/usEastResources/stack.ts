import * as path from 'path';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import {
  EnvConstructProps,
  EnvironmentSettings,
} from '@sb/infra-core';

export interface UsEastResourcesStackProps
  extends StackProps,
    EnvConstructProps {}

/**
 * Some resources need to be created in us-east-1 because of their limitations
 */
export class UsEastResourcesStack extends Stack {
  static getAuthLambdaVersionArnSSMParameterName(
    envSettings: EnvironmentSettings
  ) {
    return `param-${envSettings.projectName}-auth-lambda-version-arn`;
  }

  constructor(scope: App, id: string, props: UsEastResourcesStackProps) {
    super(scope, id, props);

    this.createAuthLambdaFunction(props);
  }

  private createAuthLambdaFunction(props: UsEastResourcesStackProps) {
    const executionRole = new iam.Role(this, 'AuthFunctionExecutionRole', {
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('edgelambda.amazonaws.com')
      ),
    });
    executionRole.addManagedPolicy(
      iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        'AuthLambdaBasicManagedPolicy',
        'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
      )
    );

    const authFunction = new lambda.Function(this, 'AuthFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'authLambda')),
      handler: 'index.handler',
      role: executionRole,
    });

    new StringParameter(this, 'AuthLambdaVersionArn', {
      parameterName:
        UsEastResourcesStack.getAuthLambdaVersionArnSSMParameterName(
          props.envSettings
        ),
      stringValue: authFunction.currentVersion.functionArn,
    });
  }
}
