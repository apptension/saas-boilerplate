import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ReactNode } from 'react';

import { useSSOConnections } from '../useSSOConnections';
import {
  GET_SSO_CONNECTIONS,
  CREATE_SSO_CONNECTION,
  UPDATE_SSO_CONNECTION,
  DELETE_SSO_CONNECTION,
} from '../../graphql/ssoConnections.graphql';

const mockTenantId = 'tenant-123';

const mockSSOConnection = {
  id: 'sso-conn-1',
  name: 'Okta SAML',
  connectionType: 'SAML',
  status: 'ACTIVE',
  jitProvisioningEnabled: true,
  samlEntityId: 'https://okta.example.com',
  samlSsoUrl: 'https://okta.example.com/sso',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockGetConnectionsResponse: MockedResponse = {
  request: {
    query: GET_SSO_CONNECTIONS,
    variables: { tenantId: mockTenantId },
  },
  result: {
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
  },
};

const wrapper = (mocks: MockedResponse[]) => {
  return ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  );
};

describe('useSSOConnections', () => {
  it('should fetch SSO connections', async () => {
    const { result } = renderHook(
      () => useSSOConnections(mockTenantId),
      { wrapper: wrapper([mockGetConnectionsResponse]) }
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.connections).toHaveLength(1);
    expect(result.current.connections[0].name).toBe('Okta SAML');
  });

  it('should handle fetch error', async () => {
    const errorMock: MockedResponse = {
      request: {
        query: GET_SSO_CONNECTIONS,
        variables: { tenantId: mockTenantId },
      },
      error: new Error('Network error'),
    };

    const { result } = renderHook(
      () => useSSOConnections(mockTenantId),
      { wrapper: wrapper([errorMock]) }
    );

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });

  it('should create SSO connection', async () => {
    const createMock: MockedResponse = {
      request: {
        query: CREATE_SSO_CONNECTION,
        variables: {
          input: {
            tenantId: mockTenantId,
            name: 'New Connection',
            connectionType: 'OIDC',
          },
        },
      },
      result: {
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
      },
    };

    const { result } = renderHook(
      () => useSSOConnections(mockTenantId),
      { wrapper: wrapper([mockGetConnectionsResponse, createMock]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.createConnection).toBeDefined();
  });

  it('should update SSO connection', async () => {
    const updateMock: MockedResponse = {
      request: {
        query: UPDATE_SSO_CONNECTION,
        variables: {
          input: {
            id: 'sso-conn-1',
            name: 'Updated Name',
          },
        },
      },
      result: {
        data: {
          updateSsoConnection: {
            ssoConnection: {
              ...mockSSOConnection,
              name: 'Updated Name',
            },
          },
        },
      },
    };

    const { result } = renderHook(
      () => useSSOConnections(mockTenantId),
      { wrapper: wrapper([mockGetConnectionsResponse, updateMock]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.updateConnection).toBeDefined();
  });

  it('should delete SSO connection', async () => {
    const deleteMock: MockedResponse = {
      request: {
        query: DELETE_SSO_CONNECTION,
        variables: {
          input: { id: 'sso-conn-1' },
        },
      },
      result: {
        data: {
          deleteSsoConnection: {
            deleted: true,
          },
        },
      },
    };

    const { result } = renderHook(
      () => useSSOConnections(mockTenantId),
      { wrapper: wrapper([mockGetConnectionsResponse, deleteMock]) }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.deleteConnection).toBeDefined();
  });

  it('should not fetch when tenantId is empty', () => {
    const { result } = renderHook(
      () => useSSOConnections(''),
      { wrapper: wrapper([]) }
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.connections).toEqual([]);
  });
});

