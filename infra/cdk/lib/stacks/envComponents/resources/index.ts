import * as core from '@aws-cdk/core';

import {EnvironmentSettings} from "../../../settings";
import {EnvComponentsECR} from './ecr';

export class EnvComponentsResources {
    ecr: EnvComponentsECR;

    constructor(scope: core.Construct, envSettings: EnvironmentSettings) {
        this.ecr = new EnvComponentsECR(scope, envSettings)
    }
}