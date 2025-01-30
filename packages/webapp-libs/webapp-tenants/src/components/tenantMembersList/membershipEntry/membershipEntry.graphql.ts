import { gql } from '@sb/webapp-api-client/graphql';

export const updateTenantMembershipMutation = gql(/* GraphQL */ `
  mutation updateTenantMembershipMutation($input: UpdateTenantMembershipMutationInput!) {
    updateTenantMembership(input: $input) {
      tenantMembership {
        ...commonQueryMembershipFragment
      }
    }
  }
`);

export const deleteTenantMembershipMutation = gql(/* GraphQL */ `
  mutation deleteTenantMembershipMutation($input: DeleteTenantMembershipMutationInput!) {
    deleteTenantMembership(input: $input) {
      deletedIds
      clientMutationId
    }
  }
`);
