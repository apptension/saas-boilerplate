import { gql } from '@sb/webapp-api-client/graphql';

export const commonQueryCurrentUserFragment = gql(/* GraphQL */ `
  fragment commonQueryCurrentUserFragment on CurrentUserType {
    id
    email
    firstName
    lastName
    roles
    avatar
  }
`);

export const commonQueryCurrentUserQuery = gql(/* GraphQL */ `
  query commonQueryCurrentUserQuery {
    currentUser {
      ...commonQueryCurrentUserFragment
    }
  }
`);
