import { Construct } from 'constructs';
import { EnvConstructProps } from '@sb/infra-core';

import { GlobalECR } from './globalECR';
import { GlobalBuildSecrets } from './globalBuildSecrets';

export class GlobalResources extends Construct {
  ecr: GlobalECR;
  buildSecrets: GlobalBuildSecrets;

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.ecr = new GlobalECR(this, 'ECRGlobal', props);
    this.buildSecrets = new GlobalBuildSecrets(this, 'GlobalBuildSecrets');
  }
}
