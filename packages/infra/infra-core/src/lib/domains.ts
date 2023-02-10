import { Construct } from 'constructs';
import { Fn } from 'aws-cdk-lib';
import * as route53 from 'aws-cdk-lib/aws-route53';

import { EnvironmentSettings, ToolsConfig } from './env-config';

export function getHostedZone(
  scope: Construct,
  settings: EnvironmentSettings | ToolsConfig
) {
  return settings.hostedZone.id
    ? route53.PublicHostedZone.fromHostedZoneAttributes(scope, 'DomainZone', {
        hostedZoneId: settings.hostedZone.id,
        zoneName: settings.hostedZone.name,
      })
    : null;
}

export function getCloudFrontCertificateArnOutputExportName(
  envSettings: EnvironmentSettings
) {
  return `${envSettings.projectEnvName}-cfCertificateArn`;
}

export function getCloudfrontCertificateArn(envSettings: EnvironmentSettings) {
  return envSettings.hostedZone.id
    ? Fn.importValue(getCloudFrontCertificateArnOutputExportName(envSettings))
    : envSettings.certificates.cloudfrontCertificateArn;
}
