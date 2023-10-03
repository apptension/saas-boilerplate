import { Construct } from 'constructs';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { EcrSync, EnvConstructProps } from '@sb/infra-core';

export class DockerImageCache extends Construct {
  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    new ecr.CfnPullThroughCacheRule(this, 'PythonPullThroughCache', {
      upstreamRegistryUrl: '',
      ecrRepositoryPrefix: 'ecr-public',
    });

    new EcrSync(this, 'EcrSync', {
      repoPrefix: 'dockerhub-mirror', // optional prefix
      dockerImages: [
        {
          imageName: 'segment/chamber',
        },
      ],
    });
  }
}
