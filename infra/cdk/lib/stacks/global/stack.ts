import * as core from '@aws-cdk/core';
import {GlobalResources} from './resources';
import {EnvironmentSettings} from '../../settings';

export class GlobalStack extends core.Stack {
    constructor(scope: core.App, id: string, envSettings: EnvironmentSettings, props?: core.StackProps) {
        super(scope, id, props);

        const resources = new GlobalResources(this, envSettings);

    }
}
