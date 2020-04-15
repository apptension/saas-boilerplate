import {Construct} from "@aws-cdk/core";
import {Cluster} from '@aws-cdk/aws-ecs';

import {EnvironmentSettings} from "../../../../settings";
import {EnvMainResources} from "../../resources";

export class MainECSCluster {
    constructor(scope: Construct, envSettings: EnvironmentSettings, resources: EnvMainResources) {
        const cluster = new Cluster(scope, "ECSMainCluster", {
            clusterName: `${envSettings.projectEnvName}-main`,
            vpc: resources.ec2.mainVpc,
        })
    }
}
