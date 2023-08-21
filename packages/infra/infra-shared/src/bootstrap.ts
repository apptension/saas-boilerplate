import { App } from 'aws-cdk-lib';
import { BootstrapStack } from './stacks/bootstrap';

(async () => {
  const app = new App();

  new BootstrapStack(app, 'sb-bootstrap');
})();
