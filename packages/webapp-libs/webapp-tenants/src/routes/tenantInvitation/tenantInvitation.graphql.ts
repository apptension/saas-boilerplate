import { gql } from '@sb/webapp-api-client/graphql';

export const acceptTenantInvitationMutation = gql(/* GraphQL */ `
  mutation acceptTenantInvitationMutation($input: AcceptTenantInvitationMutationInput!) {
    acceptTenantInvitation(input: $input) {
      ok
    }
  }
`);

export const declineTenantInvitationMutation = gql(/* GraphQL */ `
  mutation declineTenantInvitationMutation($input: DeclineTenantInvitationMutationInput!) {
    declineTenantInvitation(input: $input) {
      ok
    }
  }
`);
