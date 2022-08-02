import { Story } from '@storybook/react';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import CrudDemoItemListQuery from '../../../__generated__/crudDemoItemListQuery.graphql';
import { withProviders } from '../../../shared/utils/storybook';
import { connectionFromArray } from '../../../shared/utils/testUtils';
import { CrudDemoItemList } from './crudDemoItemList.component';

const Template: Story = () => {
  return <CrudDemoItemList />;
};

export default {
  title: 'CrudDemoItem / CrudDemoItemList',
  component: CrudDemoItemList,
};

const environment = createMockEnvironment();
environment.mock.queueOperationResolver((operation: OperationDescriptor) =>
  MockPayloadGenerator.generate(operation, {
    CrudDemoItemConnection: (...args) => connectionFromArray([{ name: 'First item' }, { name: 'Second item' }]),
  })
);
environment.mock.queuePendingOperation(CrudDemoItemListQuery, {});

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    relayEnvironment: environment,
  }),
];
