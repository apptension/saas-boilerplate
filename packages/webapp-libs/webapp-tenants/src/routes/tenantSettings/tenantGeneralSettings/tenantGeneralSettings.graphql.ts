import { gql } from '@sb/webapp-api-client/graphql';

export const updateTenantMutation = gql(/* GraphQL */ `
  mutation updateTenantMutation($input: UpdateTenantMutationInput!) {
    updateTenant(input: $input) {
      tenant {
        id
        name
      }
    }
  }
`);
