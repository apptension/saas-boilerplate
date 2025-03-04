import { pagedPaginationListTestQuery } from '../../hooks/usePagedPaginatedQuery/__tests__/usePagedPaginatedQuery.graphql';
import { paginationListTestQuery } from '../../hooks/usePaginatedQuery/__tests__/usePaginatedQuery.graphql';
import {
  PageInfo,
  composeMockedPagesPaginatedListQueryResult,
  composeMockedPaginatedListQueryResult,
  createDeepFactory,
  makeId,
} from '../utils';
import { PageCursors } from '../../graphql';

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

export const fillPagedPaginationItemListQuery = (
  items: Array<Partial<{ id: string; name: string }>> = [],
  pageCursors: PageCursors,
  variables?: Record<string, any>
) => {
  return composeMockedPagesPaginatedListQueryResult(
    pagedPaginationListTestQuery,
    'allCrudDemoItems',
    'CrudDemoItemType',
    {
      data: items,
      variables: variables,
    },
    pageCursors
  );
};
