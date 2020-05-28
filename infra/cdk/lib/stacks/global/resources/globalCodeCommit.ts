import {Construct} from "@aws-cdk/core";
import {Repository} from "@aws-cdk/aws-codecommit";
import {User} from "@aws-cdk/aws-iam";

import {EnvironmentSettings} from "../../../settings";
import {EnvConstructProps} from "../../../types";


export class GlobalCodeCommit extends Construct {

    static getCodeRepositoryName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectName}-code`;
    }

    constructor(scope: Construct, id: string, props: EnvConstructProps) {
        super(scope, id);

        const repo = new Repository(this, 'CodeRepo', {
            repositoryName: GlobalCodeCommit.getCodeRepositoryName(props.envSettings),
            description: `${props.envSettings.projectName} code mirror repository used to source CodePipeline`
        });

        const user = new User(this, 'CodeRepoUser', {
            userName: `${props.envSettings.projectName}-code`
        });
        repo.grantPullPush(user);
    }
}
