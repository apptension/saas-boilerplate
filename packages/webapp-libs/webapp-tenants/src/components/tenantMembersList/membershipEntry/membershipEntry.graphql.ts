import { gql } from '@sb/webapp-api-client/graphql';

export const updateTenantMembershipMutation = gql(/* GraphQL */ `
  mutation updateTenantMembershipMutation($input: UpdateTenantMembershipMutationInput!) {
    updateTenantMembership(input: $input) {
      tenantMembership {
        id
      }
    }
  }
`);
