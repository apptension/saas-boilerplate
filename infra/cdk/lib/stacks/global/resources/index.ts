import * as core from '@aws-cdk/core';

import {EnvironmentSettings} from "../../../settings";
import {GlobalECR} from './ecr';

export class GlobalResources {
    ecr: GlobalECR;

    constructor(scope: core.Construct, envSettings: EnvironmentSettings) {
        this.ecr = new GlobalECR(scope, envSettings)
    }
}