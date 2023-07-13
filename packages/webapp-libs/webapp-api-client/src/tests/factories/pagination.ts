import { gql } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { PageInfo, composeMockedPaginatedListQueryResult, createDeepFactory, makeId } from '../utils';
import { PaginationListTestQueryQuery, PaginationListTestQueryQueryVariables } from '@sb/webapp-api-client/graphql';


export const paginationListTestQuery: TypedDocumentNode<
  PaginationListTestQueryQuery,
  PaginationListTestQueryQueryVariables
> = gql(/* GraphQL */ `
  query paginationListTestQuery($first: Int, $after: String, $last: Int, $before: String) {
    allNotifications(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`);

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
