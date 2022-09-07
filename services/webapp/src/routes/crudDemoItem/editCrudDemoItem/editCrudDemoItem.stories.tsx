import { Story } from '@storybook/react';
import { generatePath } from 'react-router';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { withProviders } from '../../../shared/utils/storybook';
import { RoutesConfig } from '../../../app/config/routes';
import EditCrudDemoItemQuery from './__generated__/editCrudDemoItemQuery.graphql';
import { EditCrudDemoItem } from './editCrudDemoItem.component';

const Template: Story = () => {
  return <EditCrudDemoItem />;
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
      url: generatePath(RoutesConfig.crudDemoItem.edit, { lang: 'en', id: defaultItemId }),
      routePath: RoutesConfig.crudDemoItem.edit,
    },
    relayEnvironment: defaultRelayEnv,
  }),
];
