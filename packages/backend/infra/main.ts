import { App } from 'aws-cdk-lib';
import {
  loadEnvSettings,
  getEnvStackName,
} from '@sb/infra-core';

import { ApiStack } from './stacks/api';
import { MigrationsStack } from './stacks/migrations';

(async () => {
  const envSettings = await loadEnvSettings();
  const app = new App();

  new ApiStack(app, getEnvStackName('ApiStack', envSettings), {
    envSettings,
  });

  new MigrationsStack(app, getEnvStackName('MigrationsStack', envSettings), {
    envSettings,
  });
})();
