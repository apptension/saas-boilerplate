import { gql } from '@sb/webapp-api-client/graphql';



export const removeTenantMutation = gql(/* GraphQL */ `
  mutation removeTenantMutation($input: DeleteTenantMutationInput!) {
    deleteTenant(input: $input) {
      deletedIds
      clientMutationId
    }
  }
`);
