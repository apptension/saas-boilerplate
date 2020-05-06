import * as core from '@aws-cdk/core';
import {StackProps} from '@aws-cdk/core';
import {EnvComponentsResources} from './resources';
import {EnvConstructProps} from "../../../types";

export interface EnvComponentsStackProps extends StackProps, EnvConstructProps {

}

export class EnvComponentsStack extends core.Stack {
    constructor(scope: core.App, id: string, props: EnvComponentsStackProps) {
        super(scope, id, props);

        const {envSettings} = props;

        const resources = new EnvComponentsResources(this, envSettings);

    }
}
