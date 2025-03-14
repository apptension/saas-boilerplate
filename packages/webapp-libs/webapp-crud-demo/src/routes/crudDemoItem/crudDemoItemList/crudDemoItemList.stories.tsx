import { CrudDemoItemSort } from '@sb/webapp-api-client';
import { DEFAULT_PAGE_SIZE } from '@sb/webapp-api-client/hooks/usePagedPaginatedQuery';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';

import {
  crudDemoItemFactory,
  fillCrudDemoItemListQuery,
  fillCrudDemoItemPaginationListQuery,
} from '../../../tests/factories';
import { withProviders } from '../../../utils/storybook';
import { CrudDemoItemList } from './crudDemoItemList.component';

const Template: StoryFn = () => {
  return <CrudDemoItemList />;
};

const allItems = [...Array(2)].map((_, i) =>
  crudDemoItemFactory({
    id: `item-${i + 1}`,
    name: `${i + 1} item`,
    createdBy: {
      firstName: `firstName${i + 1}`,
      lastName: `lastName${i + 1}`,
    },
    tenant: {
      name: `tenantName${i + 1}`,
    },
  })
);

const meta: Meta = {
  title: 'Crud Demo Item / CrudDemoItemList',
  component: CrudDemoItemList,
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
  decorators: [
    withProviders({
      apolloMocks: [
        fillCommonQueryWithUser(
          currentUserFactory({
            tenants: [
              tenantFactory({
                id: 'tenantId',
              }),
            ],
          })
        ),
        fillCrudDemoItemPaginationListQuery(
          allItems,
          {},
          { tenantId: 'tenantId', first: DEFAULT_PAGE_SIZE, sort: CrudDemoItemSort.NAME_ASC }
        ),
      ],
    }),
  ],
};
