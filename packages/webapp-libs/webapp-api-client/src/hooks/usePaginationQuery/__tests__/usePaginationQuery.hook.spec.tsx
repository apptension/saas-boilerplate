import { TypedDocumentNode, gql } from '@apollo/client';

import { crudDemoItemFactory, fillCrudDemoItemPaginationListQuery } from '../../../tests/factories';
import { renderHook } from '../../../tests/utils/rendering';
import { usePaginationQuery } from '../usePaginationQuery.hook';
import {
  CrudDemoItemPaginationListTestQueryQuery,
  CrudDemoItemPaginationListTestQueryQueryVariables,
} from '@sb/webapp-api-client/graphql';

export const crudDemoItemPaginationListTestQuery: TypedDocumentNode<
  CrudDemoItemPaginationListTestQueryQuery,
  CrudDemoItemPaginationListTestQueryQueryVariables
> = gql(/* GraphQL */ `
  query crudDemoItemPaginationListTestQuery($first: Int, $after: String, $last: Int, $before: String) {
    allCrudDemoItems(first: $first, after: $after, last: $last, before: $before) {
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

describe('usePaginationQuery: Hook', () => {
  it('should fetch all data', async () => {
    const dataLength = 9;
    const allItems = [...Array(dataLength)].map((_, i) =>
      crudDemoItemFactory({
        id: `item-${i + 1}`,
      })
    );

    const mockedResponse = fillCrudDemoItemPaginationListQuery(allItems);
    const { result, waitForApolloMocks } = renderHook(
      () =>
        usePaginationQuery(crudDemoItemPaginationListTestQuery, {
          hookOptions: {},
          dataKey: 'allCrudDemoItems',
        }),
      {
        apolloMocks: (defaultMocks) => defaultMocks.concat(mockedResponse),
      }
    );

    await waitForApolloMocks(1);

    console.log(result.current.data?.allCrudDemoItems?.edges);
    expect(result.current.data?.allCrudDemoItems?.edges.length).toBe(dataLength);
  });
});
