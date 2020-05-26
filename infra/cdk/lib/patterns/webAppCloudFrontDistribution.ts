import {Construct, Duration} from "@aws-cdk/core";
import {Bucket} from '@aws-cdk/aws-s3';
import {
    CloudFrontAllowedMethods,
    CloudFrontWebDistribution,
    OriginProtocolPolicy,
    SourceConfiguration
} from '@aws-cdk/aws-cloudfront';

export interface WebAppCloudFrontDistributionProps {
    domainName: string;
    apiDomainName: string;
    certificateArn: string;
}

export class WebAppCloudFrontDistribution extends Construct {
    constructor(scope: Construct, id: string, props: WebAppCloudFrontDistributionProps) {
        super(scope, id);

        const staticFilesBucket = this.createStaticFilesBucket();

        this.createCloudFrontWebDistribution(staticFilesBucket, props);
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
            },
        };
    }
}
