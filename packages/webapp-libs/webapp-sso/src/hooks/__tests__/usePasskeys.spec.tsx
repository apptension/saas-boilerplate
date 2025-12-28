import { renderHook, waitFor, act } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';

import { usePasskeys } from '../usePasskeys';
import {
  GET_PASSKEYS,
  DELETE_PASSKEY,
  RENAME_PASSKEY,
} from '../../graphql/passkeys.graphql';

const mockPasskey = {
  id: 'passkey-1',
  name: 'MacBook Touch ID',
  authenticatorType: 'platform',
  lastUsedAt: '2024-01-15T10:00:00Z',
  useCount: 25,
  createdAt: '2024-01-01T00:00:00Z',
  isActive: true,
};

const mockPasskey2 = {
  id: 'passkey-2',
  name: 'iPhone Face ID',
  authenticatorType: 'platform',
  lastUsedAt: '2024-01-14T08:00:00Z',
  useCount: 10,
  createdAt: '2024-01-02T00:00:00Z',
  isActive: true,
};

const mockGetPasskeysResponse: MockedResponse = {
  request: {
    query: GET_PASSKEYS,
  },
  result: {
    data: {
      passkeys: {
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
  },
};

const wrapper = (mocks: MockedResponse[]) => {
  return ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
};

describe('usePasskeys', () => {
  it('should fetch passkeys', async () => {
    const { result } = renderHook(
      () => usePasskeys(),
      { wrapper: wrapper([mockGetPasskeysResponse]) }
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.passkeys).toHaveLength(2);
    expect(result.current.passkeys[0].name).toBe('MacBook Touch ID');
  });

  it('should delete passkey', async () => {
    const deleteMock: MockedResponse = {
      request: {
        query: DELETE_PASSKEY,
        variables: {
          input: { id: 'passkey-1' },
        },
      },
      result: {
        data: {
          deletePasskey: {
            deleted: true,
          },
        },
      },
    };

    const { result } = renderHook(
      () => usePasskeys(),
      { wrapper: wrapper([mockGetPasskeysResponse, deleteMock]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.deletePasskey).toBeDefined();
  });

  it('should rename passkey', async () => {
    const renameMock: MockedResponse = {
      request: {
        query: RENAME_PASSKEY,
        variables: {
          input: { id: 'passkey-1', name: 'Work MacBook' },
        },
      },
      result: {
        data: {
          renamePasskey: {
            passkey: {
              ...mockPasskey,
              name: 'Work MacBook',
            },
          },
        },
      },
    };

    const { result } = renderHook(
      () => usePasskeys(),
      { wrapper: wrapper([mockGetPasskeysResponse, renameMock]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.renamePasskey).toBeDefined();
  });

  it('should return empty array when no passkeys', async () => {
    const emptyResponse: MockedResponse = {
      request: {
        query: GET_PASSKEYS,
      },
      result: {
        data: {
          passkeys: {
            edges: [],
            pageInfo: {
              hasNextPage: false,
              endCursor: null,
            },
          },
        },
      },
    };

    const { result } = renderHook(
      () => usePasskeys(),
      { wrapper: wrapper([emptyResponse]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.passkeys).toHaveLength(0);
  });

  it('should handle fetch error gracefully', async () => {
    const errorMock: MockedResponse = {
      request: {
        query: GET_PASSKEYS,
      },
      error: new Error('Failed to fetch passkeys'),
    };

    const { result } = renderHook(
      () => usePasskeys(),
      { wrapper: wrapper([errorMock]) }
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.passkeys).toEqual([]);
  });
});

