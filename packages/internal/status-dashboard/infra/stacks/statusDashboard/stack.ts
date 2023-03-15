import * as fs from 'fs';
import * as path from 'path';
import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as certManager from 'aws-cdk-lib/aws-certificatemanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import {
  EnvConstructProps,
  getHostedZone,
} from '@sb/infra-core';
import {
  UsEastResourcesStack,
  WebAppCloudFrontDistribution,
} from '@sb/infra-shared';

export interface GlobalToolsStackProps extends StackProps, EnvConstructProps {}

export class StatusDashboardStack extends Stack {
  private versionMatrixCloudFrontDistribution?: WebAppCloudFrontDistribution;

  constructor(scope: App, id: string, props: GlobalToolsStackProps) {
    super(scope, id, props);

    const domainZone = getHostedZone(this, props.envSettings.tools);

    let certificateArn;
    if (domainZone) {
      const domainName = props.envSettings.tools.hostedZone.name;
      const certificate = new certManager.DnsValidatedCertificate(
        this,
        'ToolsCertificate',
        {
          region: 'us-east-1',
          domainName: domainName,
          subjectAlternativeNames: [`*.${domainName}`],
          hostedZone: domainZone,
        }
      );
      certificateArn = certificate.certificateArn;
    } else {
      certificateArn = props.envSettings.certificates.cloudfrontCertificateArn;
    }

    this.createVersionMatrixTool(props, domainZone, certificateArn);
  }

  private createVersionMatrixTool(
    props: GlobalToolsStackProps,
    domainZone: route53.IHostedZone | null,
    certificateArn: string
  ) {
    new s3.Bucket(this, 'VersionMatrixBucket', {
      bucketName: `${props.envSettings.projectName}-status-dashboard`,
      publicReadAccess: true,
      accessControl: s3.BucketAccessControl.PUBLIC_READ,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: [
            `https://${props.envSettings.tools.domains.versionMatrix}`,
          ],
        },
      ],
    });

    const filesPath = path.join(__dirname, '../../../build');
    if (
      fs.existsSync(filesPath) &&
      props.envSettings.tools.domains.versionMatrix
    ) {
      this.versionMatrixCloudFrontDistribution =
        new WebAppCloudFrontDistribution(this, 'WebApp', {
          sources: [s3Deployment.Source.asset(filesPath)],
          domainZone,
          domainName: props.envSettings.tools.domains.versionMatrix,
          certificateArn,
          authLambdaSSMParameterName:
            UsEastResourcesStack.getAuthLambdaVersionArnSSMParameterName(
              props.envSettings
            ),
          basicAuth: props.envSettings.tools.basicAuth,
        });
    }
  }
}
