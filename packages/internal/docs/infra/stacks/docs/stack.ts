import * as fs from 'fs';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import {
  EnvConstructProps,
  getHostedZone,
  getCloudfrontCertificateArn,
} from '@sb/infra-core';
import {
  UsEastResourcesStack,
  WebAppCloudFrontDistribution,
} from '@sb/infra-shared';

export interface DocsStackProps extends StackProps, EnvConstructProps {}

export class DocsStack extends Stack {
  webAppCloudFrontDistribution?: WebAppCloudFrontDistribution;

  constructor(scope: App, id: string, props: DocsStackProps) {
    super(scope, id, props);

    const domainZone = getHostedZone(this, props.envSettings);
    const certificateArn = getCloudfrontCertificateArn(props.envSettings);

    const filesPath = `${__dirname}/../../../build`;
    if (fs.existsSync(filesPath)) {
      this.webAppCloudFrontDistribution = new WebAppCloudFrontDistribution(
        this,
        'DocsWebApp',
        {
          sources: [s3Deployment.Source.asset(filesPath)],
          domainZone,
          domainName: props.envSettings.domains.docs,
          certificateArn,
          authLambdaSSMParameterName:
            UsEastResourcesStack.getAuthLambdaVersionArnSSMParameterName(
              props.envSettings
            ),
          distributionPaths: ['/*'],
          basicAuth: props.envSettings.appBasicAuth,
        }
      );
    }
  }
}
