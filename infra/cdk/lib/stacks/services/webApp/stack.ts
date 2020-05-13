import * as core from '@aws-cdk/core';

import {EnvConstructProps} from "../../../types";
import {WebAppCloudFrontDistribution} from "../../../patterns/webAppCloudFrontDistribution";


export interface WebAppStackProps extends core.StackProps, EnvConstructProps {
}

export class WebAppStack extends core.Stack {
    webAppCloudFrontDistribution: WebAppCloudFrontDistribution;

    constructor(scope: core.App, id: string, props: WebAppStackProps) {
        super(scope, id, props);

        const {envSettings} = props;

        this.webAppCloudFrontDistribution = new WebAppCloudFrontDistribution(this, "WebApp", {envSettings});
    }
}
