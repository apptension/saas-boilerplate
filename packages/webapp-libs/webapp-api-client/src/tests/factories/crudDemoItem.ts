import { crudDemoItemListQuery } from '@sb/webapp-crud-demo/routes/crudDemoItem/crudDemoItemList/crudDemoItemList.component';

import { CrudDemoItemType } from '../../graphql';
import { composeMockedPaginatedListQueryResult, createDeepFactory, makeId } from '../utils';

export const crudDemoItemFactory = createDeepFactory<CrudDemoItemType>(() => ({
  id: makeId(32),
  name: 'Crud Demo Item Mock Name',
}));
export const fillCrudDemoItemPaginationListQuery = (
  items: Array<Partial<CrudDemoItemType>> = [],
  additionalData?: Record<string, any>
) => {
  return composeMockedPaginatedListQueryResult(
    crudDemoItemListQuery,
    'allCrudDemoItems',
    'CrudDemoItemType',
    {
      data: items,
      additionalData,
    },
    {
      endCursor: 'test',
      hasNextPage: false,
    }
  );
};
