import * as fs from 'fs';
import * as core from '@aws-cdk/core';
import {Fn} from '@aws-cdk/core';
import {PublicHostedZone} from "@aws-cdk/aws-route53";
import {Source} from "@aws-cdk/aws-s3-deployment";

import {EnvConstructProps} from "../../../types";
import {WebAppCloudFrontDistribution} from "../../../patterns/webAppCloudFrontDistribution";
import {MainCertificates} from "../../env/main/mainCertificates";
import {UsEastResourcesStack} from "../../usEastResources";


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

        const filesPath = `${props.envSettings.projectRootDir}/services/webapp/build`;
        if (fs.existsSync(filesPath)) {
            this.webAppCloudFrontDistribution = new WebAppCloudFrontDistribution(this, "WebApp", {
                sources: [Source.asset(filesPath)],
                domainZone,
                domainName: props.envSettings.domains.webApp,
                apiDomainName: props.envSettings.domains.api,
                certificateArn: Fn.importValue(
                    MainCertificates.geCloudFrontCertificateArnOutputExportName(props.envSettings)),
                authLambdaSSMParameterName: UsEastResourcesStack.getAuthLambdaVersionArnSSMParameterName(props.envSettings),
                basicAuth: props.envSettings.appBasicAuth,
            });
        }
    }
}
