import * as core from '@aws-cdk/core';

import {EnvConstructProps} from "../../types";
import {GlobalResources} from './resources';


export interface GlobalStackProps extends core.StackProps, EnvConstructProps {
}

export class GlobalStack extends core.Stack {
    resources: GlobalResources;

    constructor(scope: core.App, id: string, props: GlobalStackProps) {
        super(scope, id, props);

        this.resources = new GlobalResources(this, "GlobalResources", {envSettings: props.envSettings});
    }
}
