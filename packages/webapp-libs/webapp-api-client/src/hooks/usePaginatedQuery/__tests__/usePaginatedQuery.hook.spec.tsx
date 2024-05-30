import { MockedResponse } from '@apollo/client/testing';
import { waitFor } from '@testing-library/react';
import { act } from 'react';

import { fillPaginationItemListQuery, paginationTestItemFactory } from '../../../tests/factories';
import { renderHook } from '../../../tests/utils/rendering';
import { usePaginatedQuery } from '../usePaginatedQuery.hook';
import { paginationListTestQuery } from './usePaginatedQuery.graphql';

describe('usePaginationQuery: Hook', () => {
  const initDataLength = 8;
  const initData = [...Array(initDataLength)].map((_, i) =>
    paginationTestItemFactory({
      id: `item-${i + 1}`,
    })
  );

  const init = async (mock?: MockedResponse<Record<string, any>, Record<string, any>>) => {
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
    const useEffectCleanMock = initMockedResponse;

    const mocks = mock ? [initMockedResponse, mock, useEffectCleanMock] : [initMockedResponse, useEffectCleanMock];

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
        apolloMocks: (defaultMocks) => defaultMocks.concat(...mocks),
      }
    );

    return { result, waitForApolloMocks };
  };

  it('should fetch page', async () => {
    const { result, waitForApolloMocks } = await init();
    await waitForApolloMocks(1);

    const {
      current: { data },
    } = result;

    const firstItem = data?.allNotifications?.edges[0]?.node;

    expect(firstItem?.id).toBe('item-1');

    expect(data?.allNotifications?.edges.length).toBe(initDataLength);
    await waitForApolloMocks();
  });

  it('should fetch next page', async () => {
    const nextDataLength = 4;
    const nextData = [...Array(nextDataLength)].map((_, i) =>
      paginationTestItemFactory({
        id: `item-${i + 1}`,
      })
    );
    const mock = fillPaginationItemListQuery(
      nextData,
      {
        startCursor: '',
        endCursor: '',
        hasNextPage: true,
        hasPreviousPage: false,
      },
      { first: 8, after: '' }
    );
    const { result, waitForApolloMocks } = await init(mock);
    await waitForApolloMocks(1);

    await act(async () => {
      result.current.loadNext();
    });

    await waitForApolloMocks(1);

    await waitFor(() => expect(result.current.data?.allNotifications?.edges.length).toBe(nextDataLength));
  });

  it('should fetch previous page', async () => {
    const mock = fillPaginationItemListQuery(
      initData,
      {
        startCursor: '',
        endCursor: '',
        hasNextPage: true,
        hasPreviousPage: false,
      },
      { first: 8, after: undefined }
    );
    const { result, waitForApolloMocks } = await init(mock);
    await waitForApolloMocks(1);

    await act(async () => {
      result.current.loadPrevious();
    });

    await waitForApolloMocks(1);

    expect(result.current.data?.allNotifications?.edges.length).toBe(initDataLength);
  });
});
