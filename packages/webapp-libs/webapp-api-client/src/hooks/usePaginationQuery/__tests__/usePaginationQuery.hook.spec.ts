import { crudDemoItemListQuery } from '@sb/webapp-crud-demo/routes/crudDemoItem/crudDemoItemList/crudDemoItemList.component';

import { crudDemoItemFactory, fillCrudDemoItemPaginationListQuery } from '../../../tests/factories';
import { renderHook } from '../../../tests/utils/rendering';
import { usePaginationQuery } from '../usePaginationQuery.hook';

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
        usePaginationQuery(crudDemoItemListQuery, {
          hookOptions: {},
          dataKey: 'allCrudDemoItems',
        }),
      {
        apolloMocks: (defaultMocks) => defaultMocks.concat(mockedResponse),
      }
    );

    await waitForApolloMocks(1);

    expect(result.current.data?.allCrudDemoItems?.edges.length).toBe(dataLength);
  });
});
