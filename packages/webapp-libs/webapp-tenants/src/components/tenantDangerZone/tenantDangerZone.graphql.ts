import { gql } from '@sb/webapp-api-client/graphql';


export const deleteTenantMutation = gql(/* GraphQL */ `
  mutation deleteTenantMutation($input: DeleteTenantMutationInput!) {
    deleteTenant(input: $input) {
      deletedIds
      clientMutationId
    }
  }
`);