import {
  fillPaginationItemListQuery,
  paginationListTestQuery,
  paginationTestItemFactory,
} from '../../../tests/factories';
import { renderHook } from '../../../tests/utils/rendering';
import { usePaginatedQuery } from '../usePaginatedQuery.hook';

describe('usePaginationQuery: Hook', () => {
  it('should fetch all data', async () => {
    const dataLength = 9;
    const allItems = [...Array(dataLength)].map((_, i) =>
      paginationTestItemFactory({
        id: `item-${i + 1}`,
      })
    );

    const mockedResponse = fillPaginationItemListQuery(allItems);

    const { result, waitForApolloMocks } = renderHook(
      () =>
        usePaginatedQuery(paginationListTestQuery, {
          hookOptions: {},
          dataKey: 'allNotifications',
        }),
      {
        apolloMocks: (defaultMocks) => defaultMocks.concat(mockedResponse),
      }
    );

    await waitForApolloMocks(1);

    expect(result.current.data?.allNotifications?.edges.length).toBe(dataLength);
  });
});
