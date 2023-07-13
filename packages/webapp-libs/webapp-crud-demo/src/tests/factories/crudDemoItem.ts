import { CrudDemoItemType } from '@sb/webapp-api-client';
import {
  composeMockedListQueryResult,
  composeMockedPaginatedListQueryResult,
  composeMockedQueryResult,
  createDeepFactory,
  makeId,
} from '@sb/webapp-api-client/tests/utils';

import { crudDemoItemDetailsQuery } from '../../routes/crudDemoItem/crudDemoItemDetails/crudDemoItemDetails.component';
import { crudDemoItemListQuery } from '../../routes/crudDemoItem/crudDemoItemList/crudDemoItemList.component';
import { editCrudDemoItemQuery } from '../../routes/crudDemoItem/editCrudDemoItem/editCrudDemoItem.graphql';

export const fillCrudDemoItemDetailsQuery = (
  data = {
    name: 'Demo item name',
  },
  variables = {}
) => {
  return composeMockedQueryResult(crudDemoItemDetailsQuery, {
    variables,
    data: {
      crudDemoItem: data,
    },
  });
};

export const fillEditCrudDemoItemQuery = (
  data: object = {
    name: 'Default name',
  },
  variables = {}
) => {
  return composeMockedQueryResult(editCrudDemoItemQuery, {
    data: {
      crudDemoItem: data,
    },
    variables,
  });
};

export const fillCrudDemoItemListQuery = (
  data = [
    { id: 1, name: 'First item' },
    { id: 2, name: 'Second item' },
  ]
) => {
  return composeMockedListQueryResult(crudDemoItemListQuery, 'allCrudDemoItems', 'CrudDemoItemType', {
    data,
  });
};

export const crudDemoItemFactory = createDeepFactory<CrudDemoItemType>(() => ({
  id: makeId(32),
  name: 'Crud Demo Item Mock Name',
}));

export const fillCrudDemoItemPaginationListQuery = (
  items: Array<Partial<CrudDemoItemType>> = [],
  additionalData?: Record<string, any>,
  variables?: Record<string, any>
) => {
  return composeMockedPaginatedListQueryResult(
    crudDemoItemListQuery,
    'allCrudDemoItems',
    'CrudDemoItemType',
    {
      data: items,
      variables: variables,
      additionalData,
    },
    {
      endCursor: 'test',
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: 'test',
    }
  );
};
