import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import * as certManager from 'aws-cdk-lib/aws-certificatemanager';

import {
  EnvConstructProps,
  EnvironmentSettings,
  getCloudFrontCertificateArnOutputExportName,
  getHostedZone,
} from '@saas-boilerplate-app/infra-core';

export class MainCertificates extends Construct {
  certificate?: certManager.DnsValidatedCertificate;
  cloudFrontCertificate?: certManager.DnsValidatedCertificate;

  static geCertificateArnOutputExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-certificateArn`;
  }

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    const hostedZone = getHostedZone(this, props.envSettings);
    const domainName = this.getDomainName(props);

    if (hostedZone) {
      this.certificate = new certManager.DnsValidatedCertificate(
        this,
        'AppsCertificate',
        {
          domainName,
          subjectAlternativeNames: [`*.${domainName}`],
          hostedZone,
        }
      );

      this.cloudFrontCertificate = new certManager.DnsValidatedCertificate(
        this,
        'CloudFrontCertificate',
        {
          region: 'us-east-1',
          domainName,
          subjectAlternativeNames: [`*.${domainName}`],
          hostedZone,
        }
      );

      new CfnOutput(this, 'AppCertificateArnOutput', {
        value: this.certificate.certificateArn,
        exportName: MainCertificates.geCertificateArnOutputExportName(
          props.envSettings
        ),
      });

      new CfnOutput(this, 'CloudFrontCertificateArnOutput', {
        value: this.cloudFrontCertificate.certificateArn,
        exportName: getCloudFrontCertificateArnOutputExportName(
          props.envSettings
        ),
      });
    }
  }

  private getDomainName(props: EnvConstructProps) {
    const domainName = props.envSettings.certificates.domain;
    if (!domainName) {
      return `${props.envSettings.envStage}.${props.envSettings.hostedZone.name}`;
    }
    return domainName;
  }
}
