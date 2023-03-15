import { Construct } from 'constructs';
import { CfnOutput } from 'aws-cdk-lib';
import * as certManager from 'aws-cdk-lib/aws-certificatemanager';

import {
  EnvConstructProps,
  EnvironmentSettings,
  getCloudFrontCertificateArnOutputExportName,
  getHostedZone,
} from '@sb/infra-core';

export class MainCertificates extends Construct {
  certificate?: certManager.Certificate;
  cloudFrontCertificate?: certManager.DnsValidatedCertificate;

  static geCertificateArnOutputExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-certificateArn`;
  }

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    const hostedZone = getHostedZone(this, props.envSettings);
    const domainName = this.getDomainName(props);

    if (hostedZone) {
      this.certificate = new certManager.Certificate(this, 'AppsCertificate', {
        domainName,
        subjectAlternativeNames: [`*.${domainName}`],
        validation: certManager.CertificateValidation.fromDns(hostedZone),
      });

      // todo: Use Certificate here when figure it our how to pass region prop to it (currently it's not available)
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
