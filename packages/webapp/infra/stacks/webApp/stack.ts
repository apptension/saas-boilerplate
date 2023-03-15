import * as fs from 'fs';

import { EnvConstructProps, getCloudfrontCertificateArn, getHostedZone } from '@sb/infra-core';
import { UsEastResourcesStack, WebAppCloudFrontDistribution } from '@sb/infra-shared';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';

export interface WebAppStackProps extends StackProps, EnvConstructProps {}

export class WebAppStack extends Stack {
  webAppCloudFrontDistribution?: WebAppCloudFrontDistribution;

  constructor(scope: App, id: string, props: WebAppStackProps) {
    super(scope, id, props);

    const domainZone = getHostedZone(this, props.envSettings);
    const certificateArn = getCloudfrontCertificateArn(props.envSettings);

    const filesPath = `${__dirname}/../../../build`;
    if (fs.existsSync(filesPath)) {
      this.webAppCloudFrontDistribution = new WebAppCloudFrontDistribution(this, 'WebApp', {
        sources: [s3Deployment.Source.asset(filesPath)],
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
