import { App, CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import * as apiGateway2 from '@aws-cdk/aws-apigatewayv2-alpha';
import * as events from 'aws-cdk-lib/aws-events';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cfOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as certManager from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';

import * as ec2KeyPair from 'cdk-ec2-key-pair';
import {
  EnvConstructProps,
  EnvironmentSettings,
  getCloudfrontCertificateArn,
  getHostedZone,
} from '@sb/infra-core';

export interface EnvComponentsStackProps
  extends StackProps,
    EnvConstructProps {}

export class EnvComponentsStack extends Stack {
  static getWorkersEventBusName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-workers`;
  }

  static getFileUploadsBucketName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-file-uploads-bucket`;
  }

  static getWebSocketApiName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-websocket-api`;
  }

  static getWebSocketApiIdOutputExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-webSocketApiId`;
  }

  static getWebSocketApiEndpointOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-webSocketApiEndpoint`;
  }

  static getCdnSigningPublicKeyIdExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-cdnSigningPublicKeyId`;
  }

  static getFileUploadsCFDistributionIdOutputExportName(
    envSettings: EnvironmentSettings
  ) {
    return `${envSettings.projectEnvName}-fileUploadsCFDistributionId`;
  }

  static getCDNSigningKeyName(
    envSettings: EnvironmentSettings,
    skipPrefix = false
  ) {
    const short = `${envSettings.projectEnvName}-cdn-signing-key`;
    if (skipPrefix) {
      return short;
    }
    return `ec2-ssh-key/${short}`;
  }

  static getExportsBucketName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-exports-bucket`;
  }

  private createNewWebSocketApi(props: EnvComponentsStackProps) {
    const webSocketApi = new apiGateway2.WebSocketApi(this, 'WebSocketApi', {
      apiName: EnvComponentsStack.getWebSocketApiName(props.envSettings),
    });

    new apiGateway2.WebSocketStage(this, 'WebSocketStage', {
      stageName: props.envSettings.envStage,
      webSocketApi: webSocketApi,
      autoDeploy: true,
    });

    new CfnOutput(this, 'WebSocketApiId', {
      exportName: EnvComponentsStack.getWebSocketApiIdOutputExportName(
        props.envSettings
      ),
      value: webSocketApi.apiId,
    });

    new CfnOutput(this, 'WebSocketApiEndpoint', {
      exportName: EnvComponentsStack.getWebSocketApiEndpointOutputExportName(
        props.envSettings
      ),
      value: webSocketApi.apiEndpoint,
    });
  }

  private createEmailEventBus(props: EnvComponentsStackProps) {
    return new events.EventBus(this, 'EmailEventBus', {
      eventBusName: EnvComponentsStack.getWorkersEventBusName(
        props.envSettings
      ),
    });
  }

  private createFileUploadsBucket(props: EnvComponentsStackProps) {
    return new s3.Bucket(this, 'FileUploadsBucket', {
      bucketName: EnvComponentsStack.getFileUploadsBucketName(
        props.envSettings
      ),
    });
  }

  private createDnsRecord(
    props: EnvComponentsStackProps,
    distribution: cloudfront.Distribution
  ) {
    const domainZone = getHostedZone(this, props.envSettings);
    if (!domainZone) {
      return null;
    }
    return new route53.ARecord(this, `DNSRecord`, {
      zone: domainZone,
      recordName: props.envSettings.domains.cdn,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
    });
  }

  private createCloudfrontDistribution(
    props: EnvComponentsStackProps,
    {
      fileUploadsBucket,
      keyGroup,
    }: { fileUploadsBucket: s3.Bucket; keyGroup: cloudfront.KeyGroup }
  ) {
    const originRequestPolicy = new cloudfront.OriginRequestPolicy(
      this,
      'OriginRequestPolicy',
      {
        queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      }
    );
    const cachePolicy = new cloudfront.CachePolicy(this, 'CachePolicy', {
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
    });
    const certificateArn = getCloudfrontCertificateArn(props.envSettings);
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'FileUploadsOriginAccessIndetity'
    );
    const bucketOrigin = new cfOrigins.S3Origin(fileUploadsBucket, {
      originAccessIdentity,
    });
    fileUploadsBucket.grantRead(originAccessIdentity);

    const distribution = new cloudfront.Distribution(
      this,
      'FileUploadsBucketCdn',
      {
        defaultBehavior: {
          origin: bucketOrigin,
          originRequestPolicy: originRequestPolicy,
          cachePolicy: cachePolicy,
          trustedKeyGroups: [keyGroup],
        },
        domainNames: [props.envSettings.domains.cdn],
        certificate: certManager.Certificate.fromCertificateArn(
          this,
          'Certificate',
          certificateArn
        ),
      }
    );
    distribution.addBehavior('/public/*', bucketOrigin);

    this.createDnsRecord(props, distribution);

    new CfnOutput(this, 'FileUploadsCFDistributionId', {
      exportName:
        EnvComponentsStack.getFileUploadsCFDistributionIdOutputExportName(
          props.envSettings
        ),
      value: distribution.distributionId,
    });

    return distribution;
  }

  private createExportsBucket(props: EnvComponentsStackProps) {
    return new s3.Bucket(this, 'ExportsBucket', {
      bucketName: EnvComponentsStack.getExportsBucketName(props.envSettings),
      accessControl: s3.BucketAccessControl.PRIVATE,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
  }

  constructor(scope: App, id: string, props: EnvComponentsStackProps) {
    super(scope, id, props);

    this.createEmailEventBus(props);
    const fileUploadsBucket = this.createFileUploadsBucket(props);
    this.createNewWebSocketApi(props);
    const keyGroup = this.createSigningKeyGroup(props);
    this.createCloudfrontDistribution(props, { fileUploadsBucket, keyGroup });
    this.createExportsBucket(props);
  }

  private createSigningKeyGroup(props: EnvComponentsStackProps) {
    const keyPair = new ec2KeyPair.KeyPair(this, 'CDNSigningKeyPair', {
      name: EnvComponentsStack.getCDNSigningKeyName(props.envSettings, true),
      exposePublicKey: true,
      storePublicKey: true,
      publicKeyFormat: ec2KeyPair.PublicKeyFormat.PEM,
    });

    const pubKey = new cloudfront.PublicKey(this, 'SigningPublicKey', {
      encodedKey: keyPair.publicKeyValue,
    });
    new CfnOutput(this, 'CdnSigningPublicKeyId', {
      exportName: EnvComponentsStack.getCdnSigningPublicKeyIdExportName(
        props.envSettings
      ),
      value: pubKey.publicKeyId,
    });

    return new cloudfront.KeyGroup(this, 'SigningKeyGroup', {
      items: [pubKey],
    });
  }
}
