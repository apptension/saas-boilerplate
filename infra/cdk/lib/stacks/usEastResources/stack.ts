import * as path from "path";
import {App, Stack, StackProps} from 'aws-cdk-lib';
import {StringParameter} from 'aws-cdk-lib/aws-ssm';
import {EnvConstructProps} from "../../types";
import * as lambda from "aws-cdk-lib/aws-lambda";

import {EnvironmentSettings} from "../../settings";
import {CompositePrincipal, ManagedPolicy, Role, ServicePrincipal} from "aws-cdk-lib/aws-iam";


export interface UsEastResourcesStackProps extends StackProps, EnvConstructProps {
}

/**
 * Some resources need to be created in us-east-1 because of their limitations
 */
export class UsEastResourcesStack extends Stack {
    static getAuthLambdaVersionArnSSMParameterName(envSettings: EnvironmentSettings) {
        return `param-${envSettings.projectName}-auth-lambda-version-arn`
    }

    constructor(scope: App, id: string, props: UsEastResourcesStackProps) {
        super(scope, id, props);

        this.createAuthLambdaFunction(props);
    }


    private createAuthLambdaFunction(props: UsEastResourcesStackProps) {
        const executionRole = new Role(this, "AuthFunctionExecutionRole", {
            assumedBy: new CompositePrincipal(
                new ServicePrincipal('lambda.amazonaws.com'),
                new ServicePrincipal('edgelambda.amazonaws.com'),
            ),
        });
        executionRole.addManagedPolicy(ManagedPolicy.fromManagedPolicyArn(this, 'AuthLambdaBasicManagedPolicy',
            'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'));

        const authFunction = new lambda.Function(this, "AuthFunction", {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset(path.join(__dirname, 'authLambda')),
            handler: 'index.handler',
            role: executionRole,
        });

        new StringParameter(this, "AuthLambdaVersionArn", {
            parameterName: UsEastResourcesStack.getAuthLambdaVersionArnSSMParameterName(props.envSettings),
            stringValue: authFunction.currentVersion.functionArn,
        });
    }
}
