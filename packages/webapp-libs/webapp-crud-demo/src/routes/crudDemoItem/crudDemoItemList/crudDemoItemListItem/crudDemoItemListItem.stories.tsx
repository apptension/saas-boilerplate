import { useQuery } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils/fixtures';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';

import { withProviders } from '../../../../utils/storybook';
import { CrudDemoItemListItem, CrudDemoItemListItemProps } from './crudDemoItemListItem.component';

const meta: Meta = {
  title: 'Crud Demo Item / CrudDemoItemList / CrudDemoItemListItem',
  component: CrudDemoItemListItem,
  argTypes: {
    item: {
      control: {
        type: undefined,
      },
    },
  },
};

export default meta;

const crudDemoItemListItemTestQuery = gql(/* GraphQL */ `
  query crudDemoItemListItemDefaultStoryQuery {
    item: crudDemoItem(id: "test-id") {
      ...crudDemoItemListItem
    }
  }
`);

const Template: StoryFn<Partial<CrudDemoItemListItemProps>> = (args) => {
  const { loading, data } = useQuery(crudDemoItemListItemTestQuery);
  return !loading && data?.item ? <CrudDemoItemListItem {...args} item={data.item} /> : <span />;
};

export const Default: StoryObj<typeof meta> = {
  render: Template,
  decorators: [
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
  ],

  args: {},
};
