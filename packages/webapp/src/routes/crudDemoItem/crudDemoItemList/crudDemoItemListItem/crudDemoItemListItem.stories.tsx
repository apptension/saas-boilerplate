import { useQuery } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils/fixtures';
import { Story } from '@storybook/react';
import { append } from 'ramda';

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

const crudDemoItemListItemTestQuery = gql(/* GraphQL */ `
  query crudDemoItemListItemDefaultStoryQuery {
    item: crudDemoItem(id: "test-id") {
      ...crudDemoItemListItem
    }
  }
`);

const Template: Story<CrudDemoItemListItemProps> = (args: CrudDemoItemListItemProps) => {
  const { loading, data } = useQuery(crudDemoItemListItemTestQuery);
  return !loading && data?.item ? <CrudDemoItemListItem {...args} item={data.item} /> : <span />;
};

export const Default = Template.bind({});
Default.decorators = [
  withProviders({
    apolloMocks: append(
      composeMockedQueryResult(crudDemoItemListItemTestQuery, {
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
