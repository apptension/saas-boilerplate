import { App } from 'aws-cdk-lib';
import { loadEnvSettings, getEnvStackName } from '@sb/infra-core';

import { WebAppStack } from './stacks/webApp';

(async () => {
  const envSettings = await loadEnvSettings();
  const app = new App();

  new WebAppStack(app, getEnvStackName('WebAppStack', envSettings), { envSettings });
})();
