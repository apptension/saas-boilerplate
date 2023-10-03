import { App, Stack, StackProps } from 'aws-cdk-lib';
import { EnvConstructProps } from '@sb/infra-core';

import { GlobalResources } from './resources';

export interface GlobalStackProps extends StackProps, EnvConstructProps {}

export class GlobalStack extends Stack {
  resources: GlobalResources;

  constructor(scope: App, id: string, props: GlobalStackProps) {
    super(scope, id, props);

    this.resources = new GlobalResources(this, 'GlobalResources', {
      envSettings: props.envSettings,
    });
  }
}
