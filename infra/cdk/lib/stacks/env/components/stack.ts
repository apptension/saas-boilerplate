import * as core from '@aws-cdk/core';
import {CfnOutput, StackProps} from '@aws-cdk/core';
import {EnvConstructProps} from "../../../types";
import {EventBus} from "@aws-cdk/aws-events";
import {EnvironmentSettings} from "../../../settings";
import {WebSocketApi, WebSocketStage} from "@aws-cdk/aws-apigatewayv2";

export interface EnvComponentsStackProps extends StackProps, EnvConstructProps {

}

export class EnvComponentsStack extends core.Stack {
    static getWorkersEventBusName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-workers`
    }

    static getWebSocketApiName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-websocket-api`
    }

    static getWebSocketApiIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-webSocketApiId`
    }

    static getWebSocketApiEndpointOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-webSocketApiEndpoint`
    }

    constructor(scope: core.App, id: string, props: EnvComponentsStackProps) {
        super(scope, id, props);

        new EventBus(this, "EmailEventBus", {
            eventBusName: EnvComponentsStack.getWorkersEventBusName(props.envSettings),
        });

        const webSocketApi = new WebSocketApi(this, "WebSocketApi", {
           apiName: EnvComponentsStack.getWebSocketApiName(props.envSettings),
        });

        new WebSocketStage(this, "WebSocketStage", {
           stageName: "ws",
           webSocketApi: webSocketApi,
           autoDeploy: true,
        });

        new CfnOutput(this, "WebSocketApiId", {
            exportName: EnvComponentsStack.getWebSocketApiIdOutputExportName(props.envSettings),
            value: webSocketApi.apiId,
        });

        new CfnOutput(this, "WebSocketApiEndpoint", {
            exportName: EnvComponentsStack.getWebSocketApiEndpointOutputExportName(props.envSettings),
            value: webSocketApi.apiEndpoint,
        });
    }
}
