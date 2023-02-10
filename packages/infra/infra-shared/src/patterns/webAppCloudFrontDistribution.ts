import { Construct } from 'constructs';
import { Duration, Fn, Stack } from 'aws-cdk-lib';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
} from 'aws-cdk-lib/custom-resources';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as coudfront from 'aws-cdk-lib/aws-cloudfront';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3Deploy from 'aws-cdk-lib/aws-s3-deployment';
import { EnvironmentSettings } from '@saas-boilerplate-app/infra-core';

import { EnvComponentsStack } from '../stacks/components/stack';

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
  private distribution: coudfront.CloudFrontWebDistribution;

  constructor(
    scope: Construct,
    id: string,
    props: WebAppCloudFrontDistributionProps
  ) {
    super(scope, id);

    const staticFilesBucket = this.createStaticFilesBucket();

    this.distribution = this.createCloudFrontWebDistribution(
      staticFilesBucket,
      props
    );
    if (props.domainZone) {
      this.createDnsRecord(this.distribution, props);
    }
    this.createDeployment(staticFilesBucket, this.distribution, props);
  }

  private createDeployment(
    staticFilesBucket: Bucket,
    distribution: coudfront.CloudFrontWebDistribution,
    props: WebAppCloudFrontDistributionProps
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
      publicReadAccess: true,
      websiteIndexDocument: 'index.html',
    });
  }

  private createCloudFrontWebDistribution(
    staticFilesBucket: Bucket,
    props: WebAppCloudFrontDistributionProps
  ) {
    const indexFile = '/index.html';

    const originConfigs = [
      this.createStaticFilesSourceConfig(staticFilesBucket, props),
    ];
    const apiSourceConfig = this.createApiProxySourceConfig(props);
    if (apiSourceConfig) {
      originConfigs.push(apiSourceConfig);
    }
    const webSocketApiSourceConfig =
      this.createWebSocketApiProxySourceConfig(props);
    if (webSocketApiSourceConfig) {
      originConfigs.push(webSocketApiSourceConfig);
    }

    return new coudfront.CloudFrontWebDistribution(
      this,
      'CloudFrontWebDistribution',
      {
        defaultRootObject: indexFile,
        errorConfigurations: [
          { errorCode: 404, responseCode: 200, responsePagePath: indexFile },
        ],
        originConfigs: originConfigs,
        viewerCertificate: {
          aliases: [props.domainName],
          props: {
            acmCertificateArn: props.certificateArn,
            sslSupportMethod: 'sni-only',
          },
        },
      }
    );
  }

  private createStaticFilesSourceConfig(
    staticFilesBucket: Bucket,
    props: WebAppCloudFrontDistributionProps
  ): coudfront.SourceConfiguration {
    const lambdaFunctionAssociations: coudfront.LambdaFunctionAssociation[] =
      [];
    const originHeaders: { [key: string]: string } = {};

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

      lambdaFunctionAssociations.push({
        eventType: coudfront.LambdaEdgeEventType.ORIGIN_REQUEST,
        lambdaFunction: lambda.Version.fromVersionArn(
          this,
          'AuthLambdaFunction',
          authLambdaParam.getResponseField('Parameter.Value')
        ),
      });
      originHeaders['X-Auth-String'] = new Buffer(props.basicAuth).toString(
        'base64'
      );
    }

    return {
      behaviors: [
        {
          lambdaFunctionAssociations,
          isDefaultBehavior: true,
          forwardedValues: {
            headers: ['Authorization', 'CloudFront-Viewer-Country'],
            queryString: true,
          },
        },
      ],
      customOriginSource: {
        domainName: staticFilesBucket.bucketWebsiteDomainName,
        originProtocolPolicy: coudfront.OriginProtocolPolicy.HTTP_ONLY,
        originPath: '',
        originHeaders,
      },
    };
  }

  private createApiProxySourceConfig(
    props: WebAppCloudFrontDistributionProps
  ): coudfront.SourceConfiguration | null {
    if (!props.apiDomainName) {
      return null;
    }

    return {
      behaviors: [
        {
          pathPattern: '/api/*',
          allowedMethods: coudfront.CloudFrontAllowedMethods.ALL,
          forwardedValues: {
            queryString: true,
            headers: ['Host'],
            cookies: { forward: 'all' },
          },
          defaultTtl: Duration.seconds(0),
          minTtl: Duration.seconds(0),
          maxTtl: Duration.seconds(0),
        },
      ],
      customOriginSource: {
        domainName: props.apiDomainName,
        originProtocolPolicy: coudfront.OriginProtocolPolicy.HTTPS_ONLY,
      },
    };
  }

  private createWebSocketApiProxySourceConfig(
    props: WebAppCloudFrontDistributionProps
  ): coudfront.SourceConfiguration | null {
    if (!props.envSettings) {
      return null;
    }
    const stack = Stack.of(this);
    const webSocketApiId = Fn.importValue(
      EnvComponentsStack.getWebSocketApiIdOutputExportName(props.envSettings)
    );
    const cfFunction = new coudfront.Function(this, 'Function', {
      code: coudfront.FunctionCode.fromInline(`
            function handler(event) {
                var request = event.request;
                request.uri = request.uri.replace("/ws", "/${props.envSettings.envStage}");
                return request;
            }
        `),
    });
    return {
      behaviors: [
        {
          pathPattern: '/ws',
          allowedMethods: coudfront.CloudFrontAllowedMethods.ALL,
          forwardedValues: {
            queryString: false,
            headers: [],
            cookies: { forward: 'all' },
          },
          defaultTtl: Duration.seconds(0),
          minTtl: Duration.seconds(0),
          maxTtl: Duration.seconds(0),
          functionAssociations: [
            {
              function: cfFunction,
              eventType: coudfront.FunctionEventType.VIEWER_REQUEST,
            },
          ],
        },
      ],
      customOriginSource: {
        domainName: `${webSocketApiId}.execute-api.${stack.region}.amazonaws.com`,
        originProtocolPolicy: coudfront.OriginProtocolPolicy.HTTPS_ONLY,
      },
    };
  }

  private createDnsRecord(
    distribution: coudfront.CloudFrontWebDistribution,
    props: WebAppCloudFrontDistributionProps
  ) {
    return new route53.ARecord(this, `DNSRecord`, {
      zone: props.domainZone!,
      recordName: props.domainName,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
    });
  }
}
