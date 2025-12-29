import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@sb/webapp-api-client/graphql';

export const PASSKEYS_QUERY = gql(`
  query PasskeysQuery {
    myPasskeys(first: 20) {
      edges {
        node {
          id
          name
          authenticatorType
          transports
          isActive
          lastUsedAt
          useCount
          createdAt
        }
      }
    }
  }
`);

export const RENAME_PASSKEY = gql(`
  mutation RenamePasskey($id: ID!, $name: String!) {
    renamePasskey(id: $id, name: $name) {
      passkey {
        id
        name
      }
    }
  }
`);

export const DELETE_PASSKEY = gql(`
  mutation DeletePasskey($input: DeletePasskeyMutationInput!) {
    deletePasskey(input: $input) {
      deletedIds
    }
  }
`);

export function usePasskeys() {
  const { data, loading, error, refetch } = useQuery(PASSKEYS_QUERY);

  const [renamePasskey] = useMutation(RENAME_PASSKEY, {
    onCompleted: () => refetch(),
  });

  const [deletePasskey] = useMutation(DELETE_PASSKEY, {
    onCompleted: () => refetch(),
  });

  return {
    passkeys: data?.myPasskeys?.edges?.map((edge: any) => edge.node) || [],
    loading,
    error,
    refetch,
    renamePasskey,
    deletePasskey,
  };
}

