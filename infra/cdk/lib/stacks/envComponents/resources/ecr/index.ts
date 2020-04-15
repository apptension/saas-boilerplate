import * as core from '@aws-cdk/core';
import {Repository} from '@aws-cdk/aws-ecr';
import {EnvironmentSettings} from "../../../../settings";

export class EnvComponentsECR {
    nginxRepository: Repository;
    backendRepository: Repository;

    constructor(scope: core.Construct, envSettings: EnvironmentSettings) {
        this.nginxRepository = new Repository(scope, "ECRNginxRepository", {
            repositoryName: `${envSettings.projectName}-nginx`
        })

        this.backendRepository = new Repository(scope, "ECRBackendRepository", {
            repositoryName: `${envSettings.projectName}-backend`
        })
    }
}
