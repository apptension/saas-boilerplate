import { MockedResponse } from '@apollo/client/testing';
import { waitFor } from '@testing-library/react';
import { act } from 'react';

import { fillPagedPaginationItemListQuery, paginationTestItemFactory } from '../../../tests/factories';
import { renderHook } from '../../../tests/utils/rendering';
import { usePagedPaginatedQuery } from '../usePagedPaginatedQuery.hook';
import { pagedPaginationListTestQuery } from './usePagedPaginatedQuery.graphql';

describe('usePagedPaginatedQuery: Hook', () => {
  const initDataLength = 10;
  const initData = [...Array(initDataLength)].map((_, i) =>
    paginationTestItemFactory({
      id: `item-${i + 1}`,
    })
  );

  const init = async (mock?: MockedResponse<Record<string, any>, Record<string, any>>) => {
    const pageCursors = {
      around: [
        { cursor: 'page-1', isCurrent: true, page: 1 },
        { cursor: 'page-2', isCurrent: false, page: 2 },
      ],
      first: null,
      last: null,
      next: {
        cursor: 'next-cursor',
        isCurrent: false,
        page: 2,
      },
      previous: null,
    };

    const initMockedResponse = fillPagedPaginationItemListQuery(initData, pageCursors, { first: 10 });
    const useEffectCleanMock = initMockedResponse;

    const mocks = mock ? [initMockedResponse, mock, useEffectCleanMock] : [initMockedResponse, useEffectCleanMock];

    const { result, waitForApolloMocks } = renderHook(
      () =>
        usePagedPaginatedQuery(pagedPaginationListTestQuery, {
          hookOptions: {
            variables: {
              first: 10,
            },
          },
          dataKey: 'allCrudDemoItems',
        }),
      {
        apolloMocks: (defaultMocks) => defaultMocks.concat(...mocks),
      }
    );

    await waitForApolloMocks();
    return { result, waitForApolloMocks };
  };

  it('should fetch initial page with correct data and pagination info', async () => {
    const { result } = await init();
    console.log('result', result);

    expect(result.current.loading).toBe(false);
    expect(result.current.data?.allCrudDemoItems?.edges).toHaveLength(initDataLength);

    const firstItem = result.current.data?.allCrudDemoItems?.edges[0]?.node;
    expect(firstItem?.id).toBe('item-1');

    const pageCursors = result.current.data?.allCrudDemoItems?.pageCursors;
    expect(pageCursors?.next?.page).toBe(2);
    expect(pageCursors?.around).toHaveLength(2);
    expect(pageCursors?.around[0].isCurrent).toBe(true);
  });

  it('should handle page size correctly', async () => {
    const { result } = await init();

    expect(result.current.pageSize).toBe(10);

    await act(async () => {
      result.current.handlePageSizeChange(25);
    });

    expect(result.current.pageSize).toBe(25);
  });

  it('should handle cursor navigation', async () => {
    const nextPageData = [...Array(10)].map((_, i) =>
      paginationTestItemFactory({
        id: `item-${i + 11}`,
      })
    );

    const nextPageCursors = {
      around: [
        { cursor: 'page-1', isCurrent: false, page: 1 },
        { cursor: 'page-2', isCurrent: true, page: 2 },
      ],
      first: null,
      last: null,
      next: {
        cursor: 'next-cursor-2',
        isCurrent: false,
        page: 3,
      },
      previous: {
        cursor: 'page-1',
        isCurrent: false,
        page: 1,
      },
    };

    const nextPageMock = fillPagedPaginationItemListQuery(nextPageData, nextPageCursors, {
      first: 10,
      after: 'next-cursor',
    });

    const { result } = await init(nextPageMock);

    result.current.onPageClick('next-cursor');

    await waitFor(() => {
      expect(result.current.data?.allCrudDemoItems?.edges[0]?.node.id).toBe('item-11');
      expect(result.current.data?.allCrudDemoItems?.pageCursors?.previous?.page).toBe(1);
    });
  });

  it('should handle search params changes', async () => {
    const { result } = await init();

    result.current.onSearchChangeWithCursorClear({ search: 'test-query', pageSize: '10' });

    await waitFor(() => {
      expect(result.current.searchParams).toEqual(
        expect.objectContaining({
          search: 'test-query',
          pageSize: '10',
        })
      );
      expect(result.current.searchParams).not.toHaveProperty('cursor');
    });
  });

  it('should handle search reset', async () => {
    const { result } = await init();

    result.current.onSearchChangeWithCursorClear({ search: 'test-query', pageSize: '25' });

    await act(async () => {
      result.current.onSearchReset();
    });

    expect(result.current.searchParams).toEqual({});
    expect(result.current.pageSize).toBe(10);
  });

  it('should handle toolbar search params', async () => {
    const searchParamsMock = fillPagedPaginationItemListQuery(
      initData,
      {
        around: [{ cursor: 'page-1', isCurrent: true, page: 1 }],
        first: null,
        last: null,
        next: null,
        previous: null,
      },
      {
        first: 10,
        search: 'test',
        filter: 'active',
        sortBy: 'name',
      }
    );

    const { result } = await init(searchParamsMock);

    result.current.onSearchChangeWithCursorClear({
      search: 'test',
      filter: 'active',
      pageSize: '10',
      sortBy: 'name',
    });

    await waitFor(() => {
      expect(result.current.toolbarSearchParams).toEqual(
        expect.objectContaining({
          search: 'test',
          filter: 'active',
          sortBy: 'name',
        })
      );
      expect(result.current.toolbarSearchParams).not.toHaveProperty('pageSize');
    });
  });

  it('should handle direct loadCursor call', async () => {
    const nextPageData = [...Array(10)].map((_, i) =>
      paginationTestItemFactory({
        id: `item-${i + 11}`,
      })
    );

    const nextPageCursors = {
      around: [
        { cursor: 'page-1', isCurrent: false, page: 1 },
        { cursor: 'page-2', isCurrent: true, page: 2 },
      ],
      first: null,
      last: null,
      next: null,
      previous: {
        cursor: 'page-1',
        isCurrent: false,
        page: 1,
      },
    };

    const nextPageMock = fillPagedPaginationItemListQuery(nextPageData, nextPageCursors, {
      first: 10,
      after: 'direct-cursor',
    });

    const { result } = await init(nextPageMock);

    result.current.loadCursor('direct-cursor');

    await waitFor(() => {
      expect(result.current.data?.allCrudDemoItems?.edges[0]?.node.id).toBe('item-11');
    });
  });

  it('should handle invalid page size gracefully', async () => {
    const { result } = await init();

    await act(async () => {
      result.current.onSearchChangeWithCursorClear({ pageSize: '999' });
    });

    expect(result.current.pageSize).toBe(10);
  });
});
