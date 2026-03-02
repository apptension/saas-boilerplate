import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@sb/webapp-api-client/graphql';

const TENANT_PASSKEYS_QUERY = gql(`
  query TenantPasskeysQuery($tenantId: ID!, $search: String) {
    tenantPasskeys(tenantId: $tenantId, search: $search) {
      id
      name
      authenticatorType
      createdAt
      lastUsedAt
      useCount
      userEmail
      userName
    }
  }
`);

const MY_PASSKEYS_QUERY = gql(`
  query MyPasskeysQuery {
    myPasskeys(first: 50) {
      edges {
        node {
          id
          name
          authenticatorType
          createdAt
          lastUsedAt
          useCount
        }
      }
    }
  }
`);

const DELETE_PASSKEY = gql(`
  mutation TenantSecurityDeletePasskey($input: DeletePasskeyMutationInput!) {
    deletePasskey(input: $input) {
      deletedIds
    }
  }
`);

const DELETE_TENANT_PASSKEY = gql(`
  mutation TenantSecurityDeleteTenantPasskey($id: ID!, $tenantId: ID!) {
    deleteTenantPasskey(id: $id, tenantId: $tenantId) {
      ok
    }
  }
`);

export function useTenantPasskeys(tenantId: string | undefined, canManagePasskeys: boolean, searchQuery?: string) {
  const tenantQuery = useQuery(TENANT_PASSKEYS_QUERY, {
    variables: { tenantId: tenantId ?? '', search: searchQuery || undefined },
    skip: !canManagePasskeys || !tenantId,
  });

  const myQuery = useQuery(MY_PASSKEYS_QUERY, {
    skip: canManagePasskeys,
  });

  const [deletePasskey] = useMutation(DELETE_PASSKEY, {
    onCompleted: () => {
      if (canManagePasskeys) tenantQuery.refetch();
      else myQuery.refetch();
    },
  });

  const [deleteTenantPasskey] = useMutation(DELETE_TENANT_PASSKEY, {
    onCompleted: () => tenantQuery.refetch(),
  });

  type PasskeyNode = { id: string; name: string; authenticatorType: string; createdAt: unknown; lastUsedAt?: unknown; useCount: number; userEmail?: string; userName?: string };
  const rawTenantPasskeys = tenantQuery.data?.tenantPasskeys ?? [];
  const tenantPasskeysList = rawTenantPasskeys.filter((p): p is PasskeyNode => !!p && typeof (p as PasskeyNode).id === 'string');
  const myPasskeysEdges = myQuery.data?.myPasskeys?.edges ?? [];
  const myPasskeysList = myPasskeysEdges
    .filter((edge): edge is { node: PasskeyNode } => !!edge?.node)
    .map((edge) => edge.node);
  const passkeys: PasskeyNode[] = canManagePasskeys ? tenantPasskeysList : myPasskeysList;

  const loading = canManagePasskeys ? tenantQuery.loading : myQuery.loading;

  return {
    passkeys,
    loading,
    refetch: canManagePasskeys ? tenantQuery.refetch : myQuery.refetch,
    deletePasskey,
    deleteTenantPasskey,
  };
}
