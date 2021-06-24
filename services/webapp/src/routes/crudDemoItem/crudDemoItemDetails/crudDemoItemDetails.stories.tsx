import React from 'react';
import { Story } from '@storybook/react';
import { generatePath } from 'react-router';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import CrudDemoItemDetailsQuery from '../../../__generated__/crudDemoItemDetailsQuery.graphql';
import { withProviders } from '../../../shared/utils/storybook';
import { ROUTES } from '../../app.constants';
import { CrudDemoItemDetails } from './crudDemoItemDetails.component';

const Template: Story = (args) => {
  return <CrudDemoItemDetails {...args} />;
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
defaultRelayEnv.mock.queuePendingOperation(CrudDemoItemDetailsQuery, { id: defaultItemId });

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    router: {
      url: generatePath(ROUTES.crudDemoItem.details, { lang: 'en', id: defaultItemId }),
      routePath: ROUTES.crudDemoItem.details,
    },
    relayEnvironment: defaultRelayEnv,
  }),
];
