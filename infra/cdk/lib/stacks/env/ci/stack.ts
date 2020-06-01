import * as core from '@aws-cdk/core';
import {StackProps} from '@aws-cdk/core';

import {EnvConstructProps} from "../../../types";

export interface EnvCiStackProps extends StackProps, EnvConstructProps {

}

export class EnvCiStack extends core.Stack {
    constructor(scope: core.App, id: string, props: EnvCiStackProps) {
        super(scope, id, props);

    }
}
