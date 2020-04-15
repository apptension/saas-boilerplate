import * as core from '@aws-cdk/core';

import {EnvironmentSettings} from "../../../settings";
import {EnvMainEC2} from "./ec2";

export class EnvMainResources {
    ec2: EnvMainEC2;

    constructor(scope: core.Construct, envSettings: EnvironmentSettings) {
        this.ec2 = new EnvMainEC2(scope, envSettings);
    }
}
