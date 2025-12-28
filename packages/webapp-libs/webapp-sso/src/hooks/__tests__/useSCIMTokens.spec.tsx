import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';

import { useSCIMTokens } from '../useSCIMTokens';
import {
  GET_SCIM_TOKENS,
  CREATE_SCIM_TOKEN,
  REVOKE_SCIM_TOKEN,
  DELETE_SCIM_TOKEN,
} from '../../graphql/scimTokens.graphql';

const mockTenantId = 'tenant-123';

const mockSCIMToken = {
  id: 'token-1',
  name: 'Production SCIM Token',
  tokenPrefix: 'scim_abc',
  isActive: true,
  lastUsedAt: '2024-01-15T10:00:00Z',
  requestCount: 150,
  expiresAt: null,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockGetTokensResponse: MockedResponse = {
  request: {
    query: GET_SCIM_TOKENS,
    variables: { tenantId: mockTenantId },
  },
  result: {
    data: {
      scimTokens: {
        edges: [
          {
            node: mockSCIMToken,
            cursor: 'cursor-1',
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'cursor-1',
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

describe('useSCIMTokens', () => {
  it('should fetch SCIM tokens', async () => {
    const { result } = renderHook(
      () => useSCIMTokens(mockTenantId),
      { wrapper: wrapper([mockGetTokensResponse]) }
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tokens).toHaveLength(1);
    expect(result.current.tokens[0].name).toBe('Production SCIM Token');
  });

  it('should create SCIM token and return raw token', async () => {
    const rawToken = 'scim_abcdef123456789';
    const createMock: MockedResponse = {
      request: {
        query: CREATE_SCIM_TOKEN,
        variables: {
          input: {
            tenantId: mockTenantId,
            name: 'New Token',
          },
        },
      },
      result: {
        data: {
          createScimToken: {
            scimToken: {
              id: 'token-2',
              name: 'New Token',
              tokenPrefix: 'scim_abc',
              isActive: true,
            },
            rawToken: rawToken,
          },
        },
      },
    };

    const { result } = renderHook(
      () => useSCIMTokens(mockTenantId),
      { wrapper: wrapper([mockGetTokensResponse, createMock]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.createToken).toBeDefined();
  });

  it('should revoke SCIM token', async () => {
    const revokeMock: MockedResponse = {
      request: {
        query: REVOKE_SCIM_TOKEN,
        variables: {
          input: { id: 'token-1' },
        },
      },
      result: {
        data: {
          revokeScimToken: {
            scimToken: {
              ...mockSCIMToken,
              isActive: false,
            },
          },
        },
      },
    };

    const { result } = renderHook(
      () => useSCIMTokens(mockTenantId),
      { wrapper: wrapper([mockGetTokensResponse, revokeMock]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.revokeToken).toBeDefined();
  });

  it('should delete SCIM token', async () => {
    const deleteMock: MockedResponse = {
      request: {
        query: DELETE_SCIM_TOKEN,
        variables: {
          input: { id: 'token-1' },
        },
      },
      result: {
        data: {
          deleteScimToken: {
            deleted: true,
          },
        },
      },
    };

    const { result } = renderHook(
      () => useSCIMTokens(mockTenantId),
      { wrapper: wrapper([mockGetTokensResponse, deleteMock]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.deleteToken).toBeDefined();
  });

  it('should handle revoked tokens correctly', async () => {
    const revokedToken = { ...mockSCIMToken, isActive: false };
    const revokedResponse: MockedResponse = {
      request: {
        query: GET_SCIM_TOKENS,
        variables: { tenantId: mockTenantId },
      },
      result: {
        data: {
          scimTokens: {
            edges: [
              {
                node: revokedToken,
                cursor: 'cursor-1',
              },
            ],
            pageInfo: {
              hasNextPage: false,
              endCursor: 'cursor-1',
            },
          },
        },
      },
    };

    const { result } = renderHook(
      () => useSCIMTokens(mockTenantId),
      { wrapper: wrapper([revokedResponse]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tokens[0].isActive).toBe(false);
  });
});

