import { Story } from '@storybook/react';
import { useLazyLoadQuery } from 'react-relay';
import graphql from 'babel-plugin-relay/macro';
import { MockPayloadGenerator } from 'relay-test-utils';
import { withProviders, withSuspense } from '../../../../shared/utils/storybook';
import { crudDemoItemListItemDefaultStoryQuery } from './__generated__/crudDemoItemListItemDefaultStoryQuery.graphql';
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

const Template: Story<CrudDemoItemListItemProps> = (args: CrudDemoItemListItemProps) => {
  const data = useLazyLoadQuery<crudDemoItemListItemDefaultStoryQuery>(
    graphql`
      query crudDemoItemListItemDefaultStoryQuery @relay_test_operation {
        item: crudDemoItem(id: "test-id") {
          ...crudDemoItemListItem
        }
      }
    `,
    {}
  );
  return data.item ? <CrudDemoItemListItem {...args} item={data.item} /> : <span />;
};

export const Default = Template.bind({});
Default.decorators = [
  withSuspense,
  withProviders({
    relayEnvironment: (env) => {
      env.mock.queueOperationResolver((operation) => MockPayloadGenerator.generate(operation));
    },
  }),
];
Default.args = {};
