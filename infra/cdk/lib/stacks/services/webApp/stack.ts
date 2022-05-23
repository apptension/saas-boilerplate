import * as fs from 'fs';
import * as core from '@aws-cdk/core';
import {Source} from "@aws-cdk/aws-s3-deployment";

import {EnvConstructProps} from "../../../types";
import {WebAppCloudFrontDistribution} from "../../../patterns/webAppCloudFrontDistribution";
import {UsEastResourcesStack} from "../../usEastResources";
import {getCloudfrontCertificateArn, getHostedZone} from "../../../helpers/domains";


export interface WebAppStackProps extends core.StackProps, EnvConstructProps {
}

export class WebAppStack extends core.Stack {
    webAppCloudFrontDistribution: WebAppCloudFrontDistribution;

    constructor(scope: core.App, id: string, props: WebAppStackProps) {
        super(scope, id, props);

        const domainZone = getHostedZone(this, props.envSettings);
        const certificateArn = getCloudfrontCertificateArn(props.envSettings);


        const filesPath = `${props.envSettings.projectRootDir}/services/webapp/build`;
        if (fs.existsSync(filesPath)) {
            this.webAppCloudFrontDistribution = new WebAppCloudFrontDistribution(this, "WebApp", {
                sources: [Source.asset(filesPath)],
                domainZone,
                domainName: props.envSettings.domains.webApp,
                apiDomainName: props.envSettings.domains.api,
                certificateArn,
                authLambdaSSMParameterName: UsEastResourcesStack.getAuthLambdaVersionArnSSMParameterName(props.envSettings),
                basicAuth: props.envSettings.appBasicAuth,
                envSettings: props.envSettings,
            });
        }
    }
}
