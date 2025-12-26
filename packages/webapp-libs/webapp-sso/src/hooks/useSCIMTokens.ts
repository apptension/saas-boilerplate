import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@sb/webapp-api-client/graphql';

export const SCIM_TOKENS_QUERY = gql(`
  query SCIMTokensQuery($tenantId: ID!) {
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

export const CREATE_SCIM_TOKEN = gql(`
  mutation CreateSCIMToken($input: CreateSCIMTokenMutationInput!) {
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

export const REVOKE_SCIM_TOKEN = gql(`
  mutation RevokeSCIMToken($id: ID!) {
    revokeScimToken(id: $id) {
      ok
    }
  }
`);

export function useSCIMTokens(tenantId: string) {
  const { data, loading, error, refetch } = useQuery(SCIM_TOKENS_QUERY, {
    variables: { tenantId },
  });

  const [createToken, { loading: creating }] = useMutation(CREATE_SCIM_TOKEN, {
    onCompleted: () => refetch(),
  });

  const [revokeToken] = useMutation(REVOKE_SCIM_TOKEN, {
    onCompleted: () => refetch(),
  });

  return {
    tokens: data?.scimTokens?.edges?.map((edge: any) => edge.node) || [],
    loading,
    error,
    refetch,
    createToken,
    creating,
    revokeToken,
  };
}

