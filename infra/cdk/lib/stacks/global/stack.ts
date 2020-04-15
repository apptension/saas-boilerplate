import * as core from '@aws-cdk/core';

export class GlobalStack extends core.Stack {
    constructor(scope: core.App, id: string, props?: core.StackProps) {
        super(scope, id, props);

    }
}