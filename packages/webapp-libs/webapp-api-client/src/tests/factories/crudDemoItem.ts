import { CrudDemoItemType } from '../../graphql';
import { crudDemoItemListItemTestQuery } from '../../hooks/usePaginationQuery/__tests__/usePaginationQuery.hook.spec';
import { composeMockedPaginatedListQueryResult, createDeepFactory, makeId } from '../utils';

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
    crudDemoItemListItemTestQuery,
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
    }
  );
};
