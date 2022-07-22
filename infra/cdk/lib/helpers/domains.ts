import {EnvironmentSettings, ToolsConfig} from "../settings";
import {Fn} from "aws-cdk-lib";
import {MainCertificates} from "../stacks/env/main/mainCertificates";
import {PublicHostedZone} from "aws-cdk-lib/aws-route53";
import {Construct} from "constructs";

export function getHostedZone(scope: Construct, settings: EnvironmentSettings | ToolsConfig) {
    return settings.hostedZone.id ? PublicHostedZone.fromHostedZoneAttributes(scope, "DomainZone", {
        hostedZoneId: settings.hostedZone.id,
        zoneName: settings.hostedZone.name,
    }) : null;
}

export function getCloudfrontCertificateArn(envSettings: EnvironmentSettings) {
    return envSettings.hostedZone.id ? Fn.importValue(
        MainCertificates.getCloudFrontCertificateArnOutputExportName(envSettings)
    ) : envSettings.certificates.cloudfrontCertificateArn;
}
