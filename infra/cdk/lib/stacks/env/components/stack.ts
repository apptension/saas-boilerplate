import {App, CfnOutput, Stack, StackProps} from 'aws-cdk-lib';
import {WebSocketApi, WebSocketStage} from "@aws-cdk/aws-apigatewayv2-alpha";
import {EnvConstructProps} from "../../../types";
import {EventBus} from "aws-cdk-lib/aws-events";
import {EnvironmentSettings} from "../../../settings";
import {Bucket} from "aws-cdk-lib/aws-s3";
import {
    CachePolicy,
    CacheQueryStringBehavior,
    CfnDistribution,
    Distribution,
    OriginRequestPolicy,
    OriginRequestQueryStringBehavior
} from "aws-cdk-lib/aws-cloudfront";
import {S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";
import {Certificate} from "aws-cdk-lib/aws-certificatemanager";
import {ARecord, RecordTarget} from "aws-cdk-lib/aws-route53";
import {CloudFrontTarget} from "aws-cdk-lib/aws-route53-targets";
import {getCloudfrontCertificateArn, getHostedZone} from "../../../helpers/domains";

export interface EnvComponentsStackProps extends StackProps, EnvConstructProps {

}

export class EnvComponentsStack extends Stack {
    static getWorkersEventBusName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-workers`
    }

    static getFileUploadsBucketName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-file-uploads-bucket`;
    }

    static getWebSocketApiName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-websocket-api`
    }

    static getWebSocketApiIdOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-webSocketApiId`
    }

    static getWebSocketApiEndpointOutputExportName(envSettings: EnvironmentSettings) {
        return `${envSettings.projectEnvName}-webSocketApiEndpoint`
    }

    private createNewWebSocketApi(props: EnvComponentsStackProps) {
        const webSocketApi = new WebSocketApi(this, "WebSocketApi", {
           apiName: EnvComponentsStack.getWebSocketApiName(props.envSettings),
        });

        new WebSocketStage(this, "WebSocketStage", {
           stageName: props.envSettings.envStage,
           webSocketApi: webSocketApi,
           autoDeploy: true,
        });

        new CfnOutput(this, "WebSocketApiId", {
            exportName: EnvComponentsStack.getWebSocketApiIdOutputExportName(props.envSettings),
            value: webSocketApi.apiId,
        });

        new CfnOutput(this, "WebSocketApiEndpoint", {
            exportName: EnvComponentsStack.getWebSocketApiEndpointOutputExportName(props.envSettings),
            value: webSocketApi.apiEndpoint,
        });
    }

    private createEmailEventBus(props: EnvComponentsStackProps) {
        return new EventBus(this, "EmailEventBus", {
            eventBusName: EnvComponentsStack.getWorkersEventBusName(props.envSettings),
        });
    }

    private createFileUploadsBucket(props: EnvComponentsStackProps) {
        return new Bucket(this, "FileUploadsBucket", {
            bucketName: EnvComponentsStack.getFileUploadsBucketName(props.envSettings),
        });
    };

    private createDnsRecord(props: EnvComponentsStackProps, distribution: Distribution) {
        const domainZone = getHostedZone(this, props.envSettings);
        return new ARecord(this, `DNSRecord`, {
            zone: domainZone!,
            recordName: props.envSettings.domains.cdn,
            target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
        });
    };

    private createCloudfrontDistribution(props: EnvComponentsStackProps, fileUploadsBucket: Bucket) {
        const originRequestPolicy = new OriginRequestPolicy(this, "OriginRequestPolicy", {
            queryStringBehavior: OriginRequestQueryStringBehavior.all()
        });
        const cachePolicy = new CachePolicy(this, "CachePolicy", {
            queryStringBehavior: CacheQueryStringBehavior.all()
        })
        const certificateArn = getCloudfrontCertificateArn(props.envSettings);
        const distribution = new Distribution(this,"FileUploadsBucketCdn", {
            defaultBehavior: {
                origin: new S3Origin(fileUploadsBucket),
                originRequestPolicy: originRequestPolicy,
                cachePolicy: cachePolicy,
            },
            domainNames: [props.envSettings.domains.cdn],
            certificate: Certificate.fromCertificateArn(this, "Certificate", certificateArn)
        });
        const cfnDistribution = distribution.node.defaultChild as CfnDistribution;
        cfnDistribution.addPropertyOverride("DistributionConfig.Origins.0.S3OriginConfig.OriginAccessIdentity", "");
        if (props.envSettings.hostedZone.id) {
            this.createDnsRecord(props, distribution);
        }
        return distribution;
    }

    constructor(scope: App, id: string, props: EnvComponentsStackProps) {
        super(scope, id, props);

        this.createEmailEventBus(props);
        const fileUploadsBucket = this.createFileUploadsBucket(props);
        this.createNewWebSocketApi(props);
        this.createCloudfrontDistribution(props, fileUploadsBucket);
    }
}
