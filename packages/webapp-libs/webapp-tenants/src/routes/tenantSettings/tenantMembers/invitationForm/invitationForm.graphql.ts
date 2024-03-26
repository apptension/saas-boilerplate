import { gql } from '@sb/webapp-api-client/graphql';

export const createTenantInvitation = gql(/* GraphQL */ `
  mutation createTenantInvitationMutation($input: CreateTenantInvitationMutationInput!) {
    createTenantInvitation(input: $input) {
      email
      role
    }
  }
`);
