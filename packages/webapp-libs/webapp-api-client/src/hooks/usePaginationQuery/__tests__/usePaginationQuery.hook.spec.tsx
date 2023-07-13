import { act } from '@testing-library/react-hooks';

import {
  fillPaginationItemListQuery,
  paginationListTestQuery,
  paginationTestItemFactory,
} from '../../../tests/factories';
import { renderHook } from '../../../tests/utils/rendering';
import { usePaginatedQuery } from '../usePaginatedQuery.hook';

describe('usePaginationQuery: Hook', () => {
  it('should paginate and fetch data in both directions', async () => {
    const initDataLength = 9;
    const nextDataLength = 1;
    const previousDataLength = 9;

    const initData = [...Array(initDataLength)].map((_, i) =>
      paginationTestItemFactory({
        id: `item-${i + 1}`,
      })
    );

    const nextData = [...Array(nextDataLength)].map((_, i) =>
      paginationTestItemFactory({
        id: `item-${i + 1}`,
      })
    );

    const previousData = [...Array(previousDataLength)].map((_, i) =>
      paginationTestItemFactory({
        id: `item-${i + 1}`,
      })
    );

    const initMockedResponse = fillPaginationItemListQuery(
      initData,
      {
        startCursor: '',
        endCursor: '',
        hasNextPage: true,
        hasPreviousPage: false,
      },
      { first: 8 }
    );

    const nextMockedResponse = fillPaginationItemListQuery(
      nextData,
      {
        startCursor: '',
        endCursor: '',
        hasNextPage: false,
        hasPreviousPage: true,
      },
      { first: 8, after: '' }
    );

    const previousMockedResponse = fillPaginationItemListQuery(
      previousData,
      {
        startCursor: '',
        endCursor: '',
        hasNextPage: true,
        hasPreviousPage: false,
      },
      { first: 8, after: undefined }
    );

    const { result, waitForApolloMocks } = renderHook(
      () =>
        usePaginatedQuery(paginationListTestQuery, {
          hookOptions: {
            variables: {
              first: 8,
            },
          },
          dataKey: 'allNotifications',
        }),
      {
        apolloMocks: (defaultMocks) =>
          defaultMocks.concat(initMockedResponse, nextMockedResponse, previousMockedResponse),
      }
    );

    await waitForApolloMocks(1);

    expect(result.current.data?.allNotifications?.edges.length).toBe(initDataLength);

    await act(async () => {
      result.current.loadNext();
    });

    await waitForApolloMocks(2);

    expect(result.current.data?.allNotifications?.edges.length).toBe(nextDataLength);

    await act(async () => {
      result.current.loadPrevious();
    });

    await waitForApolloMocks(3);

    expect(result.current.data?.allNotifications?.edges.length).toBe(previousDataLength);
  });
});
