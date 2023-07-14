import { PageInfo, composeMockedPaginatedListQueryResult, createDeepFactory, makeId } from '../utils';
import { paginationListTestQuery } from '@sb/webapp-api-client/hooks/usePaginatedQuery/__tests__/usePaginatedQuery.graphql';


export const paginationTestItemFactory = createDeepFactory<{ id: string; name: string }>(() => ({
  id: makeId(32),
  name: 'Crud Demo Item Mock Name',
}));

export const fillPaginationItemListQuery = (
  items: Array<Partial<{ id: string; name: string }>> = [],
  pageInfo: Pick<PageInfo, 'endCursor' | 'hasNextPage' | 'hasPreviousPage' | 'startCursor'>,
  variables?: Record<string, any>
) => {
  return composeMockedPaginatedListQueryResult(
    paginationListTestQuery,
    'allNotifications',
    'CrudDemoItemType',
    {
      data: items,
      variables: variables,
    },
    {
      ...pageInfo,
    }
  );
};
