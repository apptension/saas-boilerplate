import { App, Stack, StackProps } from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import { EnvConstructProps } from '@sb/infra-core';

import { GlobalECR } from '../global/resources/globalECR';
import { CiPipeline } from './ciPipeline';
import { CiEntrypoint } from './ciEntrypoint';

export interface EnvCiStackProps extends StackProps, EnvConstructProps {}

export class EnvCiStack extends Stack {
  constructor(scope: App, id: string, props: EnvCiStackProps) {
    super(scope, id, props);

    const backendRepository = this.retrieveBackendECRRepository(props);
    const mcpServerRepository = this.retrieveMcpServerECRRepository(props);

    const entrypoint = new CiEntrypoint(this, 'Entrypoint', {
      envSettings: props.envSettings,
    });

    new CiPipeline(this, 'PipelineConfig', {
      envSettings: props.envSettings,
      backendRepository,
      mcpServerRepository,
      entrypointArtifactBucket: entrypoint.artifactsBucket,
    });
  }

  private retrieveBackendECRRepository(props: EnvCiStackProps) {
    return ecr.Repository.fromRepositoryName(
      this,
      'ECRBackendRepository',
      GlobalECR.getBackendRepositoryName(props.envSettings),
    );
  }

  private retrieveMcpServerECRRepository(props: EnvCiStackProps) {
    return ecr.Repository.fromRepositoryName(
      this,
      'ECRMcpServerRepository',
      GlobalECR.getMcpServerRepositoryName(props.envSettings),
    );
  }
}
