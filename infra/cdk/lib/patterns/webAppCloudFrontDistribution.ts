import {Construct, Duration} from "@aws-cdk/core";
import {Bucket} from '@aws-cdk/aws-s3';
import {
    CloudFrontAllowedMethods,
    CloudFrontWebDistribution,
    OriginProtocolPolicy,
    SourceConfiguration
} from '@aws-cdk/aws-cloudfront';
import {ARecord, IHostedZone, RecordTarget} from "@aws-cdk/aws-route53";
import {CloudFrontTarget} from "@aws-cdk/aws-route53-targets";

export interface WebAppCloudFrontDistributionProps {
    domainZone: IHostedZone;
    domainName: string;
    apiDomainName: string;
    certificateArn: string;
}

export class WebAppCloudFrontDistribution extends Construct {
    private distribution: CloudFrontWebDistribution;

    constructor(scope: Construct, id: string, props: WebAppCloudFrontDistributionProps) {
        super(scope, id);

        const staticFilesBucket = this.createStaticFilesBucket();

        this.distribution = this.createCloudFrontWebDistribution(staticFilesBucket, props);
        this.createDnsRecord(this.distribution, props);
    }

    protected createStaticFilesBucket() {
        return new Bucket(this, "StaticFilesBucket", {
            versioned: true,
            publicReadAccess: true,
            websiteIndexDocument: 'index.html',
        });
    }

    private createCloudFrontWebDistribution(staticFilesBucket: Bucket, props: WebAppCloudFrontDistributionProps) {
        const indexFile = '/index.html';

        return new CloudFrontWebDistribution(this, "CloudFrontWebDistribution", {
            defaultRootObject: indexFile,
            errorConfigurations: [{errorCode: 404, responseCode: 200, responsePagePath: indexFile}],
            originConfigs: [
                this.createStaticFilesSourceConfig(staticFilesBucket),
                this.createApiProxySourceConfig(props),
            ],
            viewerCertificate: {
                aliases: [props.domainName],
                props: {
                    acmCertificateArn: props.certificateArn,
                    sslSupportMethod: 'sni-only',
                },
            },
        });
    }

    private createStaticFilesSourceConfig(staticFilesBucket: Bucket): SourceConfiguration {
        return {
            behaviors: [{isDefaultBehavior: true}],
            originPath: '',
            customOriginSource: {
                domainName: staticFilesBucket.bucketWebsiteDomainName,
                originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
            },
        };
    }

    private createApiProxySourceConfig(props: WebAppCloudFrontDistributionProps): SourceConfiguration {
        return {
            behaviors: [{
                pathPattern: '/api/*',
                allowedMethods: CloudFrontAllowedMethods.ALL,
                forwardedValues: {
                    queryString: true,
                    headers: ["Host"],
                    cookies: {forward: 'all'},
                },
                defaultTtl: Duration.seconds(0),
                minTtl: Duration.seconds(0),
                maxTtl: Duration.seconds(0),
            }],
            customOriginSource: {
                domainName: props.apiDomainName,
                originProtocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
            },
        };
    }

    private createDnsRecord(distribution: CloudFrontWebDistribution, props: WebAppCloudFrontDistributionProps) {
        return new ARecord(this, `DNSRecord`, {
            zone: props.domainZone,
            recordName: props.domainName,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        });
    }
}
