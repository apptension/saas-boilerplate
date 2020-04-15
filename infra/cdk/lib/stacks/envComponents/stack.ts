import * as core from '@aws-cdk/core';
import {EnvComponentsResources} from './resources';
import {EnvironmentSettings} from '../../settings';

export class EnvComponentsStack extends core.Stack {
    constructor(scope: core.App, id: string, envSettings: EnvironmentSettings, props?: core.StackProps) {
        super(scope, id, props);

        const resources = new EnvComponentsResources(this, envSettings);

    }
}
