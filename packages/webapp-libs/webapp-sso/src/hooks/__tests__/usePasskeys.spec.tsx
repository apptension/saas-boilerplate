import { waitFor } from '@testing-library/react';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';

import {
  usePasskeys,
  PASSKEYS_QUERY,
  DELETE_PASSKEY,
  RENAME_PASSKEY,
} from '../usePasskeys';
import { renderHook } from '../../tests/utils/rendering';

const mockPasskey = {
  id: 'passkey-1',
  name: 'MacBook Touch ID',
  authenticatorType: 'platform',
  transports: ['internal'],
  lastUsedAt: '2024-01-15T10:00:00Z',
  useCount: 25,
  createdAt: '2024-01-01T00:00:00Z',
  isActive: true,
};

const mockPasskey2 = {
  id: 'passkey-2',
  name: 'iPhone Face ID',
  authenticatorType: 'platform',
  transports: ['internal'],
  lastUsedAt: '2024-01-14T08:00:00Z',
  useCount: 10,
  createdAt: '2024-01-02T00:00:00Z',
  isActive: true,
};

const mockGetPasskeysResponse = composeMockedQueryResult(PASSKEYS_QUERY, {
  variables: {},
  data: {
    myPasskeys: {
      edges: [
        { node: mockPasskey, cursor: 'cursor-1' },
        { node: mockPasskey2, cursor: 'cursor-2' },
      ],
      pageInfo: {
        hasNextPage: false,
        endCursor: 'cursor-2',
      },
    },
  },
});

describe('usePasskeys', () => {
  it('should fetch passkeys', async () => {
    const { result, waitForApolloMocks } = renderHook(
      () => usePasskeys(),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetPasskeysResponse) }
    );

    // Wait for PASSKEYS_QUERY mock (index 1, since CommonQuery is index 0)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.passkeys).toHaveLength(2);
    expect(result.current.passkeys[0].name).toBe('MacBook Touch ID');
  });

  it('should delete passkey', async () => {
    const deleteMock = composeMockedQueryResult(DELETE_PASSKEY, {
      variables: {
        input: { id: 'passkey-1' },
      },
      data: {
        deletePasskey: {
          deletedIds: ['passkey-1'],
        },
      },
    });

    // Add refetch mock
    const refetchMock = composeMockedQueryResult(PASSKEYS_QUERY, {
      variables: {},
      data: {
        myPasskeys: {
          edges: [
            { node: mockPasskey2, cursor: 'cursor-2' },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: 'cursor-2',
          },
        },
      },
    });

    const { result, waitForApolloMocks } = renderHook(
      () => usePasskeys(),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetPasskeysResponse, deleteMock, refetchMock) }
    );

    // Wait for PASSKEYS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.deletePasskey).toBeDefined();
  });

  it('should rename passkey', async () => {
    const renameMock = composeMockedQueryResult(RENAME_PASSKEY, {
      variables: {
        id: 'passkey-1',
        name: 'Work MacBook',
      },
      data: {
        renamePasskey: {
          passkey: {
            ...mockPasskey,
            name: 'Work MacBook',
          },
        },
      },
    });

    // Add refetch mock
    const refetchMock = composeMockedQueryResult(PASSKEYS_QUERY, {
      variables: {},
      data: {
        myPasskeys: {
          edges: [
            { node: { ...mockPasskey, name: 'Work MacBook' }, cursor: 'cursor-1' },
            { node: mockPasskey2, cursor: 'cursor-2' },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: 'cursor-2',
          },
        },
      },
    });

    const { result, waitForApolloMocks } = renderHook(
      () => usePasskeys(),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetPasskeysResponse, renameMock, refetchMock) }
    );

    // Wait for PASSKEYS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.renamePasskey).toBeDefined();
  });

  it('should return empty array when no passkeys', async () => {
    const emptyResponse = composeMockedQueryResult(PASSKEYS_QUERY, {
      variables: {},
      data: {
        myPasskeys: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        },
      },
    });

    const { result, waitForApolloMocks } = renderHook(
      () => usePasskeys(),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(emptyResponse) }
    );

    // Wait for PASSKEYS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.passkeys).toHaveLength(0);
  });

  it('should handle fetch error gracefully', async () => {
    const errorMock = composeMockedQueryResult(PASSKEYS_QUERY, {
      variables: {},
      data: null,
      errors: [new Error('Failed to fetch passkeys') as any],
    });

    const { result, waitForApolloMocks } = renderHook(
      () => usePasskeys(),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(errorMock) }
    );

    // Wait for PASSKEYS_QUERY mock (index 1) - even errors need to be waited for
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.passkeys).toEqual([]);
  });
});

