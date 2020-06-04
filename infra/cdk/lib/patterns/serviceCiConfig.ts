import {Construct} from "@aws-cdk/core";
import {BuildEnvironmentVariable} from "@aws-cdk/aws-codebuild/lib/project";

import {EnvConstructProps} from "../types";
import {BuildEnvironmentVariableType} from "@aws-cdk/aws-codebuild";

export interface IServiceCiConfig {
    defaultEnvVariables: {
        [name: string]: BuildEnvironmentVariable;
    };
}


export class ServiceCiConfig extends Construct implements IServiceCiConfig {
    defaultEnvVariables: { [p: string]: BuildEnvironmentVariable };

    constructor(scope: Construct, id: string, props: EnvConstructProps) {
        super(scope, id);

        this.defaultEnvVariables = {
            CI: {type: BuildEnvironmentVariableType.PLAINTEXT, value: 'true'},
            PROJECT_NAME: {type: BuildEnvironmentVariableType.PLAINTEXT, value: props.envSettings.projectName},
            ENV_STAGE: {type: BuildEnvironmentVariableType.PLAINTEXT, value: props.envSettings.envStage},
        };
    }
}



