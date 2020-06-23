import * as core from '@aws-cdk/core';
import {StackProps} from '@aws-cdk/core';
import {EnvConstructProps} from "../../../types";
import {EventBus} from "@aws-cdk/aws-events";
import {EnvironmentSettings} from "../../../settings";

export interface EnvComponentsStackProps extends StackProps, EnvConstructProps {

}

export class EnvComponentsStack extends core.Stack {
    static getWorkersEventBusName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-workers`
    }

    constructor(scope: core.App, id: string, props: EnvComponentsStackProps) {
        super(scope, id, props);

        new EventBus(this, "EmailEventBus", {
            eventBusName: EnvComponentsStack.getWorkersEventBusName(props.envSettings),
        });
    }
}
