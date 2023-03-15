import { App } from 'aws-cdk-lib';
import {
  loadEnvSettings,
  getEnvStackName,
} from '@sb/infra-core';

import { StatusDashboardStack } from './stacks/statusDashboard';

(async () => {
  const envSettings = await loadEnvSettings();
  const app = new App();

  new StatusDashboardStack(
    app,
    getEnvStackName('StatusDashboardStack', envSettings),
    {
      envSettings,
    }
  );
})();
