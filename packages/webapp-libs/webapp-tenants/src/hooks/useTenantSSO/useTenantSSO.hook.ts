import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@sb/webapp-api-client/graphql';

const SSO_CONNECTIONS_QUERY = gql(`
  query TenantSecuritySSOConnectionsQuery($tenantId: ID!) {
    ssoConnections(tenantId: $tenantId, first: 50) {
      edges {
        node {
          id
          name
          connectionType
          status
          allowedDomains
          enforceSso
          jitProvisioningEnabled
          samlEntityId
          samlSsoUrl
          oidcIssuer
          oidcClientId
          lastLoginAt
          loginCount
          createdAt
          spMetadataUrl
          spAcsUrl
          spEntityId
          oidcCallbackUrl
          oidcLoginUrl
        }
      }
    }
  }
`);

const CREATE_SSO_CONNECTION = gql(`
  mutation TenantSecurityCreateSSOConnection($input: CreateSSOConnectionMutationInput!) {
    createSsoConnection(input: $input) {
      ssoConnection {
        id
        name
        connectionType
        status
        spMetadataUrl
        spAcsUrl
        spEntityId
        oidcCallbackUrl
        oidcLoginUrl
      }
    }
  }
`);

const DELETE_SSO_CONNECTION = gql(`
  mutation TenantSecurityDeleteSSOConnection($input: DeleteSSOConnectionMutationInput!) {
    deleteSsoConnection(input: $input) {
      deletedIds
    }
  }
`);

const ACTIVATE_SSO_CONNECTION = gql(`
  mutation TenantSecurityActivateSSOConnection($input: ActivateSSOConnectionMutationInput!) {
    activateSsoConnection(input: $input) {
      ssoConnection {
        id
        status
      }
    }
  }
`);

const DEACTIVATE_SSO_CONNECTION = gql(`
  mutation TenantSecurityDeactivateSSOConnection($id: ID!, $tenantId: ID!) {
    deactivateSsoConnection(id: $id, tenantId: $tenantId) {
      ssoConnection {
        id
        status
      }
    }
  }
`);

const UPDATE_SSO_CONNECTION = gql(`
  mutation TenantSecurityUpdateSSOConnection($input: UpdateSSOConnectionMutationInput!) {
    updateSsoConnection(input: $input) {
      ssoConnection {
        id
        name
        connectionType
        status
        enforceSso
        spMetadataUrl
        spAcsUrl
        spEntityId
        oidcCallbackUrl
      }
    }
  }
`);

const TEST_SSO_CONNECTION = gql(`
  mutation TenantSecurityTestSSOConnection($id: ID!, $tenantId: ID!) {
    testSsoConnection(id: $id, tenantId: $tenantId) {
      result {
        connectionId
        connectionName
        connectionType
        overallStatus
        testedAt
        checks {
          name
          status
          message
          details
        }
      }
    }
  }
`);

export function useTenantSSO(tenantId: string | undefined) {
  const { data, loading, error, refetch } = useQuery(SSO_CONNECTIONS_QUERY, {
    variables: { tenantId: tenantId ?? '' },
    skip: !tenantId,
  });

  const [createConnection, { loading: creating }] = useMutation(CREATE_SSO_CONNECTION, {
    onCompleted: () => refetch(),
  });

  const [updateConnection, { loading: updating }] = useMutation(UPDATE_SSO_CONNECTION, {
    onCompleted: () => refetch(),
  });

  const [deleteConnection] = useMutation(DELETE_SSO_CONNECTION, {
    onCompleted: () => refetch(),
  });

  const [activateConnection] = useMutation(ACTIVATE_SSO_CONNECTION, {
    onCompleted: () => refetch(),
  });

  const [deactivateConnection] = useMutation(DEACTIVATE_SSO_CONNECTION, {
    onCompleted: () => refetch(),
  });

  const [testConnection, { loading: testing }] = useMutation(TEST_SSO_CONNECTION);

  const edges = data?.ssoConnections?.edges ?? [];
  const rawConnections = edges.flatMap((edge) => (edge?.node ? [edge.node] : []));
  const parseAllowedDomains = (val: unknown): string[] => {
    if (Array.isArray(val)) return val.filter((v): v is string => typeof v === 'string');
    if (typeof val === 'string') {
      try {
        const parsed = JSON.parse(val) as unknown;
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  const connections = rawConnections.map((c) => ({
    ...c,
    isActive: String((c as { status?: string }).status ?? '').toLowerCase() === 'active',
    isSaml: ((c as { connectionType?: string }).connectionType ?? '').toLowerCase() === 'saml',
    isOidc: ((c as { connectionType?: string }).connectionType ?? '').toLowerCase() === 'oidc',
    allowedDomains: parseAllowedDomains((c as { allowedDomains?: unknown }).allowedDomains),
  }));

  return {
    connections,
    loading,
    error,
    refetch,
    createConnection,
    creating,
    updateConnection,
    updating,
    deleteConnection,
    activateConnection,
    deactivateConnection,
    testConnection,
    testing,
  };
}
