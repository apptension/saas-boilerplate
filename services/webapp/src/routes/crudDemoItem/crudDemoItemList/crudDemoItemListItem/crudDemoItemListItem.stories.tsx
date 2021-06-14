import React, { Suspense } from 'react';
import { Story } from '@storybook/react';
import { useLazyLoadQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import { crudDemoItemListItemDefaultStoryQuery } from '../../../../__generated__/crudDemoItemListItemDefaultStoryQuery.graphql';
import { withProviders } from '../../../../shared/utils/storybook';
import { CrudDemoItemListItem, CrudDemoItemListItemProps } from './crudDemoItemListItem.component';

export default {
  title: 'CrudDemoItem / CrudDemoItemList / CrudDemoItemListItem',
  component: CrudDemoItemListItem,
  argTypes: {
    item: {
      control: {
        type: null,
      },
    },
  },
};

const Template: Story<CrudDemoItemListItemProps> = (args) => {
  const data = useLazyLoadQuery<crudDemoItemListItemDefaultStoryQuery>(
    graphql`
      query crudDemoItemListItemDefaultStoryQuery @relay_test_operation {
        item: crudDemoItemById(id: "test-id") {
          ...crudDemoItemListItem
        }
      }
    `,
    {}
  );
  return data?.item ? <CrudDemoItemListItem {...args} item={data.item} /> : <span />;
};

const DefaultTemplate: Story<CrudDemoItemListItemProps> = (args) => {
  return (
    <Suspense fallback={<span>Loading...</span>}>
      <Template {...args} />
    </Suspense>
  );
};

const defaultRelayEnv = createMockEnvironment();
defaultRelayEnv.mock.queueOperationResolver((operation) => MockPayloadGenerator.generate(operation));

export const Default = DefaultTemplate.bind({});
Default.decorators = [
  withProviders({
    relayEnvironment: defaultRelayEnv,
  }),
];
Default.args = {};
