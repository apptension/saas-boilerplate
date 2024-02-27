import { EnvironmentSettings } from '@sb/infra-core';

import { Construct } from 'constructs';
import { Duration, Fn, Stack } from 'aws-cdk-lib';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cfOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';

import { EnvComponentsStack } from '../stacks/components';

export interface WebAppCloudFrontDistributionProps {
  sources: s3Deploy.ISource[];
  domainZone: route53.IHostedZone | null;
  domainName: string;
  apiDomainName?: string;
  certificateArn: string;
  basicAuth?: string | null;
  authLambdaSSMParameterName: string;
  distributionPaths?: Array<string>;
  envSettings?: EnvironmentSettings | null;
}

export class WebAppCloudFrontDistribution extends Construct {
  private distribution: cloudfront.Distribution;

  constructor(
    scope: Construct,
    id: string,
    props: WebAppCloudFrontDistributionProps,
  ) {
    super(scope, id);

    const staticFilesBucket = this.createStaticFilesBucket();

    this.distribution = this.createCloudFrontDistribution(
      staticFilesBucket,
      props,
    );
    this.createDnsRecord(this.distribution, props);
    this.createDeployment(staticFilesBucket, this.distribution, props);
  }

  private createDeployment(
    staticFilesBucket: Bucket,
    distribution: cloudfront.Distribution,
    props: WebAppCloudFrontDistributionProps,
  ) {
    new s3Deploy.BucketDeployment(this, 'DeployWebsite', {
      distribution,
      distributionPaths: props.distributionPaths || ['/index.html'],
      sources: props.sources,
      destinationBucket: staticFilesBucket,
      cacheControl: [
        s3Deploy.CacheControl.setPublic(),
        s3Deploy.CacheControl.maxAge(Duration.hours(1)),
      ],
    });
  }

  protected createStaticFilesBucket() {
    return new Bucket(this, 'StaticFilesBucket', {
      versioned: true,
      accessControl: BucketAccessControl.PRIVATE,
    });
  }

  private createCloudFrontDistribution(
    staticFilesBucket: Bucket,
    props: WebAppCloudFrontDistributionProps,
  ) {
    const indexFile = '/index.html';

    const defaultBehavior = this.createStaticFilesSourceConfig(
      staticFilesBucket,
      props,
    );
    let additionalBehaviors: Record<string, cloudfront.BehaviorOptions> = {};
    const apiBehaviorConfig = this.createApiProxyBehaviorConfig(props);
    if (apiBehaviorConfig) {
      additionalBehaviors = apiBehaviorConfig;
    }
    const webSocketApiBehaviorConfig =
      this.createWebSocketApiProxyBehaviorConfig(props);
    if (webSocketApiBehaviorConfig) {
      additionalBehaviors = {
        ...additionalBehaviors,
        ...webSocketApiBehaviorConfig,
      };
    }

    return new cloudfront.Distribution(this, 'CloudFrontDistribution', {
      defaultRootObject: indexFile,
      defaultBehavior,
      additionalBehaviors,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: indexFile,
        },
      ],
      domainNames: [props.domainName],
      certificate: acm.Certificate.fromCertificateArn(
        this,
        'CloudFrontDistributionCertificate',
        props.certificateArn,
      ),
      sslSupportMethod: cloudfront.SSLMethod.SNI,
    });
  }

  private createStaticFilesSourceConfig(
    staticFilesBucket: Bucket,
    props: WebAppCloudFrontDistributionProps,
  ): cloudfront.BehaviorOptions {
    const edgeLambdas: cloudfront.EdgeLambda[] = [];
    const customHeaders: { [key: string]: string } = {};

    if (props.basicAuth) {
      const authLambdaParam = new AwsCustomResource(this, 'GetParameter', {
        policy: AwsCustomResourcePolicy.fromSdkCalls({
          resources: AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
        onUpdate: {
          action: 'getParameter',
          parameters: { Name: props.authLambdaSSMParameterName },
          region: 'us-east-1',
          service: 'SSM',
          physicalResourceId: PhysicalResourceId.of(Date.now().toString()),
        },
      });

      edgeLambdas.push({
        eventType: cloudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
        functionVersion: lambda.Version.fromVersionArn(
          this,
          'AuthLambdaFunction',
          authLambdaParam.getResponseField('Parameter.Value'),
        ),
      });
      customHeaders['X-Auth-String'] = Buffer.from(props.basicAuth).toString(
        'base64',
      );
    }

    const cachePolicy = new cloudfront.CachePolicy(this, 'CachePolicy', {
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
      headerBehavior: cloudfront.CacheHeaderBehavior.allowList(
        'Authorization',
        'CloudFront-Viewer-Country',
      ),
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'StaticFilesOAI',
    );

    const origin = new cfOrigins.S3Origin(staticFilesBucket, {
      originAccessIdentity,
      customHeaders,
      originPath: '',
    });
    staticFilesBucket.grantRead(originAccessIdentity);

    return {
      origin,
      cachePolicy,
      edgeLambdas,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    };
  }

  private createApiProxyBehaviorConfig(
    props: WebAppCloudFrontDistributionProps,
  ): Record<string, cloudfront.BehaviorOptions> | null {
    if (!props.apiDomainName) {
      return null;
    }

    const originRequestPolicy = new cloudfront.OriginRequestPolicy(
      this,
      'WSRequestPolicy',
      {
        queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
        cookieBehavior: cloudfront.OriginRequestCookieBehavior.all(),
        headerBehavior: cloudfront.OriginRequestHeaderBehavior.allowList(
          'Host',
          'Sec-WebSocket-Key',
          'Sec-WebSocket-Version',
          'Sec-WebSocket-Protocol',
          'Sec-WebSocket-Accept',
          'Sec-WebSocket-Extensions',
        ),
      },
    );

    return {
      '/api/*': {
        origin: new cfOrigins.HttpOrigin(props.apiDomainName, {
          protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
        }),
        originRequestPolicy,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    };
  }

  private createWebSocketApiProxyBehaviorConfig(
    props: WebAppCloudFrontDistributionProps,
  ): Record<string, cloudfront.BehaviorOptions> | null {
    if (!props.envSettings) {
      return null;
    }
    const stack = Stack.of(this);
    const webSocketApiId = Fn.importValue(
      EnvComponentsStack.getWebSocketApiIdOutputExportName(props.envSettings),
    );
    const cfFunction = new cloudfront.Function(this, 'Function', {
      code: cloudfront.FunctionCode.fromInline(`
            function handler(event) {
                var request = event.request;
                request.uri = request.uri.replace("/ws", "/${props.envSettings.envStage}");
                return request;
            }
        `),
    });

    return {
      '/ws': {
        origin: new cfOrigins.HttpOrigin(
          `${webSocketApiId}.execute-api.${stack.region}.amazonaws.com`,
          {
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          },
        ),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: {
          /*
                      AllViewerExceptHostHeader
                      TODO: use cloudfront.OriginRequestPolicy. after CDK version is updated
                    */
          originRequestPolicyId: 'b689b0a8-53d0-40ab-baf2-68738e2966ac',
        },
        functionAssociations: [
          {
            function: cfFunction,
            eventType: cloudfront.FunctionEventType.VIEWER_REQUEST,
          },
        ],
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    };
  }

  private createDnsRecord(
    distribution: cloudfront.Distribution,
    props: WebAppCloudFrontDistributionProps,
  ) {
    if (!props.domainZone) {
      return null;
    }

    return new route53.ARecord(this, `DNSRecord`, {
      zone: props.domainZone,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution),
      ),
    });
  }
}
