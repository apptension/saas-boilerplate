import * as core from '@aws-cdk/core';
import {Fn, Stack} from '@aws-cdk/core';

import {EnvConstructProps} from "../../../types";
import {WebAppCloudFrontDistribution} from "../../../patterns/webAppCloudFrontDistribution";
import {IVpc, Vpc} from "@aws-cdk/aws-ec2";
import {MainECSCluster} from "../../env/main/mainEcsCluster";
import {ApplicationLoadBalancer} from "@aws-cdk/aws-elasticloadbalancingv2";
import {MainVpc} from "../../env/main/mainVpc";
import {PublicHostedZone} from "@aws-cdk/aws-route53";


export interface WebAppStackProps extends core.StackProps, EnvConstructProps {
}

export class WebAppStack extends core.Stack {
    webAppCloudFrontDistribution: WebAppCloudFrontDistribution;

    constructor(scope: core.App, id: string, props: WebAppStackProps) {
        super(scope, id, props);

        const {envSettings} = props;

        const domainZone = PublicHostedZone.fromHostedZoneAttributes(this, "DomainZone", {
            hostedZoneId: envSettings.hostedZone.id,
            zoneName: envSettings.hostedZone.name,
        });

        this.webAppCloudFrontDistribution = new WebAppCloudFrontDistribution(this, "WebApp", {
            domainZone,
            domainName: props.envSettings.domains.webApp,
            apiDomainName: props.envSettings.domains.api,
            certificateArn: props.envSettings.cloudFrontCertificateArn,
        });
    }

}
