import { Construct } from 'constructs';
import { CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';

import { EnvironmentSettings } from '@sb/infra-core';

export interface TranslationsStackProps {
  envSettings: EnvironmentSettings;
}

/**
 * Infrastructure for dynamic translations.
 *
 * Creates:
 * - S3 bucket for storing translation JSON files
 * - CloudFront distribution for serving translations with caching
 * - IAM policies for backend to publish translations
 */
export class TranslationsStack extends Construct {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  static getTranslationsBucketArnOutputExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-translationsBucketArn`;
  }

  static getTranslationsDistributionIdOutputExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-translationsDistributionId`;
  }

  static getTranslationsDistributionDomainOutputExportName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-translationsDistributionDomain`;
  }

  constructor(scope: Construct, id: string, props: TranslationsStackProps) {
    super(scope, id);

    this.bucket = this.createTranslationsBucket(props);
    this.distribution = this.createCloudFrontDistribution(props);
    this.createOutputs(props);
  }

  private createTranslationsBucket(props: TranslationsStackProps): s3.Bucket {
    return new s3.Bucket(this, 'TranslationsBucket', {
      bucketName: `${props.envSettings.projectEnvName}-translations`.toLowerCase(),
      versioned: true, // Keep version history for rollback
      removalPolicy: RemovalPolicy.RETAIN, // Don't delete translations on stack removal
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'], // Allow access from any origin (CDN handles caching)
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
      lifecycleRules: [
        {
          // Keep old versions for 90 days for rollback capability
          noncurrentVersionExpiration: Duration.days(90),
          enabled: true,
        },
      ],
    });
  }

  private createCloudFrontDistribution(props: TranslationsStackProps): cloudfront.Distribution {
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      'TranslationsOAI',
      {
        comment: `OAI for ${props.envSettings.projectEnvName} translations`,
      }
    );

    // Grant CloudFront read access to the bucket
    this.bucket.grantRead(originAccessIdentity);

    const cachePolicy = new cloudfront.CachePolicy(this, 'TranslationsCachePolicy', {
      cachePolicyName: `${props.envSettings.projectEnvName}-translations-cache`,
      comment: 'Cache policy for translation files',
      defaultTtl: Duration.hours(1),
      maxTtl: Duration.hours(24),
      minTtl: Duration.seconds(0),
      // Allow cache invalidation via query string or header
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    return new cloudfront.Distribution(this, 'TranslationsDistribution', {
      comment: `${props.envSettings.projectEnvName} translations CDN`,
      defaultBehavior: {
        origin: new origins.S3Origin(this.bucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        compress: true,
      },
      // Add CORS headers
      defaultRootObject: '',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 404,
          responsePagePath: '/404.json',
          ttl: Duration.minutes(5),
        },
      ],
    });
  }

  private createOutputs(props: TranslationsStackProps): void {
    new CfnOutput(this, 'TranslationsBucketArn', {
      exportName: TranslationsStack.getTranslationsBucketArnOutputExportName(props.envSettings),
      value: this.bucket.bucketArn,
    });

    new CfnOutput(this, 'TranslationsBucketName', {
      value: this.bucket.bucketName,
      description: 'S3 bucket name for translations',
    });

    new CfnOutput(this, 'TranslationsDistributionId', {
      exportName: TranslationsStack.getTranslationsDistributionIdOutputExportName(props.envSettings),
      value: this.distribution.distributionId,
    });

    new CfnOutput(this, 'TranslationsDistributionDomain', {
      exportName: TranslationsStack.getTranslationsDistributionDomainOutputExportName(props.envSettings),
      value: this.distribution.distributionDomainName,
      description: 'CloudFront domain for translations CDN',
    });

    new CfnOutput(this, 'TranslationsUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'Full URL for translations CDN (use as VITE_TRANSLATIONS_URL)',
    });
  }

  /**
   * Get IAM policy statements for publishing translations.
   * Use this to grant the backend permission to upload translations.
   */
  static getPublishPolicyStatements(bucket: s3.IBucket, distribution: cloudfront.IDistribution): iam.PolicyStatement[] {
    return [
      // Allow uploading to S3
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          's3:PutObject',
          's3:GetObject',
          's3:DeleteObject',
          's3:ListBucket',
        ],
        resources: [
          bucket.bucketArn,
          `${bucket.bucketArn}/*`,
        ],
      }),
      // Allow CloudFront cache invalidation
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'cloudfront:CreateInvalidation',
        ],
        resources: [
          `arn:aws:cloudfront::*:distribution/${distribution.distributionId}`,
        ],
      }),
    ];
  }
}

