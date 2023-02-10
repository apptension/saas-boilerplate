import { useQuery } from '@apollo/client';
import { Story } from '@storybook/react';
import { append } from 'ramda';

import { gql } from '../../../../shared/services/graphqlApi/__generated/gql';
import { withProviders } from '../../../../shared/utils/storybook';
import { composeMockedQueryResult } from '../../../../tests/utils/fixtures';
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

const CRUD_DEMO_ITEM_LIST_ITEM_TEST_QUERY = gql(/* GraphQL */ `
  query crudDemoItemListItemDefaultStoryQuery {
    item: crudDemoItem(id: "test-id") {
      ...crudDemoItemListItem
    }
  }
`);

const Template: Story<CrudDemoItemListItemProps> = (args: CrudDemoItemListItemProps) => {
  const { loading, data } = useQuery(CRUD_DEMO_ITEM_LIST_ITEM_TEST_QUERY);
  return !loading && data?.item ? <CrudDemoItemListItem {...args} item={data.item} /> : <span />;
};

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    apolloMocks: append(
      composeMockedQueryResult(CRUD_DEMO_ITEM_LIST_ITEM_TEST_QUERY, {
        data: {
          item: {
            __typename: 'CrudDemoItemType',
            id: 1,
            name: 'Demo item name',
          },
        },
      })
    ),
  }),
];
Default.args = {};
