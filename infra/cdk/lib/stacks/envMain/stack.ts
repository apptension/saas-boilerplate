import * as core from '@aws-cdk/core';

import {EnvironmentSettings} from '../../settings';
import {EnvMainResources} from './resources';
import {MainVpcConfig} from './modules/mainVpc';

export class EnvMainStack extends core.Stack {
    constructor(scope: core.App, id: string, envSettings: EnvironmentSettings, props?: core.StackProps) {
        super(scope, id, props);

        const resources = new EnvMainResources(this, envSettings);

        new MainVpcConfig(this, envSettings, resources);
    }
}
