import * as fs from 'fs';
import {App, Stack, StackProps} from 'aws-cdk-lib';
import {Source} from "aws-cdk-lib/aws-s3-deployment";

import {EnvConstructProps} from "../../../types";
import {WebAppCloudFrontDistribution} from "../../../patterns/webAppCloudFrontDistribution";
import {UsEastResourcesStack} from "../../usEastResources";
import {getCloudfrontCertificateArn, getHostedZone} from "../../../helpers/domains";


export interface WebAppStackProps extends StackProps, EnvConstructProps {
}

export class WebAppStack extends Stack {
    webAppCloudFrontDistribution: WebAppCloudFrontDistribution;

    constructor(scope: App, id: string, props: WebAppStackProps) {
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
