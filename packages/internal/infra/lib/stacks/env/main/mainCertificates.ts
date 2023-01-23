import {Construct} from "constructs";
import {CfnOutput} from "aws-cdk-lib";
import {DnsValidatedCertificate} from 'aws-cdk-lib/aws-certificatemanager';

import {EnvConstructProps} from "../../../types";
import {EnvironmentSettings} from "../../../settings";
import {getHostedZone} from "../../../helpers/domains";


export interface MainCertificateProps extends EnvConstructProps {
}

export class MainCertificates extends Construct {
    certificate: DnsValidatedCertificate;
    cloudFrontCertificate: DnsValidatedCertificate;

    static geCertificateArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-certificateArn`
    }

    static getCloudFrontCertificateArnOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-cfCertificateArn`
    }

    constructor(scope: Construct, id: string, props: MainCertificateProps) {
        super(scope, id);

        const hostedZone = getHostedZone(this, props.envSettings)!;

        let domainName = props.envSettings.certificates.domain;

        if (!domainName) {
          domainName = `${props.envSettings.envStage}.${props.envSettings.hostedZone.name}`;
        }

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
            exportName: MainCertificates.getCloudFrontCertificateArnOutputExportName(props.envSettings),
        });
    }
}
