import {Repository} from '@aws-cdk/aws-ecr';
import {Construct} from "@aws-cdk/core";

import {EnvironmentSettings} from "../../../../settings";
import {EnvConstructProps} from "../../../../types";

export class GlobalECR extends Construct {
    nginxRepository: Repository;
    backendRepository: Repository;

    static getNginxRepositoryName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectName}-nginx`;
    }

    static getBackendRepositoryName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectName}-backend`;
    }

    constructor(scope: Construct, id: string, props: EnvConstructProps) {
        super(scope, id);

        this.nginxRepository = new Repository(this, "ECRNginxRepository", {
            repositoryName: GlobalECR.getNginxRepositoryName(props.envSettings),
        });

        this.backendRepository = new Repository(this, "ECRBackendRepository", {
            repositoryName: GlobalECR.getBackendRepositoryName(props.envSettings),
        });
    }
}
