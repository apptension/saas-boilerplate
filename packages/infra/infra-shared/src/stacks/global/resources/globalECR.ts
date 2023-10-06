import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import {
  EcrSync,
  EnvConstructProps,
  EnvironmentSettings,
} from '@sb/infra-core';
import { Fn } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

export class GlobalECR extends Construct {
  static ECRPublicRepositoryPrefix = 'ecr-public';
  static ECRDockerHubMirrorRepositoryPrefix = 'dockerhub-mirror';
  static ECRPublicCacheRuleUpstreamRegistryUrl = 'public.ecr.aws';

  backendRepository: ecr.Repository;
  ecrPublicCacheRule: ecr.CfnPullThroughCacheRule;

  static getBackendRepositoryName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectName}-backend`;
  }

  static getPublicECRIamPolicyStatements() {
    const registryId = Fn.ref('AWS::AccountId');
    const region = Fn.ref('AWS::Region');

    return [
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ecr:BatchImportUpstreamImage', 'ecr:CreateRepository'],
        resources: [
          `arn:aws:ecr:${region}:${registryId}:repository/${GlobalECR.ECRPublicRepositoryPrefix}/*`,
          `arn:aws:ecr:${region}:${registryId}:repository/${GlobalECR.ECRDockerHubMirrorRepositoryPrefix}/*`,
        ],
      }),
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ecr:GetAuthorizationToken',
          'ecr:BatchCheckLayerAvailability',
          'ecr:GetDownloadUrlForLayer',
          'ecr:GetRepositoryPolicy',
          'ecr:DescribeRepositories',
          'ecr:ListImages',
          'ecr:DescribeImages',
          'ecr:BatchGetImage',
          'ecr:GetLifecyclePolicy',
          'ecr:GetLifecyclePolicyPreview',
          'ecr:ListTagsForResource',
          'ecr:DescribeImageScanFindings',
        ],
        resources: ['*'],
      }),
    ];
  }

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.backendRepository = new ecr.Repository(this, 'ECRBackendRepository', {
      repositoryName: GlobalECR.getBackendRepositoryName(props.envSettings),
    });
    this.ecrPublicCacheRule = new ecr.CfnPullThroughCacheRule(
      this,
      'ECRPublicCacheRule',
      {
        ecrRepositoryPrefix: GlobalECR.ECRPublicRepositoryPrefix,
        upstreamRegistryUrl: GlobalECR.ECRPublicCacheRuleUpstreamRegistryUrl,
      },
    );

    new EcrSync(this, 'EcrSync', {
      getImageTagsFunctionName: `${props.envSettings.projectName}-ecr-sync-get-image-tags`,
      repoPrefix: 'dockerhub-mirror',
      dockerImages: [
        {
          imageName: 'segment/chamber',
          includeTags: ['^2'],
        },
      ],
    });
  }
}
