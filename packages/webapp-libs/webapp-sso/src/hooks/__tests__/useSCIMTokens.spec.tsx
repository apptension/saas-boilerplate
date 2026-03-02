import { waitFor } from '@testing-library/react';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';

import {
  useSCIMTokens,
  SCIM_TOKENS_QUERY,
  CREATE_SCIM_TOKEN,
  REVOKE_SCIM_TOKEN,
} from '../useSCIMTokens';
import { renderHook } from '../../tests/utils/rendering';

const mockTenantId = 'tenant-123';

const mockSCIMToken = {
  id: 'token-1',
  name: 'Production SCIM Token',
  tokenPrefix: 'scim_abc',
  isActive: true,
  lastUsedAt: '2024-01-15T10:00:00Z',
  lastUsedIp: '192.168.1.100',
  requestCount: 150,
  expiresAt: null,
  createdAt: '2024-01-01T00:00:00Z',
};

const mockGetTokensResponse = composeMockedQueryResult(SCIM_TOKENS_QUERY, {
  variables: { tenantId: mockTenantId },
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
});

describe('useSCIMTokens', () => {
  it('should fetch SCIM tokens', async () => {
    const { result, waitForApolloMocks } = renderHook(
      () => useSCIMTokens(mockTenantId),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetTokensResponse) }
    );

    // Wait for SCIM_TOKENS_QUERY mock (index 1, since CommonQuery is index 0)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tokens).toHaveLength(1);
    expect(result.current.tokens[0].name).toBe('Production SCIM Token');
  });

  it('should create SCIM token and return raw token', async () => {
    const rawToken = 'scim_abcdef123456789';
    const createMock = composeMockedQueryResult(CREATE_SCIM_TOKEN, {
      variables: {
        input: {
          tenantId: mockTenantId,
          name: 'New Token',
        },
      },
      data: {
        createScimToken: {
          scimToken: {
            id: 'token-2',
            name: 'New Token',
            tokenPrefix: 'scim_abc',
          },
          rawToken: rawToken,
        },
      },
    });

    // Add refetch mock
    const refetchMock = composeMockedQueryResult(SCIM_TOKENS_QUERY, {
      variables: { tenantId: mockTenantId },
      data: {
        scimTokens: {
          edges: [
            {
              node: mockSCIMToken,
              cursor: 'cursor-1',
            },
            {
              node: {
                id: 'token-2',
                name: 'New Token',
                tokenPrefix: 'scim_abc',
                isActive: true,
                lastUsedAt: null,
                lastUsedIp: null,
                requestCount: 0,
                expiresAt: null,
                createdAt: '2024-01-15T00:00:00Z',
              },
              cursor: 'cursor-2',
            },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: 'cursor-2',
          },
        },
      },
    });

    const { result, waitForApolloMocks } = renderHook(
      () => useSCIMTokens(mockTenantId),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetTokensResponse, createMock, refetchMock) }
    );

    // Wait for SCIM_TOKENS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.createToken).toBeDefined();
  });

  it('should revoke SCIM token', async () => {
    const revokeMock = composeMockedQueryResult(REVOKE_SCIM_TOKEN, {
      variables: {
        id: 'token-1',
        tenantId: mockTenantId,
      },
      data: {
        revokeScimToken: {
          ok: true,
        },
      },
    });

    const { result, waitForApolloMocks } = renderHook(
      () => useSCIMTokens(mockTenantId),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetTokensResponse, revokeMock) }
    );

    // Wait for SCIM_TOKENS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.revokeToken).toBeDefined();
  });

  it('should revoke SCIM token (delete functionality)', async () => {
    const revokeMock = composeMockedQueryResult(REVOKE_SCIM_TOKEN, {
      variables: {
        id: 'token-1',
        tenantId: mockTenantId,
      },
      data: {
        revokeScimToken: {
          ok: true,
        },
      },
    });

    // Add refetch mock
    const refetchMock = composeMockedQueryResult(SCIM_TOKENS_QUERY, {
      variables: { tenantId: mockTenantId },
      data: {
        scimTokens: {
          edges: [
            {
              node: { ...mockSCIMToken, isActive: false },
              cursor: 'cursor-1',
            },
          ],
          pageInfo: {
            hasNextPage: false,
            endCursor: 'cursor-1',
          },
        },
      },
    });

    const { result, waitForApolloMocks } = renderHook(
      () => useSCIMTokens(mockTenantId),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetTokensResponse, revokeMock, refetchMock) }
    );

    // Wait for SCIM_TOKENS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.revokeToken).toBeDefined();
  });

  it('should handle revoked tokens correctly', async () => {
    const revokedToken = { ...mockSCIMToken, isActive: false };
    const revokedResponse = composeMockedQueryResult(SCIM_TOKENS_QUERY, {
      variables: { tenantId: mockTenantId },
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
    });

    const { result, waitForApolloMocks } = renderHook(
      () => useSCIMTokens(mockTenantId),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(revokedResponse) }
    );

    // Wait for SCIM_TOKENS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tokens[0].isActive).toBe(false);
  });
});

