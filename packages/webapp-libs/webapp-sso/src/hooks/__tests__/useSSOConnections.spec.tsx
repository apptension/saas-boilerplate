import { waitFor } from '@testing-library/react';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';

import {
  useSSOConnections,
  SSO_CONNECTIONS_QUERY,
  CREATE_SSO_CONNECTION,
  UPDATE_SSO_CONNECTION,
  DELETE_SSO_CONNECTION,
} from '../useSSOConnections';
import { renderHook } from '../../tests/utils/rendering';

const mockTenantId = 'tenant-123';

const mockSSOConnection = {
  id: 'sso-conn-1',
  name: 'Okta SAML',
  connectionType: 'SAML',
  status: 'ACTIVE',
  allowedDomains: null,
  jitProvisioningEnabled: true,
  samlEntityId: 'https://okta.example.com',
  samlSsoUrl: 'https://okta.example.com/sso',
  oidcIssuer: null,
  oidcClientId: null,
  lastLoginAt: null,
  loginCount: 0,
  createdAt: '2024-01-01T00:00:00Z',
  spMetadataUrl: null,
};

const mockGetConnectionsResponse = composeMockedQueryResult(SSO_CONNECTIONS_QUERY, {
  variables: { tenantId: mockTenantId },
  data: {
    ssoConnections: {
      edges: [
        {
          node: mockSSOConnection,
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

describe('useSSOConnections', () => {
  it('should fetch SSO connections', async () => {
    const { result, waitForApolloMocks } = renderHook(
      () => useSSOConnections(mockTenantId),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetConnectionsResponse) }
    );

    // Wait for SSO_CONNECTIONS_QUERY mock (index 1, since CommonQuery is index 0)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0].name).toBe('Okta SAML');
  });

  it('should handle fetch error', async () => {
    const errorMock = composeMockedQueryResult(SSO_CONNECTIONS_QUERY, {
      variables: { tenantId: mockTenantId },
      data: null,
      errors: [new Error('Network error') as any],
    });

    const { result, waitForApolloMocks } = renderHook(
      () => useSSOConnections(mockTenantId),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(errorMock) }
    );

    // Wait for SSO_CONNECTIONS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  it('should create SSO connection', async () => {
    const createMock = composeMockedQueryResult(CREATE_SSO_CONNECTION, {
      variables: {
        input: {
          tenantId: mockTenantId,
          name: 'New Connection',
          connectionType: 'OIDC',
        },
      },
      data: {
        createSsoConnection: {
          ssoConnection: {
            id: 'sso-conn-2',
            name: 'New Connection',
            connectionType: 'OIDC',
            status: 'DRAFT',
          },
        },
      },
    });

    // Add refetch mock for when mutation completes
    const refetchMock = composeMockedQueryResult(SSO_CONNECTIONS_QUERY, {
      variables: { tenantId: mockTenantId },
      data: {
        ssoConnections: {
          edges: [
            {
              node: mockSSOConnection,
              cursor: 'cursor-1',
            },
            {
              node: {
                id: 'sso-conn-2',
                name: 'New Connection',
                connectionType: 'OIDC',
                status: 'DRAFT',
                allowedDomains: null,
                jitProvisioningEnabled: false,
                samlEntityId: null,
                samlSsoUrl: null,
                oidcIssuer: 'https://oidc.example.com',
                oidcClientId: 'client-123',
                lastLoginAt: null,
                loginCount: 0,
                createdAt: '2024-01-15T00:00:00Z',
                spMetadataUrl: null,
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
      () => useSSOConnections(mockTenantId),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetConnectionsResponse, createMock, refetchMock) }
    );

    // Wait for SSO_CONNECTIONS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.createConnection).toBeDefined();
  });

  it('should update SSO connection', async () => {
    const updateMock = composeMockedQueryResult(UPDATE_SSO_CONNECTION, {
      variables: {
        input: {
          id: 'sso-conn-1',
          name: 'Updated Name',
        },
      },
      data: {
        updateSsoConnection: {
          ssoConnection: {
            ...mockSSOConnection,
            name: 'Updated Name',
          },
        },
      },
    });

    // Add refetch mock
    const refetchMock = composeMockedQueryResult(SSO_CONNECTIONS_QUERY, {
      variables: { tenantId: mockTenantId },
      data: {
        ssoConnections: {
          edges: [
            {
              node: { ...mockSSOConnection, name: 'Updated Name' },
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
      () => useSSOConnections(mockTenantId),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetConnectionsResponse, updateMock, refetchMock) }
    );

    // Wait for SSO_CONNECTIONS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateConnection).toBeDefined();
  });

  it('should delete SSO connection', async () => {
    const deleteMock = composeMockedQueryResult(DELETE_SSO_CONNECTION, {
      variables: {
        input: { id: 'sso-conn-1', tenantId: mockTenantId },
      },
      data: {
        deleteSsoConnection: {
          deletedIds: ['sso-conn-1'],
        },
      },
    });

    // Add refetch mock for empty list after deletion
    const refetchMock = composeMockedQueryResult(SSO_CONNECTIONS_QUERY, {
      variables: { tenantId: mockTenantId },
      data: {
        ssoConnections: {
          edges: [],
          pageInfo: {
            hasNextPage: false,
            endCursor: null,
          },
        },
      },
    });

    const { result, waitForApolloMocks } = renderHook(
      () => useSSOConnections(mockTenantId),
      { apolloMocks: (defaultMocks) => defaultMocks.concat(mockGetConnectionsResponse, deleteMock, refetchMock) }
    );

    // Wait for SSO_CONNECTIONS_QUERY mock (index 1)
    await waitForApolloMocks(1);
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.deleteConnection).toBeDefined();
  });

  it('should not fetch when tenantId is empty', async () => {
    const { result, waitForApolloMocks } = renderHook(
      () => useSSOConnections(''),
      { apolloMocks: (defaultMocks) => defaultMocks }
    );

    await waitForApolloMocks();
    
    await waitFor(() => {
      expect(result.current).not.toBeNull();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.connections).toEqual([]);
  });
});

