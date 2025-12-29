import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@sb/webapp-api-client/graphql';

export const SSO_CONNECTIONS_QUERY = gql(`
  query SSOConnectionsQuery($tenantId: ID!) {
    ssoConnections(first: 50) {
      edges {
        node {
          id
          name
          connectionType
          status
          allowedDomains
          jitProvisioningEnabled
          samlEntityId
          samlSsoUrl
          oidcIssuer
          oidcClientId
          lastLoginAt
          loginCount
          createdAt
          spMetadataUrl
        }
      }
    }
  }
`);

export const CREATE_SSO_CONNECTION = gql(`
  mutation CreateSSOConnection($input: CreateSSOConnectionMutationInput!) {
    createSsoConnection(input: $input) {
      ssoConnection {
        id
        name
        connectionType
        status
      }
    }
  }
`);

export const UPDATE_SSO_CONNECTION = gql(`
  mutation UpdateSSOConnection($input: UpdateSSOConnectionMutationInput!) {
    updateSsoConnection(input: $input) {
      ssoConnection {
        id
        name
        connectionType
        status
      }
    }
  }
`);

export const ACTIVATE_SSO_CONNECTION = gql(`
  mutation ActivateSSOConnection($input: ActivateSSOConnectionMutationInput!) {
    activateSsoConnection(input: $input) {
      ssoConnection {
        id
        status
      }
    }
  }
`);

export const DEACTIVATE_SSO_CONNECTION = gql(`
  mutation DeactivateSSOConnection($id: ID!) {
    deactivateSsoConnection(id: $id) {
      ssoConnection {
        id
        status
      }
    }
  }
`);

export const DELETE_SSO_CONNECTION = gql(`
  mutation DeleteSSOConnection($input: DeleteSSOConnectionMutationInput!) {
    deleteSsoConnection(input: $input) {
      deletedIds
    }
  }
`);

export function useSSOConnections(tenantId: string) {
  const { data, loading, error, refetch } = useQuery(SSO_CONNECTIONS_QUERY, {
    variables: { tenantId },
  });

  const [createConnection, { loading: creating }] = useMutation(CREATE_SSO_CONNECTION, {
    onCompleted: () => refetch(),
  });

  const [updateConnection, { loading: updating }] = useMutation(UPDATE_SSO_CONNECTION, {
    onCompleted: () => refetch(),
  });

  const [activateConnection] = useMutation(ACTIVATE_SSO_CONNECTION, {
    onCompleted: () => refetch(),
  });

  const [deactivateConnection] = useMutation(DEACTIVATE_SSO_CONNECTION, {
    onCompleted: () => refetch(),
  });

  const [deleteConnection] = useMutation(DELETE_SSO_CONNECTION, {
    onCompleted: () => refetch(),
  });

  return {
    connections: data?.ssoConnections?.edges?.map((edge: any) => edge.node) || [],
    loading,
    error,
    refetch,
    createConnection,
    creating,
    updateConnection,
    updating,
    activateConnection,
    deactivateConnection,
    deleteConnection,
  };
}

