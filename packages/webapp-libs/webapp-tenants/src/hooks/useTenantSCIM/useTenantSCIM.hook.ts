import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@sb/webapp-api-client/graphql';

const SCIM_TOKENS_QUERY = gql(`
  query TenantSCIMTokensQuery {
    scimTokens(first: 50) {
      edges {
        node {
          id
          name
          tokenPrefix
          isActive
          expiresAt
          lastUsedAt
          lastUsedIp
          requestCount
          createdAt
        }
      }
    }
  }
`);

const CREATE_SCIM_TOKEN = gql(`
  mutation TenantSecurityCreateSCIMToken($input: CreateSCIMTokenMutationInput!) {
    createScimToken(input: $input) {
      scimToken {
        id
        name
        tokenPrefix
      }
      rawToken
    }
  }
`);

const REVOKE_SCIM_TOKEN = gql(`
  mutation TenantSecurityRevokeSCIMToken($id: ID!) {
    revokeScimToken(id: $id) {
      ok
    }
  }
`);

export function useTenantSCIM(tenantId: string | undefined) {
  const { data, loading, error, refetch } = useQuery(SCIM_TOKENS_QUERY, {
    skip: !tenantId,
  });

  const [createToken, { loading: creating }] = useMutation(CREATE_SCIM_TOKEN, {
    onCompleted: () => refetch(),
  });

  const [revokeToken] = useMutation(REVOKE_SCIM_TOKEN, {
    onCompleted: () => refetch(),
  });

  type TokenNode = { id: string; name: string; tokenPrefix: string; isActive: boolean; expiresAt?: unknown; lastUsedAt?: unknown; lastUsedIp?: string; requestCount: number; createdAt: unknown };
  const edges = data?.scimTokens?.edges ?? [];
  const tokens: TokenNode[] = edges
    .filter((edge): edge is { node: TokenNode } => !!edge?.node)
    .map((edge) => edge.node);

  return {
    tokens,
    loading,
    error,
    refetch,
    createToken,
    creating,
    revokeToken,
  };
}
