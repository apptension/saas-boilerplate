import * as core from '@aws-cdk/core';

import {EnvConstructProps} from "../../types";
import {GlobalResources} from './resources';
import {GlobalCi} from './ci';

export interface GlobalStackProps extends core.StackProps, EnvConstructProps {
}

export class GlobalStack extends core.Stack {
    resources: GlobalResources;
    ci: GlobalCi;

    constructor(scope: core.App, id: string, props: GlobalStackProps) {
        super(scope, id, props);

        this.resources = new GlobalResources(this, "GlobalResources", {envSettings: props.envSettings});
        this.ci = new GlobalCi(this, 'GlobalCi', {
            envSettings: props.envSettings,
            resources: this.resources,
        });
    }
}
