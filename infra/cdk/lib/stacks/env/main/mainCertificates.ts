import {CfnOutput, Construct} from "@aws-cdk/core";
import {DnsValidatedCertificate} from '@aws-cdk/aws-certificatemanager';
import {PublicHostedZone} from "@aws-cdk/aws-route53";

import {EnvConstructProps} from "../../../types";
import {EnvironmentSettings} from "../../../settings";


export interface MainCertificateProps extends EnvConstructProps {
}

export class MainCertificates extends Construct {
    certificate: DnsValidatedCertificate;
    cloudFrontCertificate: DnsValidatedCertificate;

    static geCertificateArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-certificateArn`
    }

    static geCloudFrontCertificateArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-cfCertificateArn`
    }

    constructor(scope: Construct, id: string, props: MainCertificateProps) {
        super(scope, id);

        const hostedZone = PublicHostedZone.fromHostedZoneAttributes(this, "DomainZone", {
            hostedZoneId: props.envSettings.hostedZone.id,
            zoneName: props.envSettings.hostedZone.name,
        });

        const domainName = `${props.envSettings.envStage}.${props.envSettings.hostedZone.name}`
        this.certificate = new DnsValidatedCertificate(this, "AppsCertificate", {
            domainName,
            subjectAlternativeNames: [`*.${domainName}`],
            hostedZone,
        });

        this.cloudFrontCertificate = new DnsValidatedCertificate(this, "CloudFrontCertificate", {
            region: 'us-east-1',
            domainName,
            subjectAlternativeNames: [`*.${domainName}`],
            hostedZone,
        });

        new CfnOutput(this, "AppCertificateArnOutput", {
            value: this.certificate.certificateArn,
            exportName: MainCertificates.geCertificateArnOutputExportName(props.envSettings),
        });

        new CfnOutput(this, "CloudFrontCertificateArnOutput", {
            value: this.cloudFrontCertificate.certificateArn,
            exportName: MainCertificates.geCloudFrontCertificateArnOutputExportName(props.envSettings),
        });
    }
}
