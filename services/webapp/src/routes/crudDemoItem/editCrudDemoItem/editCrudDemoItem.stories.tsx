import React from 'react';
import { Story } from '@storybook/react';
import { generatePath } from 'react-router';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import EditCrudDemoItemQuery from '../../../__generated__/editCrudDemoItemQuery.graphql';
import { withProviders } from '../../../shared/utils/storybook';
import { ROUTES } from '../../app.constants';
import { EditCrudDemoItem } from './editCrudDemoItem.component';

const Template: Story = (args) => {
  return <EditCrudDemoItem {...args} />;
};

export default {
  title: 'CrudDemoItem / EditCrudDemoItem',
  component: EditCrudDemoItem,
};

const defaultItemId = 'test-id';

const defaultRelayEnv = createMockEnvironment();
defaultRelayEnv.mock.queueOperationResolver((operation: OperationDescriptor) =>
  MockPayloadGenerator.generate(operation, {
    CrudDemoItemType() {
      return {
        name: 'Default name',
      };
    },
  })
);
defaultRelayEnv.mock.queuePendingOperation(EditCrudDemoItemQuery, { id: defaultItemId });

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    router: {
      url: generatePath(ROUTES.crudDemoItem.edit, { lang: 'en', id: defaultItemId }),
      routePath: ROUTES.crudDemoItem.edit,
    },
    relayEnvironment: defaultRelayEnv,
  }),
];
