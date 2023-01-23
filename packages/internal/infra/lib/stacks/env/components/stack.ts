import { App, CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { WebSocketApi, WebSocketStage } from "@aws-cdk/aws-apigatewayv2-alpha";
import { EnvConstructProps } from "../../../types";
import { EventBus } from "aws-cdk-lib/aws-events";
import { EnvironmentSettings } from "../../../settings";
import { Bucket } from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import {
  getCloudfrontCertificateArn,
  getHostedZone,
} from "../../../helpers/domains";
import * as ec2KeyPair from "cdk-ec2-key-pair";

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
    skipPrefix: boolean = false
  ) {
    const short = `${envSettings.projectEnvName}-cdn-signing-key`;
    if (skipPrefix) {
      return short;
    }
    return `ec2-ssh-key/${short}`;
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
      exportName: EnvComponentsStack.getWebSocketApiIdOutputExportName(
        props.envSettings
      ),
      value: webSocketApi.apiId,
    });

    new CfnOutput(this, "WebSocketApiEndpoint", {
      exportName: EnvComponentsStack.getWebSocketApiEndpointOutputExportName(
        props.envSettings
      ),
      value: webSocketApi.apiEndpoint,
    });
  }

  private createEmailEventBus(props: EnvComponentsStackProps) {
    return new EventBus(this, "EmailEventBus", {
      eventBusName: EnvComponentsStack.getWorkersEventBusName(
        props.envSettings
      ),
    });
  }

  private createFileUploadsBucket(props: EnvComponentsStackProps) {
    return new Bucket(this, "FileUploadsBucket", {
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
    return new ARecord(this, `DNSRecord`, {
      zone: domainZone!,
      recordName: props.envSettings.domains.cdn,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });
  }

  private createCloudfrontDistribution(
    props: EnvComponentsStackProps,
    {
      fileUploadsBucket,
      keyGroup,
    }: { fileUploadsBucket: Bucket; keyGroup: cloudfront.KeyGroup }
  ) {
    const originRequestPolicy = new cloudfront.OriginRequestPolicy(
      this,
      "OriginRequestPolicy",
      {
        queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
      }
    );
    const cachePolicy = new cloudfront.CachePolicy(this, "CachePolicy", {
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.all(),
    });
    const certificateArn = getCloudfrontCertificateArn(props.envSettings);
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "FileUploadsOriginAccessIndetity"
    );
    const bucketOrigin = new S3Origin(fileUploadsBucket, {
      originAccessIdentity,
    });
    fileUploadsBucket.grantRead(originAccessIdentity);

    const distribution = new cloudfront.Distribution(
      this,
      "FileUploadsBucketCdn",
      {
        defaultBehavior: {
          origin: bucketOrigin,
          originRequestPolicy: originRequestPolicy,
          cachePolicy: cachePolicy,
          trustedKeyGroups: [keyGroup],
        },
        domainNames: [props.envSettings.domains.cdn],
        certificate: Certificate.fromCertificateArn(
          this,
          "Certificate",
          certificateArn
        ),
      }
    );

    if (props.envSettings.hostedZone.id) {
      this.createDnsRecord(props, distribution);
    }

    new CfnOutput(this, "FileUploadsCFDistributionId", {
      exportName:
        EnvComponentsStack.getFileUploadsCFDistributionIdOutputExportName(
          props.envSettings
        ),
      value: distribution.distributionId,
    });

    return distribution;
  }

  constructor(scope: App, id: string, props: EnvComponentsStackProps) {
    super(scope, id, props);

    this.createEmailEventBus(props);
    const fileUploadsBucket = this.createFileUploadsBucket(props);
    this.createNewWebSocketApi(props);
    const keyGroup = this.createSigningKeyGroup(props);
    this.createCloudfrontDistribution(props, { fileUploadsBucket, keyGroup });
  }

  private createSigningKeyGroup(props: EnvComponentsStackProps) {
    const keyPair = new ec2KeyPair.KeyPair(this, "CDNSigningKeyPair", {
      name: EnvComponentsStack.getCDNSigningKeyName(props.envSettings, true),
      exposePublicKey: true,
      storePublicKey: true,
      publicKeyFormat: ec2KeyPair.PublicKeyFormat.PEM,
    });

    const pubKey = new cloudfront.PublicKey(this, "SigningPublicKey", {
      encodedKey: keyPair.publicKeyValue,
    });
    new CfnOutput(this, "CdnSigningPublicKeyId", {
      exportName: EnvComponentsStack.getCdnSigningPublicKeyIdExportName(
        props.envSettings
      ),
      value: pubKey.publicKeyId,
    });

    return new cloudfront.KeyGroup(this, "SigningKeyGroup", {
      items: [pubKey],
    });
  }
}
