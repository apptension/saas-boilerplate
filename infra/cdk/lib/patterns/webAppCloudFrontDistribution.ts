import {Construct} from "constructs";
import {Duration, Fn, Stack} from "aws-cdk-lib";
import {Bucket} from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId} from 'aws-cdk-lib/custom-resources';
import {
    CloudFrontAllowedMethods,
    CloudFrontWebDistribution,
    Function,
    FunctionCode,
    FunctionEventType,
    LambdaEdgeEventType,
    LambdaFunctionAssociation,
    OriginProtocolPolicy,
    SourceConfiguration,
} from 'aws-cdk-lib/aws-cloudfront';
import {ARecord, IHostedZone, RecordTarget} from "aws-cdk-lib/aws-route53";
import {CloudFrontTarget} from "aws-cdk-lib/aws-route53-targets";
import {BucketDeployment, CacheControl, ISource} from "aws-cdk-lib/aws-s3-deployment";
import {EnvComponentsStack} from "../stacks/env/components";
import {EnvironmentSettings} from "../settings/index";


export interface WebAppCloudFrontDistributionProps {
    sources: ISource[],
    domainZone: IHostedZone | null;
    domainName: string;
    apiDomainName?: string;
    certificateArn: string;
    basicAuth?: string | null;
    authLambdaSSMParameterName: string;
    distributionPaths?: Array<string>;
    envSettings?: EnvironmentSettings | null;
}

export class WebAppCloudFrontDistribution extends Construct {
    private distribution: CloudFrontWebDistribution;

    constructor(scope: Construct, id: string, props: WebAppCloudFrontDistributionProps) {
        super(scope, id);

        const staticFilesBucket = this.createStaticFilesBucket();

        this.distribution = this.createCloudFrontWebDistribution(staticFilesBucket, props);
        if (props.domainZone) {
            this.createDnsRecord(this.distribution, props);
        }
        this.createDeployment(staticFilesBucket, this.distribution, props);
    }

    private createDeployment(staticFilesBucket: Bucket, distribution: CloudFrontWebDistribution, props: WebAppCloudFrontDistributionProps) {
        new BucketDeployment(this, 'DeployWebsite', {
            distribution,
            distributionPaths: props.distributionPaths || ['/index.html'],
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
        const webSocketApiSourceConfig = this.createWebSocketApiProxySourceConfig(props);
        if (webSocketApiSourceConfig) {
            originConfigs.push(webSocketApiSourceConfig);
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
            customOriginSource: {
                domainName: staticFilesBucket.bucketWebsiteDomainName,
                originProtocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
                originPath: '',
                originHeaders,
            },
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

    private createWebSocketApiProxySourceConfig(props: WebAppCloudFrontDistributionProps): SourceConfiguration | null {
        if (!props.envSettings) {
            return null
        }
        const stack = Stack.of(this);
        const webSocketApiId = Fn.importValue(EnvComponentsStack.getWebSocketApiIdOutputExportName(props.envSettings));
        const cfFunction = new Function(this, "Function", {code: FunctionCode.fromInline(`
            function handler(event) {
                var request = event.request;
                request.uri = request.uri.replace("/ws", "/${props.envSettings.envStage}");
                return request;
            }
        `)});
        return {
            behaviors: [{
                pathPattern: '/ws',
                allowedMethods: CloudFrontAllowedMethods.ALL,
                forwardedValues: {
                    queryString: false,
                    headers: [],
                    cookies: {forward: 'all'},
                },
                defaultTtl: Duration.seconds(0),
                minTtl: Duration.seconds(0),
                maxTtl: Duration.seconds(0),
                functionAssociations: [{
                    function: cfFunction,
                    eventType: FunctionEventType.VIEWER_REQUEST,
                }]
            }],
            customOriginSource: {
                domainName: `${webSocketApiId}.execute-api.${stack.region}.amazonaws.com`,
                originProtocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
            },
        };
    }

    private createDnsRecord(distribution: CloudFrontWebDistribution, props: WebAppCloudFrontDistributionProps) {
        return new ARecord(this, `DNSRecord`, {
            zone: props.domainZone!,
            recordName: props.domainName,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        });
    }
}
