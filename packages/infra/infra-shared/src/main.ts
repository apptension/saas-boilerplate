import { App } from 'aws-cdk-lib';
import {
  loadEnvSettings,
  getGlobalStackName,
  getEnvStackName,
} from '@sb/infra-core';

import { GlobalStack } from './stacks/global';
import { UsEastResourcesStack } from './stacks/usEastResources';
import { EnvMainStack } from './stacks/main';
import { EnvDbStack } from './stacks/db';
import { EnvComponentsStack } from './stacks/components';
import { EnvCiStack } from './stacks/ci';

(async () => {
  const envSettings = await loadEnvSettings();
  const app = new App();

  new GlobalStack(app, getGlobalStackName('GlobalStack', envSettings), {
    envSettings,
  });

  new UsEastResourcesStack(
    app,
    getGlobalStackName('UsEastResourcesStack', envSettings),
    {
      envSettings,
      env: { region: 'us-east-1' },
    }
  );

  new EnvMainStack(app, getEnvStackName('MainStack', envSettings), {
    envSettings,
  });

  new EnvDbStack(app, getEnvStackName('DbStack', envSettings), {
    envSettings,
  });

  new EnvComponentsStack(app, getEnvStackName('ComponentsStack', envSettings), {
    envSettings,
  });

  new EnvCiStack(app, getEnvStackName('CiStack', envSettings), {
    envSettings,
  });
})();
