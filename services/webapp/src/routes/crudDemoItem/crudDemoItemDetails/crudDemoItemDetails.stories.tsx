import { Story } from '@storybook/react';
import { generatePath } from 'react-router';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { withProviders } from '../../../shared/utils/storybook';
import { RoutesConfig } from '../../../app/config/routes';
import { CrudDemoItemDetails } from './crudDemoItemDetails.component';
import crudDemoItemDetailsQueryGraphql from './__generated__/crudDemoItemDetailsQuery.graphql';

const Template: Story = () => {
  return <CrudDemoItemDetails />;
};

export default {
  title: 'CrudDemoItem / CrudDemoItemDetails',
  component: CrudDemoItemDetails,
};

const defaultItemId = 'test-id';

const defaultRelayEnv = createMockEnvironment();
defaultRelayEnv.mock.queueOperationResolver((operation: OperationDescriptor) =>
  MockPayloadGenerator.generate(operation, {
    CrudDemoItemType() {
      return {
        name: 'Demo item name',
      };
    },
  })
);
defaultRelayEnv.mock.queuePendingOperation(crudDemoItemDetailsQueryGraphql, { id: defaultItemId });

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    router: {
      url: generatePath(RoutesConfig.crudDemoItem.details, { lang: 'en', id: defaultItemId }),
      routePath: RoutesConfig.crudDemoItem.details,
    },
    relayEnvironment: defaultRelayEnv,
  }),
];
