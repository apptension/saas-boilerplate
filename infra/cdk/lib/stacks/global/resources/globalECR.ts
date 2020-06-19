import {Repository} from '@aws-cdk/aws-ecr';
import {Construct} from "@aws-cdk/core";

import {EnvironmentSettings} from "../../../settings";
import {EnvConstructProps} from "../../../types";

export class GlobalECR extends Construct {
    backendRepository: Repository;

    static getBackendRepositoryName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectName}-backend`;
    }

    constructor(scope: Construct, id: string, props: EnvConstructProps) {
        super(scope, id);

        this.backendRepository = new Repository(this, "ECRBackendRepository", {
            repositoryName: GlobalECR.getBackendRepositoryName(props.envSettings),
        });
    }
}
