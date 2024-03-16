import { App } from 'aws-cdk-lib';
import { getEnvStackName, loadEnvSettings } from '@sb/infra-core';

import { ApiStack } from './stacks/api';
import { MigrationsStack } from './stacks/migrations';
import { CeleryStack } from './stacks/celeryWorkers';

(async () => {
  const envSettings = await loadEnvSettings();
  const app = new App();

  new ApiStack(app, getEnvStackName('ApiStack', envSettings), {
    envSettings,
  });

  new MigrationsStack(app, getEnvStackName('MigrationsStack', envSettings), {
    envSettings,
  });

  new CeleryStack(app, getEnvStackName('CeleryStack', envSettings), {
    envSettings,
  });
})();
