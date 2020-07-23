import {Construct, Duration} from "@aws-cdk/core";
import {Bucket} from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda';
import {AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId} from '@aws-cdk/custom-resources';
import {
    CloudFrontAllowedMethods,
    CloudFrontWebDistribution,
    LambdaEdgeEventType,
    OriginProtocolPolicy,
    SourceConfiguration
} from '@aws-cdk/aws-cloudfront';
import {ARecord, IHostedZone, RecordTarget} from "@aws-cdk/aws-route53";
import {CloudFrontTarget} from "@aws-cdk/aws-route53-targets";
import {BucketDeployment, CacheControl, ISource} from "@aws-cdk/aws-s3-deployment";
import {LambdaFunctionAssociation} from "@aws-cdk/aws-cloudfront/lib/web_distribution";


export interface WebAppCloudFrontDistributionProps {
    sources: ISource[],
    domainZone: IHostedZone;
    domainName: string;
    apiDomainName?: string;
    certificateArn: string;
    basicAuth?: string | null;
    authLambdaSSMParameterName: string;
}

export class WebAppCloudFrontDistribution extends Construct {
    private distribution: CloudFrontWebDistribution;

    constructor(scope: Construct, id: string, props: WebAppCloudFrontDistributionProps) {
        super(scope, id);

        const staticFilesBucket = this.createStaticFilesBucket();

        this.distribution = this.createCloudFrontWebDistribution(staticFilesBucket, props);
        this.createDnsRecord(this.distribution, props);
        this.createDeployment(staticFilesBucket, this.distribution, props);
    }

    private createDeployment(staticFilesBucket: Bucket, distribution: CloudFrontWebDistribution, props: WebAppCloudFrontDistributionProps) {
        new BucketDeployment(this, 'DeployWebsite', {
            distribution,
            distributionPaths: ['/index.html'],
            sources: props.sources,
            destinationBucket: staticFilesBucket,
            cacheControl: [CacheControl.setPublic(), CacheControl.maxAge(Duration.hours(1))],
        });
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

        const originConfigs = [this.createStaticFilesSourceConfig(staticFilesBucket, props)];
        const apiSourceConfig = this.createApiProxySourceConfig(props);
        if (apiSourceConfig) {
            originConfigs.push(apiSourceConfig);
        }

        return new CloudFrontWebDistribution(this, "CloudFrontWebDistribution", {
            defaultRootObject: indexFile,
            errorConfigurations: [{errorCode: 404, responseCode: 200, responsePagePath: indexFile}],
            originConfigs: originConfigs,
            viewerCertificate: {
                aliases: [props.domainName],
                props: {
                    acmCertificateArn: props.certificateArn,
                    sslSupportMethod: 'sni-only',
                },
            },
        });
    }


    private createStaticFilesSourceConfig(staticFilesBucket: Bucket, props: WebAppCloudFrontDistributionProps): SourceConfiguration {
        const lambdaFunctionAssociations: LambdaFunctionAssociation[] = [];
        const originHeaders: { [key: string]: string } = {};

        if (props.basicAuth) {
            const authLambdaParam = new AwsCustomResource(
                this,
                "GetParameter",
                {
                    policy: AwsCustomResourcePolicy.fromSdkCalls({
                        resources: AwsCustomResourcePolicy.ANY_RESOURCE,
                    }),
                    onUpdate: {
                        action: 'getParameter',
                        parameters: {Name: props.authLambdaSSMParameterName},
                        region: 'us-east-1',
                        service: 'SSM',
                        physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
                    }
                }
            )

            lambdaFunctionAssociations.push({
                eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
                lambdaFunction: lambda.Version.fromVersionArn(this, "AuthLambdaFunction",
                    authLambdaParam.getResponseField("Parameter.Value"))
            });
            originHeaders['X-Auth-String'] = new Buffer(props.basicAuth).toString('base64')
        }

        return {
            behaviors: [{
                lambdaFunctionAssociations,
                isDefaultBehavior: true,
                forwardedValues: {
                    headers: ['Authorization', 'CloudFront-Viewer-Country'],
                    queryString: true,
                }
            }],
            originPath: '',
            customOriginSource: {
                domainName: staticFilesBucket.bucketWebsiteDomainName,
                originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
            },
            originHeaders,
        };
    }

    private createApiProxySourceConfig(props: WebAppCloudFrontDistributionProps): SourceConfiguration | null {
        if (!props.apiDomainName) {
            return null;
        }

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
